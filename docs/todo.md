# Failure Examples — Implementation Tracker

Tracks implementation of the examples specified in
[`failure-examples-expansion.md`](./failure-examples-expansion.md).

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[-]` skipped
Each item ships: `components/failures/<slug>/{Screen.tsx,index.ts}` + the app
route + the `defect:<CODE>` marker + baseline/faulty behind `useFaultMode()` +
reachable by normal navigation. Each item lists its **agent task** (the prompt
the agent is given on the faulty screen).

---

## 0. Infrastructure / setup

- [x] Add new home-screen app tiles to `APPS` in `app/index.tsx`: App Store 📦,
      Photos 🖼️, Maps 🗺️, Banking 🏦, Calendar 📅
- [x] Convert `app/settings.tsx` → `app/settings/index.tsx` so Settings hosts sub-routes
- [x] Scaffold new app route folders: `app/appstore/`, `app/photos/`,
      `app/maps/`, `app/banking/`, `app/calendar/`
- [x] Add in-app navigation entry points for each new sub-route. Apps whose
      landing is itself a failure get a fault-free hub `/<app>/home` (reusable
      `components/nav/AppHub`) that links to every screen; home tiles for those 7
      apps repointed to the hub. Music index got inline "Library" links; Banking
      links to transfer; Calendar links to new; App Store/Photos/Maps are leaves.
      All 44 screens now reachable by tap-through from the home grid.
- [ ] Confirm `defect:<CODE>` naming convention is registered wherever the
      harness scrapes defect markers
- [x] Decide DRY vs explicit for §6.1 — chose **explicit** per-element screens
      (one component folder each) for visual realism

---

## A. Perceptibility — ghost nodes & occlusion

- [x] E01 `M_GHOST_ELEMENTS_FEED` — Social `/social/feed` (virtualized feed ghost nodes)
      Task: "Like Daniel's post about the marathon."
- [x] E02 `M_GHOST_ELEMENTS_CAROUSEL` — Shop `/shop/browse` (off-screen carousel cards)
      Task: "Open the 'Garden Hose' product."
- [x] E03 `M_INVISIBLE_TAP_OVERLAY` — Mail `/mail/inbox` (transparent overlay eats taps)
      Task: "Open the email from Sarah Chen."
- [x] E04 `M_BANNER_OCCLUDES_CTA` — Dashboard `/dashboard/reports` (sticky banner over CTA)
      Task: "Export the Q2 Summary report."
- [x] E05 `M_CTA_BELOW_KEYBOARD` — Careers `/careers/apply` (Submit trapped under keyboard)
      Task: "Apply to the Senior Frontend Engineer role."

## B. Interaction affordance & gesture execution

- [x] E06 `M_SWIPE_NO_CUE_CART` — Shop `/shop/cart` (swipe-to-remove, no cue; VO fails / MM via metadata)
      Task: "Remove the USB-C Hub 7-in-1 from your cart."
- [x] E07 `M_LONGPRESS_NO_CUE_MUSIC` — Music `/music/playlist` (long-press sheet, no cue)
      Task: "Add 'Ocean Breeze' to a playlist."
- [x] E08 `M_RATING_TAP_AS_SWIPE` — Shop `/shop/review` (swipe star-rating; tap read as swipe)
      Task: "Give this product a 4-star rating and submit the review."
- [x] E09 `M_PICKER_TAP_AS_SWIPE` — Clock `/clock/timer` (wheel picker; tap read as fling)
      Task: "Set a 9:00 PM bedtime."
- [x] E10 `M_PULL_TO_REFRESH_ONLY` — Photos `/photos` (pull-to-refresh only)
      Task: "Open the most recent photo."
- [x] E11 `M_DOUBLE_TAP_ONLY_LIKE` — Social `/social/story` (double-tap-only like)
      Task: "Like this photo."
- [x] E12 `M_PINCH_ZOOM_REVEAL` — Maps `/maps` (pin target only after pinch-zoom)
      Task: "Open the 'Central Park' pin."
- [x] E13 `M_DRAG_REORDER_ONLY` — Tasks `/tasks/reorder` (drag-and-drop reorder only)
      Task: "Move 'Buy groceries' to the top of the list."
- [x] E14 `M_SWIPE_CATEGORIZE` — Banking `/banking` (swipe to categorize, no cue)
      Task: "Categorize the Stripe transaction as 'Business'."

## C. Interactability — visible but not actionable

- [x] E15 `M_NONCLICKABLE_APPLY` — Careers `/careers/position` (CTA is plain `View`)
      Task: "Apply to this job."
- [x] E16 `M_TOGGLE_POINTEREVENTS_NONE` — Settings `/settings/preferences` (inert toggle)
      Task: "Turn on Dark Mode."
- [x] E17 `M_DISABLED_LOOKS_ENABLED` — Dashboard `/dashboard/overview` (disabled styled as enabled)
      Task: "Refresh the dashboard."
- [x] E18 `M_SEND_NO_EFFECT` — Mail `/mail/compose` (Send has no visible effect)
      Task: "Send the reply to Sarah Chen."
- [x] E19 `M_ZERO_HIT_AREA_FOLLOW` — Social `/social/profile` (Follow has 0×0 hit area)
      Task: "Follow Anna Kovacs."
- [x] E20 `M_DECOY_OVERLAY_CHECKBOX` — Tasks `/tasks/checklist` (transparent decoy over checkbox)
      Task: "Mark 'Call dentist' as done."

## D. Identifiability & grounding

- [x] E21 `M_RENAME_INSTALL_APPSTORE` — App Store `/appstore` (rebrand breaks name + icon)
      Task (text-only): "Install the Chirp app."
      Task (vision-only): "Install the Chirp app."
- [x] E22 `M_RENAME_SETTINGS_APPS` — Settings `/settings/apps` (rebrand in settings list)
      Task: "Open the settings for the Chirp app."
- [x] E23 `M_DUPLICATE_ACCESSIBLE_NAME` — Music `/music/album` (two tracks, identical a11y name)
      Task: "Play 'Intro' by Solar Winds."
- [x] E24 `M_LABEL_VISUAL_MISMATCH` — Mail `/mail/labels` (a11y label contradicts visible text)
      Task: "Archive the Figma newsletter."
- [x] E25 `M_DUPLICATE_CTA_ONE_DEAD` — Shop `/shop/featured` (two identical CTAs, one dead)
      Task: "Add this product to the cart."

## E. Feedback, state & timing

- [x] E26 `M_OPTIMISTIC_LIE_TRANSFER` — Banking `/banking/transfer` (false success, reverts)
      Task: "Send $50 to Alex Johnson."
- [x] E27 `M_SWAPPED_DIALOG_BUTTONS` — Shop `/shop/checkout` (Confirm/Cancel swapped)
      Task: "Confirm and place the order."
- [x] E28 `M_MOVING_TARGET_CAROUSEL` — Social `/social/stories` (auto-advancing target)
      Task: "Open the 3rd story."
- [x] E29 `M_INPUT_SILENT_TRUNCATE` — Calendar `/calendar/new` (input silently truncates)
      Task: "Create an event titled 'Team Standup'."
- [x] E30 `M_LATE_RENDER_INBOX` — Mail `/mail/sync` (spinner past snapshot)
      Task: "Open the first email in the inbox."

---

## F. Pattern × element matrix — non-functional control (§6.1)

> Optional shared base: `components/failures/dead-control/Screen.tsx` (param: element kind).

- [x] M01 `M_DEAD_BACK_BUTTON` — Shop `/shop/details` (header back chevron, `disabled`)
      Task: "Go back to the product list."
- [x] M02 `M_DEAD_CAROUSEL_ARROWS` — Shop `/shop/gallery` (‹ / › arrows, `onPress` no-op)
      Task: "View the next product photo."
- [x] M03 `M_DEAD_TAB_ITEM` — Music `/music/browse` (tab doesn't switch)
      Task: "Switch to the Search tab."
- [x] M04 `M_DEAD_FAB` — Tasks `/tasks/projects` (FAB is plain `View`)
      Task: "Create a new task."
- [x] M05 `M_DEAD_OVERFLOW_MENU` — Social `/social/post` (⋯ never opens)
      Task: "Open the post options menu."
- [x] M06 `M_DEAD_HAMBURGER` — Dashboard `/dashboard/menu` (drawer toggle inert)
      Task: "Open the navigation menu."
- [x] M07 `M_DEAD_STEPPER` — Shop `/shop/quantity` (+/- doesn't change qty)
      Task: "Increase the quantity to 2."
- [x] M08 `M_DEAD_DROPDOWN` — Careers `/careers/filter` (options never open)
      Task: "Filter jobs by 'Remote'."
- [x] M09 `M_DEAD_SEGMENT` — Mail `/mail/categories` (segmented control doesn't switch)
      Task: "Switch to the Promotions tab."
- [x] M10 `M_DEAD_PAGINATION_DOTS` — Shop `/shop/onboarding` (dots not tappable)
      Task: "Jump to the last slide."
- [x] M11 `M_DEAD_SEEALL_LINK` — Music `/music/discover` ("See all" no nav)
      Task: "See all recently played."
- [x] M12 `M_DEAD_SEARCH_ICON` — Mail `/mail/search` (search opens nothing)
      Task: "Search your inbox."
- [x] M13 `M_DEAD_CLOSE_ICON` — Settings `/settings/help` (✕ inert)
      Task: "Close the dialog."
- [x] M14 `M_DEAD_CHECKBOX` — Settings `/settings/notifications` (won't toggle)
      Task: "Enable push notifications."

## G. Secondary matrices (§6.2) — optional, pending sign-off

> Pattern families only — concrete examples + tasks to be enumerated if approved.

- [ ] Missing accessible name across icon-only controls (back, search, share,
      like, ⋯, filter, cart, gear, play/pause)
- [ ] Gesture-only control across controls (swipe row, swipe pager, swipe rating,
      swipe carousel, swipe-down dismiss)
- [ ] Wrong / stale a11y state (toggle checked-while-off, expanded mismatch,
      selected-tab mismatch)

---

## I. Second wave — perceptual & encoding failures (§6B)

- [x] P01 `M_LOW_CONTRAST_CTA` — Shop `/shop/deal` (Buy button ~1.5:1 contrast)
      Task: "Buy the Aurora Desk Lamp now."
- [x] P02 `M_TEXT_AS_IMAGE` — Shop `/shop/listing` (price/"Sale" baked into image, no text node)
      Task: "Open the item that's on sale."
- [x] P03 `M_TRUNCATED_A11Y_NAME` — Banking `/banking/confirm` (label + a11yLabel ellipsized)
      Task: "Confirm the payment."
- [x] P04 `M_COLOR_ONLY_STATE` — Dashboard `/dashboard/status` (status = colored dot only)
      Task: "Open the service that is down."
- [x] P05 `M_PLACEHOLDER_AS_VALUE` — Mail `/mail/draft` (placeholder looks like a filled value)
      Task: "Send the email to alex@work.com."
- [x] P06 `M_ICON_SEMANTIC_MISMATCH` — Photos `/photos/viewer` (download icon deletes)
      Task: "Download this photo."
- [x] P07 `M_TRANSIENT_CONFIRMATION` — Banking `/banking/payee` (success toast flashes ~400ms)
      Task: "Add Alex Johnson as a payee."
- [x] P08 `M_LAYOUT_SHIFT_MISTAP` — Social `/social/timeline` (late banner reflows feed)
      Task: "Like the first post."
- [x] P09 `M_NESTED_SCROLL_TRAP` — Settings `/settings/licenses` (target in inner scroll view)
      Task: "Open the 'MIT License' entry."
- [x] P10 `M_SCRAMBLED_FOCUS_ORDER` — Tasks `/tasks/agenda` (tree order ≠ visual order)
      Task: "Complete the first task."

## H. Wrap-up

- [x] All 44 examples implemented (30 scenarios E01–E30 + 14 matrix M01–M14)
- [x] Static verification: `npx tsc --noEmit` clean, `npx expo lint` clean
- [x] Integrity: 55 component folders each have `Screen.tsx` + `index.ts`; 55
      unique `defect:` codes, no duplicates; all 45 routes present with default exports
- [x] Verify each `defect:<CODE>` marker is present only in faulty mode
      (grep-confirmed; every faulty root gates the testID on `faultActive`)
- [ ] Runtime smoke-test every screen in both modes (expo start) — NOT yet run
- [ ] Add in-app navigation links from each app index to its new sub-routes
      (routes are deep-linkable now; tap-through nav still TODO)
- [ ] Promote validated `candidate` classes + new categories
      (`interactability`, `feedback_and_state`) into `../taxonomy/mobile.yaml`
- [ ] Update brief's coverage tables if any scenario is dropped/changed
