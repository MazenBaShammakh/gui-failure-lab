# GUI Failure Lab — Mobile

The Expo / React Native app in the `gui-failure-lab` suite: a single
simulated phone with 13 in-app "apps" (Shop, Mail, Music, Banking, ...), each
screen switchable between a correct **baseline** and a defective **faulty**
rendering, for testing how AI agents behave against a broken UI.

Part of the `gui-failure-lab` repo — see [the root README](../README.md) for
how this fits alongside the web and desktop apps.

---

## Stack

Expo SDK 54, Expo Router 6 (file-based routing), React Native 0.81, React 19,
TypeScript. No backend — mock/local data only.

---

## Getting started

```bash
npm install
npm run start
```

This runs `expo start`; follow the CLI output to open the app in Expo Go, an
Android emulator, or an iOS simulator. Every task starts on the Home
springboard, listing all 13 simulated apps plus a Settings screen.

Other scripts (from `package.json`):

- `npm run android` / `npm run ios` — open directly in a connected emulator/device
- `npm run web` — run the same app in a browser via `react-native-web`
- `npm run lint`

---

## Switching baseline / faulty

Unlike the web app, the mode is a **live, in-app toggle**, not an environment
variable — flip it from the Settings screen (gear icon on the Home
springboard). This is deliberate: an agent navigates the app like a real
user and never has to know the mode exists.

The mode persists across screens for the session (`AsyncStorage` on native,
`localStorage` when running via `npm run web`). A harness can also drive the
toggle through the UI directly, or pre-seed `localStorage['gui-lab:mode']`
when targeting the web build.

When the faulty condition is active on a given screen, that screen sets a
`testID="defect:<CODE>"` on its defective element — the mobile equivalent of
web's hidden HTML marker — so a harness can confirm which defect was
exercised.

---

## Task list

`tasks.yaml` in this directory is the contract with the external agent
harness: one entry per implemented failure, naming the task instruction, the
target simulated app, the start/target screen, and the expected defect code.
