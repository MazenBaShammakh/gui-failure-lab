#!/usr/bin/env python3
"""Capture a screenshot of every expo-router route on a connected Android device.

Routes are enumerated from the filesystem (app/**/*.tsx) and driven directly by
deep link (`mobile://<route>`), rather than crawled by tapping. That reaches
every screen -- including the ones whose entry points are deliberately broken
(dead controls, gesture-only actions, elements missing from the a11y tree) and
which no tap-driven crawler can get to -- and names each file after its route.

Each capture is a full-screen `screencap`, so system windows composited over the
app are included. That matters for cta-below-keyboard, whose soft keyboard is an
IME window outside the app's own view hierarchy and would be missing from any
view-based capture.

Usage:
    python scripts/capture_screens.py                    # both modes, hero products
    python scripts/capture_screens.py --mode baseline
    python scripts/capture_screens.py --products all
    python scripts/capture_screens.py --routes shop mail  # only these sections

Requires a dev build installed on the device (`npx expo run:android`); Expo Go
will not answer the `mobile://` scheme.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from contextlib import nullcontext
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

PACKAGE = "com.mazenbashammakh.mobile"
SCHEME = "mobile"

MOBILE_DIR = Path(__file__).resolve().parent.parent
APP_DIR = MOBILE_DIR / "app"

# Params for the three dynamic routes. Each hero id branches to a dedicated
# failure screen; the plain ids render the generic detail view. Ids that are not
# in these lists render a "not found" state, so they are not worth capturing.
HERO_PRODUCT_ID = "12"
HERO_JOB_ID = "acme"
DYNAMIC_IDS = {
    "/shop/product/[id]": {
        "hero": [HERO_PRODUCT_ID, "1"],
        "all": [str(i) for i in range(1, 13)],
    },
    "/careers/job/[id]": {
        "hero": [HERO_JOB_ID, "1"],
        "all": [HERO_JOB_ID] + [str(i) for i in range(1, 6)],
    },
    # Only these two ids render a real player screen.
    "/music/player/[id]": {"hero": ["midnight", "ocean"], "all": ["midnight", "ocean"]},
}

SETTLE_POLL_S = 0.35
SETTLE_STABLE_HITS = 2
SETTLE_TIMEOUT_S = 12.0


# --------------------------------------------------------------------------- adb


class AdbError(RuntimeError):
    pass


@dataclass
class Adb:
    binary: str
    serial: str | None = None

    def _base(self) -> list[str]:
        cmd = [self.binary]
        if self.serial:
            cmd += ["-s", self.serial]
        return cmd

    def run(self, *args: str, check: bool = True, timeout: int = 60) -> str:
        proc = subprocess.run(
            self._base() + list(args),
            capture_output=True,
            timeout=timeout,
        )
        if check and proc.returncode != 0:
            raise AdbError(
                f"adb {' '.join(args)} failed ({proc.returncode}): "
                f"{proc.stderr.decode('utf-8', 'replace').strip()}"
            )
        return proc.stdout.decode("utf-8", "replace")

    def shell(self, command: str, check: bool = True) -> str:
        return self.run("shell", command, check=check)

    def raw(self, *args: str, timeout: int = 60) -> bytes:
        """Run a command capturing binary stdout (exec-out, for screencap)."""
        proc = subprocess.run(
            self._base() + list(args), capture_output=True, timeout=timeout
        )
        if proc.returncode != 0:
            raise AdbError(
                f"adb {' '.join(args)} failed: "
                f"{proc.stderr.decode('utf-8', 'replace').strip()}"
            )
        return proc.stdout


def resolve_adb(explicit: str | None) -> str:
    if explicit:
        return explicit
    found = shutil.which("adb")
    if found:
        return found
    fallback = (
        Path(os.environ.get("LOCALAPPDATA", ""))
        / "Android"
        / "Sdk"
        / "platform-tools"
        / "adb.exe"
    )
    if fallback.exists():
        return str(fallback)
    raise SystemExit("adb not found on PATH. Pass --adb <path to adb>.")


def pick_device(adb: Adb) -> str:
    lines = adb.run("devices").splitlines()[1:]
    devices = [ln.split("\t")[0] for ln in lines if ln.strip().endswith("device")]
    if not devices:
        raise SystemExit(
            "No device attached. Connect a device or start an emulator, then "
            "confirm with `adb devices`."
        )
    if len(devices) > 1 and not adb.serial:
        raise SystemExit(
            f"Multiple devices attached ({', '.join(devices)}). Pass --device <serial>."
        )
    return adb.serial or devices[0]


# ------------------------------------------------------------------- route model


@dataclass
class Route:
    """A concrete, navigable route path."""

    path: str  # e.g. "/shop/product/12"
    source: str  # originating file pattern, e.g. "/shop/product/[id]"

    @property
    def url(self) -> str:
        if self.path == "/":
            return f"{SCHEME}:///"
        return f"{SCHEME}://{self.path.lstrip('/')}"

    @property
    def slug(self) -> str:
        if self.path == "/":
            return "index"
        return self.path.strip("/").replace("/", "__")


def discover_routes(products: str, sections: list[str] | None) -> list[Route]:
    if not APP_DIR.is_dir():
        raise SystemExit(f"Route directory not found: {APP_DIR}")

    patterns: list[str] = []
    for file in sorted(APP_DIR.rglob("*.tsx")):
        if file.name == "_layout.tsx":
            continue
        rel = file.relative_to(APP_DIR).with_suffix("").as_posix()
        route = "/" + rel
        if route.endswith("/index"):
            route = route[: -len("index")]
        if route != "/" and route.endswith("/"):
            route = route.rstrip("/")
        patterns.append(route or "/")

    routes: list[Route] = []
    for pattern in sorted(set(patterns)):
        if "[" in pattern:
            ids = DYNAMIC_IDS.get(pattern, {}).get(products)
            if not ids:
                print(f"  ! no ids configured for {pattern}, skipping", file=sys.stderr)
                continue
            for value in ids:
                routes.append(Route(re.sub(r"\[.*?\]", value, pattern), pattern))
        else:
            routes.append(Route(pattern, pattern))

    if sections:
        wanted = {s.strip("/") for s in sections}
        routes = [r for r in routes if r.path.strip("/").split("/")[0] in wanted]
    return routes


# ----------------------------------------------------------------- device state


class DevicePrep:
    """Freeze the status bar and animations so shots differ only by app content."""

    ANIM_KEYS = (
        "window_animation_scale",
        "transition_animation_scale",
        "animator_duration_scale",
    )

    def __init__(self, adb: Adb, clock: str):
        self.adb = adb
        self.clock = clock
        self.saved_anim: dict[str, str] = {}

    def _demo(self, *args: str) -> None:
        self.adb.shell(
            "am broadcast -a com.android.systemui.demo " + " ".join(args), check=False
        )

    def __enter__(self) -> "DevicePrep":
        self.adb.shell("input keyevent KEYCODE_WAKEUP", check=False)
        self.adb.shell("wm dismiss-keyguard", check=False)

        for key in self.ANIM_KEYS:
            self.saved_anim[key] = (
                self.adb.shell(f"settings get global {key}", check=False).strip() or "1"
            )
            self.adb.shell(f"settings put global {key} 0", check=False)

        self.adb.shell("cmd notification set_dnd priority", check=False)

        self.adb.shell("settings put global sysui_demo_allowed 1", check=False)
        self._demo("-e command enter")
        # 0941 matches the hardcoded 9:41 in the app's own fake status bar.
        self._demo(f"-e command clock -e hhmm {self.clock}")
        self._demo("-e command battery -e level 100 -e plugged false")
        self._demo("-e command notifications -e visible false")
        self._demo("-e command network -e wifi show -e level 4")
        self._demo("-e command network -e mobile show -e level 4 -e datatype none")
        return self

    def __exit__(self, *_exc) -> None:
        self._demo("-e command exit")
        self.adb.shell("cmd notification set_dnd off", check=False)
        for key, value in self.saved_anim.items():
            restore = value if value not in ("", "null") else "1"
            self.adb.shell(f"settings put global {key} {restore}", check=False)


# --------------------------------------------------------------- ui interaction


def dump_hierarchy(adb: Adb) -> str:
    """Return the uiautomator XML for the current screen ('' if unavailable)."""
    try:
        out = adb.raw("exec-out", "uiautomator", "dump", "/dev/tty", timeout=30)
        text = out.decode("utf-8", "replace")
    except (AdbError, subprocess.TimeoutExpired):
        text = ""

    if "</hierarchy>" not in text:
        try:
            adb.shell("uiautomator dump /sdcard/_cap.xml", check=False)
            text = adb.raw("exec-out", "cat", "/sdcard/_cap.xml", timeout=30).decode(
                "utf-8", "replace"
            )
        except (AdbError, subprocess.TimeoutExpired):
            return ""

    start, end = text.find("<?xml"), text.rfind("</hierarchy>")
    if start == -1 or end == -1:
        return ""
    return text[start : end + len("</hierarchy>")]


def wait_for_settle(adb: Adb, timeout: float = SETTLE_TIMEOUT_S) -> tuple[str, bool]:
    """Poll the hierarchy until it stops changing.

    Returns (xml, settled). A fixed sleep would capture skeletons on the
    late-render screens and pre-hydration frames right after a cold start, since
    fault mode is read from AsyncStorage only after mount.
    """
    deadline = time.monotonic() + timeout
    last_hash, hits, xml = None, 0, ""
    while time.monotonic() < deadline:
        xml = dump_hierarchy(adb)
        digest = hashlib.sha1(xml.encode("utf-8")).hexdigest() if xml else None
        if digest and digest == last_hash:
            hits += 1
            if hits >= SETTLE_STABLE_HITS:
                return xml, True
        else:
            hits = 0
        last_hash = digest
        time.sleep(SETTLE_POLL_S)
    return xml, False


BOUNDS_RE = re.compile(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]")


def find_node_center(xml: str, *, desc: str) -> tuple[int, int] | None:
    if not xml:
        return None
    try:
        root = ET.fromstring(xml)
    except ET.ParseError:
        return None
    for node in root.iter("node"):
        if node.get("content-desc") != desc:
            continue
        match = BOUNDS_RE.match(node.get("bounds", ""))
        if not match:
            continue
        x1, y1, x2, y2 = (int(g) for g in match.groups())
        return (x1 + x2) // 2, (y1 + y2) // 2
    return None


def set_fault_mode(adb: Adb, mode: str) -> None:
    """Flip the global baseline/faulty switch through the Settings UI.

    The mode is deliberately not part of any URL, and on native it lives in
    AsyncStorage, so it cannot be set by deep link -- it has to be tapped.
    """
    label = mode.capitalize()
    open_route(adb, Route("/settings", "/settings"))
    xml, _ = wait_for_settle(adb)

    if f"Current mode: {mode}" in xml:
        print(f"  mode already {mode}")
        return

    center = find_node_center(xml, desc=label)
    if center is None:
        raise AdbError(
            f"Could not find the '{label}' option on /settings. "
            "Is the installed build current?"
        )
    adb.shell(f"input tap {center[0]} {center[1]}")

    xml, _ = wait_for_settle(adb)
    if f"Current mode: {mode}" not in xml:
        raise AdbError(f"Tapped '{label}' but the screen does not report mode={mode}.")
    print(f"  mode set to {mode}")


def open_route(adb: Adb, route: Route, cold: bool = False) -> None:
    if cold:
        adb.shell(f"am force-stop {PACKAGE}", check=False)
    adb.shell(
        f'am start -a android.intent.action.VIEW -d "{route.url}" {PACKAGE}', check=False
    )


def screencap(adb: Adb) -> bytes:
    data = adb.raw("exec-out", "screencap", "-p", timeout=60)
    if not data.startswith(b"\x89PNG"):
        raise AdbError("screencap did not return PNG data")
    return data


# ------------------------------------------------------------------------- main


@dataclass
class Result:
    route: str
    slug: str
    file: str
    settled: bool
    warnings: list[str] = field(default_factory=list)


def capture_mode(
    adb: Adb, routes: list[Route], out_dir: Path, mode: str, args
) -> list[Result]:
    mode_dir = out_dir / mode
    mode_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n=== {mode} -> {mode_dir} ===")
    set_fault_mode(adb, mode)

    results: list[Result] = []
    previous_hash: str | None = None
    previous_slug = ""

    for index, route in enumerate(routes, 1):
        warnings: list[str] = []
        open_route(adb, route, cold=args.cold)
        xml, settled = wait_for_settle(adb)

        if not settled:
            warnings.append("hierarchy never stabilised")

        # An unchanged hierarchy means the deep link probably did not navigate.
        digest = hashlib.sha1(xml.encode("utf-8")).hexdigest() if xml else None
        if digest and digest == previous_hash:
            warnings.append(f"screen identical to previous route ({previous_slug})")
        previous_hash, previous_slug = digest, route.slug

        png = screencap(adb)
        target = mode_dir / f"{route.slug}.png"
        target.write_bytes(png)

        if args.dump_xml and xml:
            (mode_dir / f"{route.slug}.xml").write_text(xml, encoding="utf-8")

        flag = "  !! " + "; ".join(warnings) if warnings else ""
        print(f"  [{index:>3}/{len(routes)}] {route.path}{flag}")
        results.append(Result(route.path, route.slug, target.name, settled, warnings))

    return results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=["both", "baseline", "faulty"], default="both")
    parser.add_argument(
        "--products",
        choices=["hero", "all"],
        default="hero",
        help="hero: the branching id plus one generic. all: every id.",
    )
    parser.add_argument("--out", default=str(MOBILE_DIR / "screenshots"))
    parser.add_argument("--device", help="adb serial, if several are attached")
    parser.add_argument("--adb", help="path to the adb binary")
    parser.add_argument("--clock", default="0941", help="frozen status-bar time (hhmm)")
    parser.add_argument(
        "--routes", nargs="*", help="only capture these top-level sections"
    )
    parser.add_argument(
        "--cold",
        action="store_true",
        help="force-stop before each route. Cleaner isolation, much slower, and "
        "risks capturing the pre-hydration baseline flash in faulty mode.",
    )
    parser.add_argument("--no-dump-xml", dest="dump_xml", action="store_false")
    parser.add_argument("--no-prep", dest="prep", action="store_false")
    args = parser.parse_args()

    adb = Adb(resolve_adb(args.adb), args.device)
    adb.serial = pick_device(adb)
    print(f"device: {adb.serial}")

    if PACKAGE not in adb.shell(f"pm list packages {PACKAGE}", check=False):
        raise SystemExit(
            f"{PACKAGE} is not installed on {adb.serial}.\n"
            "Build and install a dev build first:  npx expo run:android"
        )

    routes = discover_routes(args.products, args.routes)
    if not routes:
        raise SystemExit("No routes matched.")
    modes = ["baseline", "faulty"] if args.mode == "both" else [args.mode]
    print(f"routes: {len(routes)}   modes: {', '.join(modes)}")

    out_dir = Path(args.out)
    run: dict[str, list[Result]] = {}

    prep = DevicePrep(adb, args.clock) if args.prep else nullcontext()
    with prep:
        for mode in modes:
            run[mode] = capture_mode(adb, routes, out_dir, mode, args)

    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "manifest.json").write_text(
        json.dumps(
            {
                "captured_at": datetime.now(timezone.utc).isoformat(),
                "package": PACKAGE,
                "device": adb.serial,
                "products": args.products,
                "modes": {m: [r.__dict__ for r in rs] for m, rs in run.items()},
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    total = sum(len(rs) for rs in run.values())
    flagged = [r for rs in run.values() for r in rs if r.warnings]
    print(f"\n{total} screenshots -> {out_dir}")
    if flagged:
        print(f"{len(flagged)} need review:")
        for r in flagged:
            print(f"  {r.route}: {'; '.join(r.warnings)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
