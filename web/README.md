# GUI Failure Lab — Web

The Next.js app in the `gui-failure-lab` suite: one route per failure, each
switchable between a correct **baseline** and a defective **faulty**
rendering, for testing how AI agents behave against a broken UI.

Part of the `gui-failure-lab` repo — see [the root README](../README.md) for
how this fits alongside the mobile and desktop apps.

---

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4. No backend or
database — purely server/static-rendered UI.

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the index page lists
every implemented failure, linking to `/failures/<failure-id>`.

Other scripts: `npm run build`, `npm run start` (production server),
`npm run lint`.

---

## Switching baseline / faulty

Which variant every route renders is decided **once, globally, at server
start**, via the `FAULT_MODE` environment variable — not per-request or per
URL. Set it before starting the dev server, e.g. in `.env.local`:

```
FAULT_MODE=faulty
```

or inline:

```bash
FAULT_MODE=faulty npm run dev
```

Omit it (or set `FAULT_MODE=baseline`) for the correct behavior. A single
running instance always serves one condition — to compare both, run two
instances (or restart with a different value).

When the faulty condition is active, the page also embeds a hidden
machine-readable marker (an HTML comment carrying the defect code) that a
test harness can scrape to confirm which defect was actually exercised.

---

## Task list

`tasks.yaml` in this directory is the contract with the external agent
harness: one entry per implemented failure, pairing a task instruction with
the failure's URL and its expected defect code.
