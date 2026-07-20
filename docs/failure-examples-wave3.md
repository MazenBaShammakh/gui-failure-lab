# Mobile Failure Lab — Wave 3 (F1–F9 taxonomy sweep)

**Status:** spec / planning only — no code yet.
**Source:** F1.1–F9.3 failure list supplied 2026-07-13 (React Native / Expo scope).
**Goal:** work out which of the 33 supplied failures are already reproduced by the
existing lab (75 `components/failures/*`, see `tasks.yaml` + `failure-examples-expansion.md`),
and spec the ones that aren't, following the exact conventions already in use.

---

## 1. Conventions (unchanged from wave 1/2)

- **One global switch.** Screens read `useFaultMode()` from `lib/fault-mode.tsx`.
  `baseline` = correct behavior, `faulty` = defective variant. No URL params.
- **Defect marker.** Faulty root carries `testID={'defect:<CODE>'}`, present only
  when `faultActive` is true.
- **File shape per failure:** `components/failures/<kebab-slug>/{Screen.tsx,index.ts}`
  + a thin route file `app/<app>/<screen>.tsx` that re-exports it + reachable via
  a card on that app's `/<app>/home` hub (`components/nav/AppHub`) or its
  existing nav flow.
- **`tasks.yaml` entry** per failure: `task`, `app`, `start_route: /`,
  `target_screen`, `defect: <CODE>` (with a `# F#.#` comment tying back to the
  source taxonomy id).

---

## 2. Coverage audit — which F-codes already exist

18 of the 33 supplied failures already have a close-to-exact implementation in
the lab. Re-implementing these would be redundant (the repo's existing pattern
already reproduces some failures in >1 app on purpose — e.g. non-clickable CTA
exists in both Shop and Careers — but that's a deliberate "same pattern, new
context" choice, not a gap). Listed here for traceability; **no new work
proposed for these** unless you want another app-context variant.

| F-code | Failure | Already implemented as |
|---|---|---|
| F1.1 | Ghost element in a11y tree | `M_GHOST_ELEMENTS_FEED` (E01), `M_GHOST_ELEMENTS_CAROUSEL` (E02) — virtualized-list stale nodes, exactly this mechanism. Adjacent: `B_GHOST_ELEMENT_NO_BACKING_NODE` (single off-screen control, not list-virtualization, but same symptom family). |
| F1.2 | WebView opaque to native a11y | `M_WEBVIEW_OPAQUE_A11Y_TREE` (A1) — `/banking/webform` |
| F1.3 | Interactive node hidden by `importantForAccessibility` | `M_NOT_IMPORTANT_FOR_A11Y` (A2) — `/photos/details` |
| F1.4 | System dialog outside app-scoped a11y tree | `M_SYSTEM_DIALOG_OUTSIDE_TREE` (A3) — `/maps/locate` |
| F1.6 | Low color contrast | `M_LOW_CONTRAST_CTA` (P01) — `/shop/deal`; `M_LOW_CONTRAST_CONTROLS` (B11) — `/banking/quickactions` |
| F2.1 | Static element styled as actionable | `B_NON_CLICKABLE_NORMAL_CTA`, `M_NONCLICKABLE_APPLY` (E15); also the entire dead-control matrix M01–M14 uses plain `View`s styled as the real control in several rows (e.g. `M_DEAD_FAB`) |
| F2.4 | Rebrand breaks entity grounding | `M_RENAME_INSTALL_APPSTORE` (E21), `M_RENAME_SETTINGS_APPS` (E22) — Chirp→Zap |
| F2.5 | OS color transform defeats color grounding | `M_COLOR_FILTER_GROUNDING` (B7) — `/shop/color` |
| F3.1 | Recycled-view stale accessible name | `M_RECYCLED_NODE_IDENTITY` (A5) — `/tasks/longlist` |
| F4.1 | Non-standard gesture, no visible cue | Large existing family: E06–E14 (swipe/long-press/pull/double-tap/pinch/drag), plus `B_GESTURE_ONLY_ARCHIVE`, `B_RATING_DRAG_SETTABLE`, `B_REORDER_MOVE_ACTIONS`, `B_HOLD_TO_CONFIRM_DELETE` |
| F7.4 | No visible feedback on action trigger | `B_CLICK_NO_VISIBLE_EFFECT`, `M_SEND_NO_EFFECT` (E18) |
| F8.2 | Slow page load exceeds timing budget | `B_ASYNC_CONTENT_LATE_RENDER`, `M_LATE_RENDER_INBOX` (E30) |
| F9.1 | Blocking modal, no/tiny close affordance | `B_BLOCKING_MODAL_NO_CLOSE`, `M_DEAD_CLOSE_ICON` (M13) |
| F9.2 | Invisible clickable overlay captures input | `M_INVISIBLE_TAP_OVERLAY` (E03), `M_DECOY_OVERLAY_CHECKBOX` (E20) |

That's 14 rows covering 18 F-codes (F4.1 and F1.1/F9.1/F9.2/F1.6/F7.4/F8.2 each
map to 2+ existing examples). **15 F-codes remain unimplemented** — specced below.

---

## 3. New examples to build (15)

| # | F-code | App · route (new) | Failure (short) | Defect code |
|---|---|---|---|---|
| N01 | F2.2 | Music · `/music/lyrics` | Real `onPress` styled as inert caption text | `M_ACTIONABLE_TEXT_STYLED_STATIC` |
| N02 | F2.3 | Mail · `/mail/toolbar` | One icon overloaded with Search + Compose | `M_OVERLOADED_ICON_SEARCH_COMPOSE` |
| N03 | F4.2 | Calendar · `/calendar/location` | Typed combobox value never commits w/o explicit pick | `M_COMBOBOX_UNCOMMITTED_VALUE` |
| N04 | F5.1 | Banking · `/banking/support` | Critical action buried in subtle nested menu, no cue | `M_HIDDEN_NAV_SUBTLE_MENU` |
| N05 | F6.1 | Shop · `/shop/track` | Correct screen, header text ≠ task wording | `M_HEADING_LABEL_MISMATCH` |
| N06 | F6.2 | Careers · `/careers/similar` | Many near-identical list items, no visual distinction | `M_CLUTTERED_SIMILAR_LIST` |
| N07 | F6.3 | Photos · `/photos/album` | No sort/filter; default order ≠ implied ("most recent") | `M_MISSING_SORT_CONTROLS` |
| N08 | F6.4 | App Store · `/appstore/listing` | Listing content renders in unsupported language | `M_UNSUPPORTED_LANGUAGE_CONTENT` |
| N09 | F7.1 | Careers · `/careers/reapply` | Failed submit leaves screen visually unchanged | `M_SILENT_FAILED_SUBMISSION` |
| N10 | F7.2 | Calendar · `/calendar/recurring` | Validation fails with vague "Invalid input" only | `M_VAGUE_VALIDATION_ERROR` |
| N11 | F7.3 | Social · `/social/compose` | Required field has no visible required-marker | `M_REQUIRED_FIELD_NO_INDICATOR` |
| N12 | F7.5 | Dashboard · `/dashboard/activity` | Infinite list, no end-of-content signal | `M_UNBOUNDED_SCROLL_NO_TERMINAL_STATE` |
| N13 | F8.1 | Shop · `/shop/recommended` | Lazy-loaded section not yet mounted at snapshot time | `M_LAZY_SECTION_OUTSIDE_VIEWPORT` |
| N14 | F8.3 | Tasks · `/tasks/sync` | Toast injected after snapshot, tap lands on it instead | `M_POPUP_AFTER_SNAPSHOT` |
| N15 | F9.3 | Dashboard · `/dashboard/alerts` | Overlay visually covers CTA but `pointerEvents:"none"` (non-blocking) | `M_NONBLOCKING_OVERLAY_OCCLUSION` |

**New home-hub cards required:** one card each on `music/home`, `mail/home`,
`calendar` (needs a hub — currently a leaf, see §5), `banking/home`,
`shop/home`, `careers/home`, `photos` (currently a leaf, see §5), `appstore`
(currently a leaf, see §5), `social/home`, `dashboard/home`, `tasks/home`.

---

## 4. Detailed specs

**N01 `M_ACTIONABLE_TEXT_STYLED_STATIC`** (F2.2)
Now-playing-style screen for a track. A "Show lyrics" text sits next to the
track duration. *Baseline:* styled as a link (accent color, underline).
*Faulty:* identical real `Pressable`/`onPress`, but styled exactly like the
plain gray duration caption next to it — visually inert, functionally live.
Task: "In the Music app, open Lyrics and view the lyrics for 'Ocean Breeze'."

**N02 `M_OVERLOADED_ICON_SEARCH_COMPOSE`** (F2.3)
Mail toolbar with a single 🔍 icon. *Baseline:* separate Search and Compose
icons. *Faulty:* one icon toggles between the two modes based on internal
state the agent can't observe from the icon alone; tapping expecting "search"
sometimes opens Compose. Task: "In the Mail app, open Toolbar and search your
inbox for 'invoice'."

**N03 `M_COMBOBOX_UNCOMMITTED_VALUE`** (F4.2)
A location type-ahead field on a "New Event" flow. *Baseline:* typed text
alone commits the value on blur/submit. *Faulty:* the field only commits when
a suggestion is explicitly tapped from the dropdown; typing "Central Park" and
submitting leaves `location` empty with no error. Task: "In the Calendar app,
open New Event, set the location to 'Central Park', and save the event."

**N04 `M_HIDDEN_NAV_SUBTLE_MENU`** (F5.1)
Banking support screen. *Baseline:* "Report fraud" is a top-level visible
action. *Faulty:* it's nested two levels inside a "•••" overflow with no
chevron/badge hinting more items exist below the visible three. Task: "In the
Banking app, open Support and report a fraudulent transaction."

**N05 `M_HEADING_LABEL_MISMATCH`** (F6.1)
Shop "Track Order" flow. *Baseline:* screen header reads "Track Order",
matching the task and the entry point label. *Faulty:* the same, functionally
correct screen has its header replaced with "Shipment Status" — no wording
overlap with the task or entry label. Task: "In the Shop app, open Track Order
and check the delivery status of your package."

**N06 `M_CLUTTERED_SIMILAR_LIST`** (F6.2)
Careers "All Openings" list. *Baseline:* jobs visually differentiated (company
logo colors, role-level badges). *Faulty:* ~15 near-identical "Software
Engineer" rows, same generic building icon, same gray text weight, minimal
distinction — forces a slow manual scan of the correct one. Task: "In the
Careers app, open All Openings and open the Senior Backend Engineer role at
Nimbus Cloud."

**N07 `M_MISSING_SORT_CONTROLS`** (F6.3)
Photos "All Photos" album. *Baseline:* a visible sort control (Newest first)
plus correctly-ordered grid. *Faulty:* no sort/filter UI at all, and the grid's
default order is not chronological — the agent has no way to jump straight to
"most recent" and must scan. Task: "In the Photos app, open the All Photos
album and open the most recently taken photo."

**N08 `M_UNSUPPORTED_LANGUAGE_CONTENT`** (F6.4)
App Store listing detail. *Baseline:* description in English. *Faulty:* the
description/reviews render in German with no translate affordance, blocking a
task that requires reading it. Task: "In the App Store app, open the Notiz app
listing and read its description before installing."

**N09 `M_SILENT_FAILED_SUBMISSION`** (F7.1)
Careers "Reapply" form. *Baseline:* a failed submit shows an error banner and
keeps entered data. *Faulty:* submit silently fails server-side (e.g.
duplicate application) — no banner, no toast, no field-level change; the form
just sits there looking identical to pre-submit, giving no signal the action
didn't go through. Task: "In the Careers app, open Reapply and submit your
application for the DevOps Engineer role."

**N10 `M_VAGUE_VALIDATION_ERROR`** (F7.2)
Calendar "Recurring Event" form. *Baseline:* field-specific errors ("End date
must be after start date"). *Faulty:* any validation failure surfaces only a
generic "Invalid input" with no field reference, giving no actionable signal
to correct it. Task: "In the Calendar app, open Recurring Event and create a
weekly event titled 'Team Sync' starting next Monday."

**N11 `M_REQUIRED_FIELD_NO_INDICATOR`** (F7.3)
Social "Create Post" screen. *Baseline:* the "Audience" selector shows a red
asterisk / "Required" label. *Faulty:* same required field, no visible marker
— posting without selecting an audience is rejected with no prior warning.
Task: "In the Social app, open Create Post and publish a post that says
'Excited for the weekend!'"

**N12 `M_UNBOUNDED_SCROLL_NO_TERMINAL_STATE`** (F7.5)
Dashboard "Activity Log". *Baseline:* list ends with a visible "Beginning of
history" marker once the oldest entry loads. *Faulty:* same finite list, but
no end-of-content signal is ever rendered — the agent can't tell whether it
has reached the oldest entry or should keep scrolling. Task: "In the Dashboard
app, open Activity Log and open the very first entry (the oldest event)."

**N13 `M_LAZY_SECTION_OUTSIDE_VIEWPORT`** (F8.1)
Shop "Recommended" section. *Baseline:* all cards mounted on initial render.
*Faulty:* the section renders an empty placeholder until scrolled into view
(`onViewableItemsChanged`-gated mount) — at snapshot time the target product
is live on the real screen but literally not yet in the tree/pixels. Distinct
from E02 (already-mounted, off-screen ghost nodes): here nothing exists yet.
Task: "In the Shop app, open Recommended and open the 'Wireless Charging
Pad'."

**N14 `M_POPUP_AFTER_SNAPSHOT`** (F8.3)
Tasks "Sync" screen. *Baseline:* no post-load popups; the checkbox stays where
snapshotted. *Faulty:* ~1.5s after mount (after a typical agent snapshot), a
"Sync complete ✓" toast is injected at the exact screen coordinates of the
target checkbox, so a tap planned against the pre-popup snapshot lands on the
toast (its dismiss control) instead of the checkbox underneath. Task: "In the
Tasks app, open Sync and mark 'Submit expense report' as done."

**N15 `M_NONBLOCKING_OVERLAY_OCCLUSION`** (F9.3)
Dashboard "Alerts". *Baseline:* no overlay; Refresh button fully visible.
*Faulty:* a translucent "Syncing…" strip visually covers the Refresh button
but has `pointerEvents="none"`, so taps pass through to the real button
beneath — a vision-only agent can't see/locate the target even though it's
still structurally tappable. (Contrast with existing `M_BANNER_OCCLUDES_CTA`
E04, which uses `pointerEvents="box-only"` and *does* capture the tap — that's
the blocking-overlay case; N15 is deliberately the non-blocking counterpart.)
Task: "In the Dashboard app, open Alerts and refresh the data."

---

## 5. Infrastructure changes needed

- **Calendar** is currently a leaf app (`/calendar/new` only). Adding N03
  (`/calendar/location`) and N10 (`/calendar/recurring`) means it needs a hub:
  convert to `app/calendar/home.tsx` (`AppHub`) with cards for New Event,
  Location, Recurring Event; repoint the Home tile.
- **Photos** is currently leaf-ish (`/photos`, `/photos/viewer`,
  `/photos/details`). Adding N07 (`/photos/album`) similarly argues for a
  `photos/home` hub with cards: Library, Album, Viewer, Details.
- **App Store** is a single screen (`/appstore`). Adding N08
  (`/appstore/listing`) means either linking from the existing list (tap an
  app row → detail) — no hub needed, just a detail route — or a hub if more
  App Store screens are anticipated later. Recommend: just link from the
  existing list, no hub.
- All other new routes (N01, N02, N04–N06, N09, N11, N12, N13, N14, N15) slot
  into existing hubs (`music/home`, `mail/home`, `banking/home`, `shop/home`,
  `careers/home`, `social/home`, `dashboard/home`, `tasks/home`) as one
  additional card each — no structural change.

---

## 6. Open questions before coding

1. **Scope** — build all 15, or a first tranche? (No natural sub-grouping
   priority suggested itself; they're independent.)
2. **Calendar/Photos hub conversion** — OK to add `home.tsx` hubs to these two
   apps (mirrors the existing pattern for Tasks/Mail/Music/etc.), or prefer to
   keep them as flat leaf apps and bolt the new routes onto existing screens
   instead?
3. **App Store N08** — confirm "no hub, just a tap-through detail route" is
   fine, or should App Store also get a hub for consistency with the other 8
   hub apps?
4. **Duplicate-context variants** — for the 18 already-covered F-codes in §2,
   do you want any of them reproduced a second time in a *new* app/context
   (as the repo already does deliberately for a few pairs), or leave as-is?
5. **Taxonomy sync** — once built, should these register back into
   `../taxonomy/mobile.yaml` the same way `failure-examples-expansion.md`
   flags `candidate` entries for promotion?

---

## 7. Implementation todo

Tracking actual build progress against §3/§4. Checked = component + route +
hub card + `tasks.yaml` entry all done.

- [x] N01 `M_ACTIONABLE_TEXT_STYLED_STATIC` (F2.2) — Music · `/music/lyrics`.
      `components/failures/actionable-text-styled-static/`, route wired,
      card added to `music` index's Library section, `tasks.yaml` entry added.
- [x] N02 `M_OVERLOADED_ICON_SEARCH_COMPOSE` (F2.3) — Mail · `/mail/toolbar`.
      `components/failures/overloaded-icon-search-compose/`, route wired,
      card added to `mail/home`, `tasks.yaml` entry added.
- [x] N03 `M_COMBOBOX_UNCOMMITTED_VALUE` (F4.2) — Calendar · `/calendar/location`.
      `components/failures/combobox-uncommitted-value/`, route wired, linked
      directly from `/calendar` index (no separate hub — index is fault-free
      already), `tasks.yaml` entry added.
- [x] N04 `M_HIDDEN_NAV_SUBTLE_MENU` (F5.1) — Banking · `/banking/support`.
      `components/failures/hidden-nav-subtle-menu/`, route wired, card added
      to `banking/home`, `tasks.yaml` entry added.
- [x] N05 `M_HEADING_LABEL_MISMATCH` (F6.1) — Shop · `/shop/track`.
      `components/failures/heading-label-mismatch/`, route wired, card added
      to `shop/home` (hub label stays "Track Order" — only the in-screen
      heading/nav-title mismatches), `tasks.yaml` entry added.
- [x] N06 `M_CLUTTERED_SIMILAR_LIST` (F6.2) — Careers · `/careers/similar`.
      `components/failures/cluttered-similar-list/`, route wired, card added
      to `careers/home`, `tasks.yaml` entry added.
- [x] N07 `M_MISSING_SORT_CONTROLS` (F6.3) — Photos · `/photos/album`.
      `components/failures/missing-sort-controls/`, route wired, card added
      to existing `photos/home` (no new hub needed — one already existed),
      `tasks.yaml` entry added.
- [x] N08 `M_UNSUPPORTED_LANGUAGE_CONTENT` (F6.4) — App Store · `/appstore/listing`.
      `components/failures/unsupported-language-content/`, route wired. Added
      a "Notiz" row to `rename-install-appstore`'s app list (present
      identically in both baseline/faulty app arrays, unaffected by that
      screen's own F2.4 rename fault) whose row links to `/appstore/listing`
      — no hub added, per §5 recommendation. `tasks.yaml` entry added.
- [x] N09 `M_SILENT_FAILED_SUBMISSION` (F7.1) — Careers · `/careers/reapply`.
      `components/failures/silent-failed-submission/`, route wired, card
      added to `careers/home`, `tasks.yaml` entry added.
- [x] N10 `M_VAGUE_VALIDATION_ERROR` (F7.2) — Calendar · `/calendar/recurring`.
      `components/failures/vague-validation-error/`, route wired, linked
      from `/calendar` index, `tasks.yaml` entry added.
- [x] N11 `M_REQUIRED_FIELD_NO_INDICATOR` (F7.3) — Social · `/social/compose`.
      `components/failures/required-field-no-indicator/`, route wired, card
      added to `social/home`, `tasks.yaml` entry added.
- [x] N12 `M_UNBOUNDED_SCROLL_NO_TERMINAL_STATE` (F7.5) — Dashboard · `/dashboard/activity`.
      `components/failures/unbounded-scroll-no-terminal-state/`, route wired
      (manual "Load older" pagination for deterministic testing rather than
      scroll-triggered), card added to `dashboard/home`, `tasks.yaml` entry
      added.
- [x] N13 `M_LAZY_SECTION_OUTSIDE_VIEWPORT` (F8.1) — Shop · `/shop/recommended`.
      `components/failures/lazy-section-outside-viewport/`, route wired
      (scroll-offset gated mount rather than true `onViewableItemsChanged`,
      same observable effect), card added to `shop/home`, `tasks.yaml` entry
      added.
- [x] N14 `M_POPUP_AFTER_SNAPSHOT` (F8.3) — Tasks · `/tasks/sync`.
      `components/failures/popup-after-snapshot/`, route wired, card added
      to `tasks/home`, `tasks.yaml` entry added.
- [x] N15 `M_NONBLOCKING_OVERLAY_OCCLUSION` (F9.3) — Dashboard · `/dashboard/alerts`.
      `components/failures/nonblocking-overlay-occlusion/`, route wired, card
      added to `dashboard/home`, `tasks.yaml` entry added.

**All 15 new examples implemented.** Remaining follow-ups from §6, still
open: (4) whether to reproduce any of the 18 already-covered F-codes a
second time, (5) whether to sync these back into `../taxonomy/mobile.yaml`
as `candidate` entries.

Notes on infra decisions made while implementing (supersedes open §6 items as
they're resolved in practice):
- Photos already has a `home.tsx` hub (pre-existing) — N07 will just add an
  "Album" card to it, no new hub needed.
- Calendar's `/calendar` index is a fault-free hub screen already (not itself
  a failure), so N03/N10 will add links directly there rather than
  introducing a separate `home.tsx`.
