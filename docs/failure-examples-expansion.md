# Mobile Failure Lab — Additional Examples Brief

**Status:** spec / planning only — no code yet.
**Source of truth:** `../taxonomy/mobile.yaml`
**Goal:** Add new dummy examples across the mobile app along **two axes**:

- **§2–§5 — 30 scenario examples.** One per distinct failure, spread across apps.
- **§6 — pattern × element matrix (14+).** The *same* failure pattern reproduced
  across many different UI element archetypes (back chevron, carousel arrows, tab
  item, FAB, stepper…), to prove the failure is a property of the *pattern*, not
  of one element or one screen.

They serve three purposes:

1. **Reproduce every failure already in `mobile.yaml`** in a *different* app /
   context (validation that the failure is pattern-level, not screen-specific).
2. **Introduce new agent-blocking failure classes** not yet catalogued —
   especially "visible element but not interactable", occlusion, misleading
   feedback, and gesture-execution traps. Flagged **`candidate`**; intended to
   feed back into the taxonomy once validated.
3. **Vary the element under a fixed pattern** (§6) — same agent-visible symptom
   ("I tapped the right thing, nothing happened"), many element types.

---

## 1. Conventions every new example follows

Mirrors the existing `components/failures/*` screens so the harness is unchanged:

- **One global switch.** Every screen reads `useFaultMode()` from
  `lib/fault-mode.tsx`. `baseline` = correct screen, `faulty` = defective
  variant. No new flags, no URL params — an agent navigates like a real user.
- **Defect marker.** The faulty root container carries `testID={'defect:<CODE>'}`
  and renders nothing extra in baseline. Each example proposes a `<CODE>`.
- **Realistic, self-contained screens** reusing the existing mock-data style.
- **Reachable by normal navigation** — every new route is linked from its app's
  index (tab, row, button, or cart icon), so an agent can get there as a user.

Each example below lists: **App · route**, **mechanism**, **baseline vs faulty**,
**defect code**, **task**, and **taxonomy ref** (existing id, or `candidate`).

---

## 2. Master list (30)

| # | App · route | Failure (short) | Defect code | Ref |
|---|---|---|---|---|
| **A. Perceptibility — ghost nodes & occlusion** |
| E01 | Social · `/social/feed` | Ghost a11y nodes in virtualized feed | `M_GHOST_ELEMENTS_FEED` | F-MOB-MM-PRC-001 |
| E02 | Shop · `/shop/browse` | Off-screen carousel cards in tree | `M_GHOST_ELEMENTS_CAROUSEL` | F-MOB-MM-PRC-001 |
| E03 | Mail · `/mail/inbox` | Invisible overlay intercepts all taps | `M_INVISIBLE_TAP_OVERLAY` | candidate |
| E04 | Dashboard · `/dashboard/reports` | Sticky banner occludes the CTA | `M_BANNER_OCCLUDES_CTA` | candidate |
| E05 | Careers · `/careers/apply` | Submit button trapped below keyboard, no scroll | `M_CTA_BELOW_KEYBOARD` | candidate |
| **B. Interaction affordance & gesture execution** |
| E06 | Shop · `/shop/cart` | Swipe-to-remove, no visual cue | `M_SWIPE_NO_CUE_CART` | F-MOB-VO-AFD-001 / MM-AFD-002 |
| E07 | Music · `/music/playlist` | Long-press track sheet, no cue | `M_LONGPRESS_NO_CUE_MUSIC` | F-MOB-VO-AFD-003 / MM-AFD-004 |
| E08 | Shop · `/shop/review` | Swipe star-rating; tap read as swipe | `M_RATING_TAP_AS_SWIPE` | F-MOB-MM-AFD-005 |
| E09 | Clock · `/clock/timer` | Wheel picker; tap read as fling | `M_PICKER_TAP_AS_SWIPE` | F-MOB-MM-AFD-005 |
| E10 | Photos · `/photos` | Pull-to-refresh only, no button | `M_PULL_TO_REFRESH_ONLY` | candidate |
| E11 | Social · `/social/story` | Double-tap-only like, no button | `M_DOUBLE_TAP_ONLY_LIKE` | candidate |
| E12 | Maps · `/maps` | Pin tap target only after pinch-zoom | `M_PINCH_ZOOM_REVEAL` | candidate |
| E13 | Tasks · `/tasks/reorder` | Drag-and-drop reorder only | `M_DRAG_REORDER_ONLY` | candidate |
| E14 | Banking · `/banking/activity` | Swipe transaction to categorize, no cue | `M_SWIPE_CATEGORIZE` | F-MOB-VO-AFD-001 (new ctx) |
| **C. Interactability — visible but not actionable** |
| E15 | Careers · `/careers/job/[id]` (apply) | CTA is a plain `View`, not pressable | `M_NONCLICKABLE_APPLY` | (mirrors B_NON_CLICKABLE_NORMAL_CTA) |
| E16 | Settings · `/settings` | Toggle inert (`pointerEvents:'none'`) | `M_TOGGLE_POINTEREVENTS_NONE` | candidate |
| E17 | Dashboard · `/dashboard` | Button disabled but styled enabled | `M_DISABLED_LOOKS_ENABLED` | candidate |
| E18 | Mail · `/mail/compose` | Send press has no visible effect | `M_SEND_NO_EFFECT` | (mirrors B_CLICK_NO_VISIBLE_EFFECT) |
| E19 | Social · `/social/profile` | Follow button has 0×0 hit area | `M_ZERO_HIT_AREA_FOLLOW` | candidate |
| E20 | Tasks · `/tasks` | Transparent decoy view over checkbox | `M_DECOY_OVERLAY_CHECKBOX` | candidate |
| **D. Identifiability & grounding** |
| E21 | App Store · `/appstore` | Rebranded app breaks name + icon match | `M_RENAME_INSTALL_APPSTORE` | F-MOB-TO-IDF-001 / VO-IDF-002 |
| E22 | Settings · `/settings/apps` | Rebranded app in settings list | `M_RENAME_SETTINGS_APPS` | F-MOB-TO-IDF-001 |
| E23 | Music · `/music` | Two tracks share identical a11y name | `M_DUPLICATE_ACCESSIBLE_NAME` | candidate |
| E24 | Mail · `/mail` | a11y label contradicts visible text | `M_LABEL_VISUAL_MISMATCH` | candidate |
| E25 | Shop · `/shop/product/[id]` | Two identical CTAs, one is dead/occluded | `M_DUPLICATE_CTA_ONE_DEAD` | candidate |
| **E. Feedback, state & timing** |
| E26 | Banking · `/banking/transfer` | Success toast, transfer silently reverts | `M_OPTIMISTIC_LIE_TRANSFER` | candidate |
| E27 | Shop · `/shop/checkout` | Confirm/Cancel positions swapped | `M_SWAPPED_DIALOG_BUTTONS` | candidate |
| E28 | Social · `/social/stories` | Auto-advancing target moves before tap | `M_MOVING_TARGET_CAROUSEL` | candidate |
| E29 | Calendar · `/calendar/new` | Input silently truncates/strips text | `M_INPUT_SILENT_TRUNCATE` | candidate |
| E30 | Mail · `/mail/inbox` (variant) | Late render — spinner past snapshot | `M_LATE_RENDER_INBOX` | (mirrors B_ASYNC_CONTENT_LATE_RENDER) |

**New home-screen app tiles required:** App Store 📦, Photos 🖼️, Maps 🗺️,
Banking 🏦, Calendar 📅. (Settings already exists.)

---

## 3. Detailed specs

### A. Perceptibility — ghost nodes & occlusion

**E01 · Social → Feed · `M_GHOST_ELEMENTS_FEED`**
- Virtualized `FlatList` of ~20 posts (Like/Comment/Share each).
- *Baseline:* healthy virtualization (`removeClippedSubviews`, small `windowSize`)
  — only on-screen rows are in the a11y tree.
- *Faulty:* off-screen rows stay mounted (`removeClippedSubviews={false}`, large
  `windowSize`) **+** 1–2 hard off-screen widgets (`position:absolute,left:-1200`).
  Like buttons exist for posts the agent cannot see.
- *Task (MM):* "Like Daniel's post about the marathon." (off-screen phantom node)

**E02 · Shop → Browse · `M_GHOST_ELEMENTS_CAROUSEL`**
- Several horizontal category carousels ("Deals", "New", "Popular").
- *Faulty:* off-screen carousel cards remain in the a11y tree.
- *Task:* "Open the 'Garden Hose' product." (far-right, not visibly rendered)

**E03 · Mail → Inbox · `M_INVISIBLE_TAP_OVERLAY`**  *(blocks: visible but not interactable)*
- A normal inbox list.
- *Faulty:* a fully transparent full-screen `View` (e.g. a leftover loading/ad
  layer) sits on top with default `pointerEvents`, swallowing every tap. The list
  is perfectly visible and present in the tree, but no row is reachable.
- *Task:* "Open the email from Sarah Chen." (taps land on the invisible overlay)

**E04 · Dashboard → Reports · `M_BANNER_OCCLUDES_CTA`**  *(blocks: occlusion)*
- A reports page with an "Export report" button at the bottom.
- *Faulty:* a sticky "Upgrade to Pro" banner is pinned over the bottom of the
  screen, covering the Export button. The button is in the tree (and may be the
  agent's grounded target) but is physically behind the banner → taps hit the
  banner.
- *Task:* "Export the Q2 Summary report."

**E05 · Careers → Apply · `M_CTA_BELOW_KEYBOARD`**  *(blocks: off-screen-on-focus)*
- An application form (name, email, cover letter) with a "Submit application"
  button below the fields.
- *Faulty:* no `KeyboardAvoidingView` / no scroll — focusing the cover-letter
  field raises the keyboard, which covers Submit. The agent cannot reach Submit
  without dismissing the keyboard, but nothing hints that it's hidden.
- *Task:* "Apply to the Senior Frontend Engineer role."

---

### B. Interaction affordance & gesture execution

**E06 · Shop → Cart · `M_SWIPE_NO_CUE_CART`**  *(VO fails / MM via metadata)*
- Cart line items; removing = swipe-left only. No trailing button, no ⋯.
- *Baseline:* a visible "Remove" button per row.
- *Faulty (vision):* swipe-only, no visual indicator → vision-only can't discover.
- *Faulty (MM):* row declares `accessibilityActions=[{name:'remove',label:'Remove from cart'}]`
  → MM agent fires it from the tree and succeeds (F4.4 positive case).
- *Task:* "Remove the USB-C Hub 7-in-1 from your cart."

**E07 · Music → Playlist · `M_LONGPRESS_NO_CUE_MUSIC`**  *(VO fails / MM via metadata)*
- Track rows; "Add to playlist / Go to album / Download" live in a bottom sheet
  opened only by long-press. No ⋯, no chevron.
- *Baseline:* a visible ⋯ button opens the same sheet.
- *Faulty (vision):* long-press only, no hint → vision-only fails.
- *Faulty (MM):* row declares custom a11y action `more` → MM succeeds.
- *Task:* "Add 'Ocean Breeze' to a playlist."

**E08 · Shop → Review · `M_RATING_TAP_AS_SWIPE`**  *(Latte-style)*
- Review form with a 5-star rating + Submit.
- *Baseline:* five independent tappable star `Pressable`s.
- *Faulty:* the bar is a single horizontal pan (`GestureDetector`); a tap is
  captured by the pan recognizer and resolved from x-position/fling → "tap the
  4th star" lands on the wrong value or snaps to 0.
- *Task:* "Give this product a 4-star rating and submit the review."

**E09 · Clock → Timer · `M_PICKER_TAP_AS_SWIPE`**  *(proposal fig.18 style)*
- "Set bedtime" scroll-wheel hour/minute picker (distinct from the existing
  keypad `/clock` screen).
- *Faulty:* the wheel only commits on scroll momentum; a tap on "9" is read as a
  small drag → lands on 8 or 10 (21:00→19:48 class).
- *Task:* "Set a 9:00 PM bedtime."

**E10 · Photos → Library · `M_PULL_TO_REFRESH_ONLY`**  *(gesture-only)*
- A photo grid. New photos load **only** via pull-to-refresh; no refresh button,
  no auto-poll.
- *Faulty:* the latest photo is absent until a pull gesture; nothing hints it
  exists or how to fetch it.
- *Task:* "Open the most recent photo." (requires discovering pull-to-refresh)

**E11 · Social → Story · `M_DOUBLE_TAP_ONLY_LIKE`**  *(gesture-only)*
- A full-screen story/photo. Liking is double-tap only — no heart button.
- *Faulty:* no visible like affordance; single taps do nothing.
- *Task:* "Like this photo."

**E12 · Maps → Explore · `M_PINCH_ZOOM_REVEAL`**  *(gesture-gated target)*
- A simple map with clustered pins. The "Central Park" pin's tappable label only
  separates from its cluster after pinch-to-zoom.
- *Faulty:* at default zoom the target is merged into a cluster with no individual
  hit target; only a pinch reveals it.
- *Task:* "Open the 'Central Park' pin."

**E13 · Tasks → Reorder · `M_DRAG_REORDER_ONLY`**  *(gesture-only)*
- A reorderable task list. Changing order = long-press a drag handle and drag.
- *Faulty:* no up/down buttons, no "move to top" menu item; reorder is drag-only
  with no hint.
- *Task:* "Move 'Buy groceries' to the top of the list."

**E14 · Banking → Activity · `M_SWIPE_CATEGORIZE`**  *(swipe-only, new context)*
- A transactions list. Swipe a row to reveal category actions.
- *Faulty:* swipe-only, no visible category control, no a11y action.
- *Task:* "Categorize the Stripe transaction as 'Business'."

---

### C. Interactability — visible but not actionable

**E15 · Careers → Job detail · `M_NONCLICKABLE_APPLY`**  *(blocks: dead CTA)*
- Job detail page with a styled "Apply now" button.
- *Faulty:* the button is a plain `View` (no `Pressable`/`onPress`), or an
  `accessibilityRole="button"` with no handler — looks fully clickable, does
  nothing. (Mirrors `B_NON_CLICKABLE_NORMAL_CTA` in a new app.)
- *Task:* "Apply to this job."

**E16 · Settings → Preferences · `M_TOGGLE_POINTEREVENTS_NONE`**  *(blocks: inert control)*
- A settings list with a "Dark Mode" `Switch`.
- *Faulty:* the switch (or its wrapper) has `pointerEvents="none"`, so it renders
  in its current state and reads as a switch in the tree, but taps never toggle it.
- *Task:* "Turn on Dark Mode."

**E17 · Dashboard → Home · `M_DISABLED_LOOKS_ENABLED`**  *(blocks: hidden disabled state)*
- A "Refresh data" button.
- *Faulty:* `disabled={true}` but styled identically to enabled and **without**
  `accessibilityState={{disabled:true}}` — both vision and tree see an enabled
  button; presses are silently dropped.
- *Task:* "Refresh the dashboard."

**E18 · Mail → Compose · `M_SEND_NO_EFFECT`**  *(blocks: silent no-op)*
- A reply compose screen with a "Send" button.
- *Faulty:* the press fires but state never updates — no nav, no toast, no sent
  confirmation (mirrors `B_CLICK_NO_VISIBLE_EFFECT`).
- *Task:* "Send the reply to Sarah Chen."

**E19 · Social → Profile · `M_ZERO_HIT_AREA_FOLLOW`**  *(blocks: phantom hit area)*
- A profile with a "Follow" chip. The label overflows a `Pressable` sized 0×0
  (or `width:0`), so the text is visible but the touch target has no area.
- *Faulty:* taps on the visible "Follow" text miss the 0-area target.
- *Task:* "Follow Anna Kovacs."

**E20 · Tasks → List · `M_DECOY_OVERLAY_CHECKBOX`**  *(blocks: occluding decoy)*
- The task list checkbox toggles completion.
- *Faulty:* a transparent priority-flag `View` is absolutely positioned over the
  checkbox, intercepting taps; the checkbox is visible but unreachable.
- *Task:* "Mark 'Call dentist' as done."

---

### D. Identifiability & grounding

**E21 · App Store → Listing · `M_RENAME_INSTALL_APPSTORE`**  *(TO + VO)*
- Searchable app list. Fiction: **"Chirp" 🐦 rebranded to "Zap" ⚡**; the task
  always says "Chirp".
- *Baseline:* listed as "Chirp" (or "Zap (formerly Chirp)") + recognizable icon.
- *Faulty:* listed only as "Zap" + new ⚡ icon — a11y label lacks "Chirp", icon
  no longer matches.
- *Task (TO, F-MOB-TO-IDF-001):* "Install the Chirp app." (name search matches nothing)
- *Task (VO, F-MOB-VO-IDF-002):* "Install the Chirp app." (icon match fails)

**E22 · Settings → Apps · `M_RENAME_SETTINGS_APPS`**  *(second surface)*
- "Installed apps" list reached from Settings; same Chirp/Zap entity.
- *Task:* "Open the settings for the Chirp app." (now labeled "Zap")

**E23 · Music → Library · `M_DUPLICATE_ACCESSIBLE_NAME`**  *(blocks: ambiguous grounding)*
- Two different tracks both titled "Intro" (different artists), with **identical**
  `accessibilityLabel`.
- *Faulty:* the tree exposes two indistinguishable "Intro" nodes; the agent
  cannot tell which to play and may pick the wrong one.
- *Task:* "Play 'Intro' by Solar Winds." (only artist/position disambiguates)

**E24 · Mail → Inbox · `M_LABEL_VISUAL_MISMATCH`**  *(blocks: deceptive label)*
- A row action button shows "Archive" visually.
- *Faulty:* its `accessibilityLabel` says "Delete" (label/visual mismatch). A
  multimodal agent gets conflicting signals; a text-only agent acting on the
  label performs the wrong, destructive action.
- *Task:* "Archive the Figma newsletter." (a11y says Delete)

**E25 · Shop → Product detail · `M_DUPLICATE_CTA_ONE_DEAD`**  *(blocks: duplicate label, one dead)*
- An inline "Add to Cart" plus a sticky bottom "Add to Cart", same label.
- *Faulty:* the inline one is occluded/non-functional while the sticky one works
  (or vice-versa); the tree shows two identical CTAs and the agent may bind to
  the dead one.
- *Task:* "Add this product to the cart."

---

### E. Feedback, state & timing

**E26 · Banking → Transfer · `M_OPTIMISTIC_LIE_TRANSFER`**  *(blocks: false success)*
- A money-transfer form.
- *Faulty:* on submit it shows "✓ Transfer complete" and navigates back, but the
  balance/activity never changes (optimistic UI that silently reverts). The agent
  reports success on a task that did not actually complete.
- *Task:* "Send $50 to Alex Johnson."

**E27 · Shop → Checkout · `M_SWAPPED_DIALOG_BUTTONS`**  *(blocks: positional bias trap)*
- An "Place order?" confirmation dialog.
- *Faulty:* button positions are swapped — "Confirm" sits where "Cancel" usually
  is (left) and "Cancel" on the right. Agents relying on conventional position
  pick the wrong button.
- *Task:* "Confirm and place the order."

**E28 · Social → Stories · `M_MOVING_TARGET_CAROUSEL`**  *(blocks: moving target)*
- A stories bar that auto-advances on a timer.
- *Faulty:* the target story scrolls out of the strip before the agent can act;
  its node persists in the tree at a stale position → tap lands on the wrong story.
- *Task:* "Open the 3rd story." (target moves between snapshot and action)

**E29 · Calendar → New event · `M_INPUT_SILENT_TRUNCATE`**  *(blocks: input mutation)*
- A "New event" form with a title field.
- *Faulty:* the field silently truncates at N chars or strips spaces/digits, so
  the committed value differs from what the agent typed, with no error. A later
  verification ("find event 'Team Standup'") then fails.
- *Task:* "Create an event titled 'Team Standup'."

**E30 · Mail → Inbox (late-render variant) · `M_LATE_RENDER_INBOX`**  *(blocks: timing)*
- Inbox that fetches messages on mount.
- *Baseline:* ~500ms load.
- *Faulty:* ~5s spinner — the agent snapshots the DOM while only the spinner is
  visible and concludes the inbox is empty (mirrors `B_ASYNC_CONTENT_LATE_RENDER`
  in a new app).
- *Task:* "Open the first email in the inbox."

---

## 4. New routes / files to create (when we code)

```
# A. Perceptibility
app/social/feed.tsx                 -> M_GHOST_ELEMENTS_FEED
app/shop/browse.tsx                 -> M_GHOST_ELEMENTS_CAROUSEL
app/mail/inbox.tsx                  -> M_INVISIBLE_TAP_OVERLAY (+ M_LATE_RENDER_INBOX variant)
app/dashboard/reports.tsx           -> M_BANNER_OCCLUDES_CTA
app/careers/apply.tsx               -> M_CTA_BELOW_KEYBOARD

# B. Affordance & gestures
app/shop/cart.tsx                   -> M_SWIPE_NO_CUE_CART
app/music/playlist.tsx              -> M_LONGPRESS_NO_CUE_MUSIC
app/shop/review.tsx                 -> M_RATING_TAP_AS_SWIPE
app/clock/timer.tsx                 -> M_PICKER_TAP_AS_SWIPE
app/photos/index.tsx                -> M_PULL_TO_REFRESH_ONLY
app/social/story.tsx                -> M_DOUBLE_TAP_ONLY_LIKE
app/maps/index.tsx                  -> M_PINCH_ZOOM_REVEAL
app/tasks/reorder.tsx               -> M_DRAG_REORDER_ONLY
app/banking/activity.tsx            -> M_SWIPE_CATEGORIZE

# C. Interactability
app/careers/job/[id].tsx (apply)    -> M_NONCLICKABLE_APPLY
app/settings.tsx (preferences)      -> M_TOGGLE_POINTEREVENTS_NONE
app/dashboard/index.tsx             -> M_DISABLED_LOOKS_ENABLED
app/mail/compose.tsx                -> M_SEND_NO_EFFECT
app/social/profile.tsx              -> M_ZERO_HIT_AREA_FOLLOW
app/tasks/index.tsx                 -> M_DECOY_OVERLAY_CHECKBOX

# D. Identifiability
app/appstore/index.tsx              -> M_RENAME_INSTALL_APPSTORE
app/settings/apps.tsx               -> M_RENAME_SETTINGS_APPS
app/music/index.tsx                 -> M_DUPLICATE_ACCESSIBLE_NAME
app/mail/index.tsx                  -> M_LABEL_VISUAL_MISMATCH
app/shop/product/[id].tsx           -> M_DUPLICATE_CTA_ONE_DEAD

# E. Feedback / state / timing
app/banking/transfer.tsx            -> M_OPTIMISTIC_LIE_TRANSFER
app/shop/checkout.tsx               -> M_SWAPPED_DIALOG_BUTTONS
app/social/stories.tsx              -> M_MOVING_TARGET_CAROUSEL
app/calendar/new.tsx                -> M_INPUT_SILENT_TRUNCATE
app/mail/inbox.tsx (variant)        -> M_LATE_RENDER_INBOX

components/failures/<one folder per code>/{Screen.tsx,index.ts}
```

Plus: add **App Store, Photos, Maps, Banking, Calendar** tiles to `APPS` in
`app/index.tsx`, and link each new sub-route from its app index (cart icon, tab,
list row, etc.) so an agent can reach it by normal navigation.

---

## 5. Taxonomy coverage check

| Taxonomy id | Reproduced by |
|---|---|
| F-MOB-MM-PRC-001 | E01, E02 |
| F-MOB-VO-AFD-001 | E06, E14 |
| F-MOB-MM-AFD-002 | E06 (MM path) |
| F-MOB-VO-AFD-003 | E07 |
| F-MOB-MM-AFD-004 | E07 (MM path) |
| F-MOB-MM-AFD-005 | E08, E09 |
| F-MOB-TO-IDF-001 | E21, E22 |
| F-MOB-VO-IDF-002 | E21 |

Existing **catalogued cross-platform/baseline** patterns also re-validated in new
contexts: non-clickable CTA (E15), click-no-effect (E18), async late render (E30).

**New candidate failure classes** introduced for taxonomy growth: invisible tap
overlay (E03), banner occlusion (E04), CTA-below-keyboard (E05), pull-to-refresh
only (E10), double-tap only (E11), pinch-to-reveal (E12), drag-reorder only
(E13), inert toggle (E16), disabled-looks-enabled (E17), zero hit area (E19),
decoy overlay (E20), duplicate accessible name (E23), label/visual mismatch
(E24), duplicate dead CTA (E25), optimistic-lie (E26), swapped dialog buttons
(E27), moving target (E28), silent input truncation (E29).

---

## 6. Pattern × element matrix — "same pattern, different element"

This is a second axis on top of §2–§5. Where §2–§5 give one example per *failure*,
this matrix fixes a **single failure pattern** and reproduces it across many
**element archetypes**. The point: an agent reviewer should see the failure is
not specific to one widget (a "button") but recurs on back chevrons, carousel
arrows, tabs, steppers, etc.

### 6.1 — Primary matrix: **non-functional control** (visible, looks operable, action never fires)

This generalizes category **C** (§3.C) across element types. The *agent-visible
symptom is identical* — "I grounded the right control and acted; nothing
happened" — while the **root cause is deliberately varied** per row (no handler,
genuinely `disabled`, `pointerEvents:'none'`, occluded, 0-area). That variety is
the point: it shows the pattern is robust to implementation detail.

| # | Element archetype | App · context | Root cause (mechanism) | Defect code | Task |
|---|---|---|---|---|---|
| M01 | Header **back chevron ‹** | Shop · product detail | `disabled` + greyed, no `accessibilityState.disabled` | `M_DEAD_BACK_BUTTON` | "Go back to the product list." |
| M02 | **Carousel ‹ / › arrows** | Shop · product gallery | `onPress` no-op (arrows render, index never changes) | `M_DEAD_CAROUSEL_ARROWS` | "View the next product photo." |
| M03 | **Bottom tab item** | Music · Library/Search/Profile bar | tab press doesn't switch route | `M_DEAD_TAB_ITEM` | "Switch to the Search tab." |
| M04 | **FAB (+)** | Tasks | plain `View` styled as FAB, no handler | `M_DEAD_FAB` | "Create a new task." |
| M05 | **Overflow ⋯ icon** | Social · post | icon present, menu never opens | `M_DEAD_OVERFLOW_MENU` | "Open the post options menu." |
| M06 | **Hamburger ☰ / drawer** | Dashboard | drawer toggle inert | `M_DEAD_HAMBURGER` | "Open the navigation menu." |
| M07 | **Quantity stepper +/-** | Shop · cart | `+` doesn't increment | `M_DEAD_STEPPER` | "Increase the quantity to 2." |
| M08 | **Dropdown / select** | Careers · filter | chevron present, options never open | `M_DEAD_DROPDOWN` | "Filter jobs by 'Remote'." |
| M09 | **Segmented control** | Mail · Primary/Promotions | segment tap doesn't switch | `M_DEAD_SEGMENT` | "Switch to the Promotions tab." |
| M10 | **Pagination dots** | Shop · onboarding/gallery | dots not tappable to jump | `M_DEAD_PAGINATION_DOTS` | "Jump to the last slide." |
| M11 | **"See all" chevron link** | Music · section header | link styled, no navigation | `M_DEAD_SEEALL_LINK` | "See all recently played." |
| M12 | **Search icon 🔍** | Mail | tapping search opens nothing | `M_DEAD_SEARCH_ICON` | "Search your inbox." |
| M13 | **Close ✕ on bottom sheet** | Settings · sheet | `✕` inert (sheet trap; complements blocking-modal) | `M_DEAD_CLOSE_ICON` | "Close the dialog." |
| M14 | **Checkbox / radio** | Settings · notifications | toggle visible, won't change | `M_DEAD_CHECKBOX` | "Enable push notifications." |

> Note the overlap with §3.C is intentional: E15 (dead CTA), E16 (inert toggle),
> E17 (disabled-looks-enabled), E19 (0 hit area) and E20 (decoy overlay) are the
> *same pattern* on yet other elements. Together C + 6.1 form one robust family.

### 6.2 — Optional secondary matrices (same idea, other patterns)

If useful, the matrix approach replicates for these patterns too — each row an
element archetype:

- **Missing accessible name** across **icon-only** controls — back, search,
  share, like, more (⋯), filter, cart, settings gear, play/pause. (Generalizes
  the existing `M_MISSING_ACCESSIBLE_NAME` across icons.)
- **Gesture-only control** across controls — swipe row (list), swipe tab
  (pager), swipe rating, swipe carousel, swipe-down dismiss. (Generalizes §3.B.)
- **Wrong / stale a11y state** — toggle reports `checked` while visually off;
  expanded/collapsed mismatch; selected tab mismatch.

### 6.3 — Suggested coding shortcut

Rows in 6.1 share one shape, so a single parameterized
`components/failures/dead-control/Screen.tsx` (props: element kind, host app
chrome, mechanism) can render all 14 variants, each tagged with its own
`defect:` code. Keeps the catalog DRY and makes "add another element" a one-liner.

---

## 6B. Second wave — perceptual & encoding failures (10)

A later batch focused on issues where the **pixels or the metadata mislead the
agent even though the control works** — perception, encoding, and timing defects
rather than dead/occluded controls. Several form clean modality contrasts
(vision-only fails / tree agent succeeds, or the inverse), which is exactly the
evidence used to attribute a failure to a specific agent type. All `candidate`.

| # | App · route | Failure | Baseline → Faulty | Hits | Defect code |
|---|---|---|---|---|---|
| P01 | Shop · `/shop/deal` | Low-contrast CTA | high-contrast Buy button → ~1.5:1 text/fill (below WCAG 3:1) | vision-only | `M_LOW_CONTRAST_CTA` |
| P02 | Shop · `/shop/listing` | Text baked into image | real text price/"Sale" badge → rasterized image, no text node, no a11y label | text-only, MM | `M_TEXT_AS_IMAGE` |
| P03 | Banking · `/banking/confirm` | Truncated accessible name | full "Confirm payment" → label + `accessibilityLabel` both ellipsized to "Confirm pa…" | text-only, MM | `M_TRUNCATED_A11Y_NAME` |
| P04 | Dashboard · `/dashboard/status` | Color-only state encoding | status has text/`accessibilityState` → encoded **only** by a colored dot | vision-only, text-only | `M_COLOR_ONLY_STATE` |
| P05 | Mail · `/mail/draft` | Placeholder masquerades as value | empty field looks empty → grey placeholder looks like a filled value (and/or exposed as `value`) | MM, text-only | `M_PLACEHOLDER_AS_VALUE` |
| P06 | Photos · `/photos/viewer` | Misleading icon semantics | ⬇️ download icon downloads → it actually **deletes** the photo | vision-only, MM | `M_ICON_SEMANTIC_MISMATCH` |
| P07 | Banking · `/banking/payee` | Transient confirmation | persistent "Payee added" → toast auto-hides in ~400ms (gone before next snapshot) | all | `M_TRANSIENT_CONFIRMATION` |
| P08 | Social · `/social/timeline` | Layout shift mis-tap | stable layout → late banner/image reflows feed after coords are computed | vision-only, MM | `M_LAYOUT_SHIFT_MISTAP` |
| P09 | Settings · `/settings/licenses` | Hidden inner-scroll trap | target on the page → target only reachable by scrolling a **nested** scroll view | all | `M_NESTED_SCROLL_TRAP` |
| P10 | Tasks · `/tasks/agenda` | Scrambled a11y reading order | tree order = visual order → tree/DOM order ≠ visual order (absolute positioning) | text-only, MM | `M_SCRAMBLED_FOCUS_ORDER` |

**Modality-contrast pairs of note:** P01 (vision fails, tree fine) ↔ P02 (tree
fails, vision fine); P04 splits vision-by-color vs text/tree blindness.

### Per-item mechanism & task

- **P01 `M_LOW_CONTRAST_CTA`** — A flash-deal product page. Faulty: the "Buy now"
  button uses near-equal fg/bg (e.g. `#cfcfcf` on `#dcdcdc`). The node is fully
  present in the tree (MM/TO succeed); a vision-only agent can't segment it.
  Task: "Buy the Aurora Desk Lamp now."
- **P02 `M_TEXT_AS_IMAGE`** — A product list where one item's price + "Sale" badge
  are rendered as an `<Image>` (or emoji-art block) with no text and no
  `accessibilityLabel`. Faulty hides the sale fact from text/tree agents; vision
  reads it. Task: "Open the item that's on sale."
- **P03 `M_TRUNCATED_A11Y_NAME`** — A payment confirm screen. Faulty: the confirm
  button shows "Confirm pa…" and its `accessibilityLabel` is the same truncated
  string, so grounding on "Confirm payment" matches nothing. Baseline: full label.
  Task: "Confirm the payment."
- **P04 `M_COLOR_ONLY_STATE`** — A services status list. Faulty: each service's
  health is shown **only** by a green/red dot — no "Down"/"Operational" text and
  no `accessibilityState`/label. Task: "Open the service that is down."
- **P05 `M_PLACEHOLDER_AS_VALUE`** — A compose/draft screen. Faulty: the "To"
  field's grey placeholder ("name@example.com") reads as a filled value (looks
  filled; and/or the placeholder is surfaced as the field `value` in the tree),
  so the agent skips filling it. Task: "Send the email to alex@work.com."
- **P06 `M_ICON_SEMANTIC_MISMATCH`** — A photo viewer with a standard ⬇️ download
  icon. Faulty: pressing download actually **deletes** the photo (and the 🗑️
  conversely downloads). Acting on visual convention triggers the wrong,
  destructive action. Task: "Download this photo."
- **P07 `M_TRANSIENT_CONFIRMATION`** — An "Add payee" flow that *does* work.
  Faulty: the success snackbar auto-dismisses in ~400ms, before the agent's
  post-action observation, so it can't verify and may re-submit (double add).
  Task: "Add Alex Johnson as a payee."
- **P08 `M_LAYOUT_SHIFT_MISTAP`** — A feed. Faulty: a banner/image loads ~1.2s
  after first paint and pushes posts down (CLS), so coordinates computed against
  the first snapshot now land on a different post. Distinct from late-render
  (empty→full) and moving-target (auto-advance). Task: "Like the first post."
- **P09 `M_NESTED_SCROLL_TRAP`** — A long settings/licenses page. Faulty: the
  target ("MIT License") sits inside an inner fixed-height `ScrollView`; scrolling
  the outer page never reveals it, so the agent concludes it isn't there. Task:
  "Open the 'MIT License' entry."
- **P10 `M_SCRAMBLED_FOCUS_ORDER`** — An agenda list. Faulty: items are rendered
  in a different order than they appear (absolute positioning / reversed mount
  order), so a tree agent acting on "the first task" picks a visually-elsewhere
  node. Task: "Complete the first task."

---

## 7. Open questions for sign-off (before coding)

1. **Total scope** — the brief now totals **30 scenarios (§2–§5) + 14 element
   variants (§6.1) = 44**. Build all, or a first tranche (e.g. the 8
   taxonomy-mapped + the §6.1 matrix as the headline element-variety demo)?
2. **Secondary matrices (§6.2)** — also build the missing-name / gesture-only /
   stale-state element sweeps (adds ~15–20 more), or keep §6.1 as the only matrix?
3. **DRY vs explicit** — implement §6.1 as one parameterized `dead-control`
   screen (§6.3), or hand-build each element for maximum visual realism?
4. **New apps** — OK to add 5 new home-screen apps (App Store, Photos, Maps,
   Banking, Calendar)? Or fold some examples into existing apps to keep the grid
   small?
5. **Rebrand realism** — fictional "Chirp → Zap", or a real rename (Twitter → X)?
6. **Taxonomy sync** — once validated, promote the `candidate` classes (and the
   two new categories `interactability` + `feedback_and_state`) into
   `../taxonomy/mobile.yaml` as new entries with `source: controlled`,
   `app: gui-failure-lab` examples?
```
