# GUI Failure Lab

Realistic web, mobile, and desktop apps that each host a deliberately injected
GUI defect — switchable between a correct **baseline** and a defective
**faulty** variant — for testing how AI agents behave when a GUI is broken in
a specific, known way.

---

## Overview

Each app in this repo implements a set of everyday UI screens (a shop, an
inbox, a settings page, ...) that look and behave like the real thing. Every
screen maps to exactly one catalogued failure — a specific, deliberately
introduced defect (an element missing from the accessibility tree, a
gesture-only control with no visual cue, a modal with no close button, ...).
Each app can run in two conditions:

- **baseline** — the screen behaves correctly.
- **faulty** — the same screen, with its one defect active.

An external harness runs the same task instruction against both conditions
and compares how an AI agent behaves — this repo only serves the UI surface
under test; it never runs an agent or scores anything itself.

---

## Relationship to the other repos

This lab is one of four repos in a research suite studying GUI-agent failure
behavior: `gui-failure-suite` provides the task corpus, `gui-failure-runner`
executes agents against tasks (including the apps in this repo) and produces
run results, and `gui-failure-taxonomy` classifies the resulting failures and
stores the evidence trail.

---

## Repository structure

| Path        | What it is                                                              |
| ----------- | ------------------------------------------------------------------------ |
| `web/`      | Next.js app — the primary, most-developed platform. Own setup below.       |
| `mobile/`   | Expo / React Native app simulating a full phone. Own setup below.           |
| `desktop/`  | WPF (.NET) app, early-stage. Own setup below.                                |
| `taxonomy/` | A reference copy of the failure taxonomy, cross-checked against the apps' own failure catalogs. |
| `thesis/`   | Thesis-facing writeups derived from this repo.                                |
| `specs/`    | Planning and requirements documents.                                            |
| `docs/`     | Supporting reference material.                                                   |

**Note:** `web/`, `mobile/`, and `desktop/` are each fully independent
projects — their own `package.json`/lockfile/`node_modules` (or `.csproj`).
The root `package.json`'s `workspaces` field is unused legacy scaffolding
from an earlier design and doesn't wire the three apps together — there is no
single top-level `npm install` or `npm run dev` that starts all three; each
is installed and run separately, from its own directory.

---

## Getting started

Each app has its own README with exact setup and run instructions:

- **[web/README.md](web/README.md)** — Next.js, `npm run dev`
- **[mobile/README.md](mobile/README.md)** — Expo, `npx expo start`
- **[desktop/README.md](desktop/README.md)** — .NET/WPF, `dotnet run` (Windows only)
