/**
 * Wave-4 fragment registry — DEVELOPMENT INSTRUMENTATION ONLY.
 *
 * Wave 1–3 held a strict invariant: one screen = one defect, so a screen file told
 * you everything armed on that screen. Wave 4 breaks it — each entry below is a
 * defect mounted as a fragment INTO an existing screen that already carries a
 * different one. This table is what restores the answer to "which defects are live
 * on /shop/gallery?" for an author, a reviewer, and the verification pass.
 *
 * NOT consumed by the run harness. The runner is blind to `defect:` markers by
 * design: it receives a task from tasks.yaml (which already names the taxonomy id)
 * plus the mode flag, and records (task, mode, outcome). Attribution never depends
 * on observing the app. Markers exist so an author can confirm a screen armed, and
 * so the arming check in the plan's §7 can run — nothing downstream.
 *
 * See plans/derive-extra-defect-observations.md §3.2 and §3.4.
 */

export interface FragmentEntry {
  /** Lab code, rendered as testID="defect:<code>" on the fragment root in faulty mode. */
  code: string;
  /** components/failures/<slug>/ */
  slug: string;
  /** Wave-4 reference id (X01..X35). */
  ref: string;
  /** Taxonomy v3 type id this observation is evidence for. */
  taxonomyId: string;
  /** Route the fragment is mounted on. */
  hostRoute: string;
  /** Lab code of the defect that route already carried. */
  hostCode: string;
  /**
   * True when the fragment wraps or replaces UI/data the host already owned,
   * rather than sitting beside it. These carry the regression risk.
   */
  modifiesHost: boolean;
  /** How the fragment is kept off the host task's path. */
  isolation: 'disjoint-region' | 'gated';
}

export const WAVE4_FRAGMENTS: FragmentEntry[] = [
  {
    code: 'M_STATIC_STYLED_COMPANY_LINK',
    slug: 'static-styled-company-link',
    ref: 'X01',
    taxonomyId: 'F-IDT-02',
    hostRoute: '/careers/job/acme',
    hostCode: 'B_CLICK_NO_VISIBLE_EFFECT',
    // Replaces the host's static company byline.
    modifiesHost: true,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_STICKY_BAR_OCCLUDES_ROW',
    slug: 'sticky-bar-occludes-row',
    ref: 'X35',
    taxonomyId: 'F-INS-03',
    hostRoute: '/careers/filter',
    hostCode: 'M_DEAD_DROPDOWN',
    // Host list made scrollable + lengthened + openable; padding is mode-gated.
    modifiesHost: true,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_CHAT_BUBBLE_OVERLAY_CTA',
    slug: 'chat-bubble-overlay-cta',
    ref: 'X34',
    taxonomyId: 'F-INS-02',
    hostRoute: '/shop/quantity',
    hostCode: 'M_DEAD_STEPPER',
    // Host wraps its CTA and gains real `added` state.
    modifiesHost: true,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_CHECKOUT_RESERVATION_POPUP',
    slug: 'checkout-reservation-popup',
    ref: 'X31',
    taxonomyId: 'F-TMP-03',
    hostRoute: '/shop/cart',
    hostCode: 'M_SWIPE_NO_CUE_CART',
    // Host Checkout button gains an onPress that opens the gated sub-step.
    modifiesHost: true,
    isolation: 'gated',
  },
  {
    code: 'M_LATE_STOCK_FETCH',
    slug: 'late-stock-fetch',
    ref: 'X30',
    taxonomyId: 'F-TMP-02',
    hostRoute: '/shop/product/12',
    hostCode: 'B_NON_CLICKABLE_NORMAL_CTA',
    // Re-scoped from the plan's [host] sketch to a self-contained sibling block.
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_UNBOUNDED_FEED_TAIL',
    slug: 'unbounded-feed-tail',
    ref: 'X26',
    taxonomyId: 'F-FBK-01',
    hostRoute: '/social/feed',
    hostCode: 'M_GHOST_ELEMENTS_FEED',
    // Host FlatList gains onEndReached + ListFooterComponent; the tail is kept
    // out of `data` so it does not collide with the ghost virtualization defect.
    modifiesHost: true,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_PAGE_SCOPED_SORT',
    slug: 'page-scoped-sort',
    ref: 'X25',
    taxonomyId: 'F-CNT-03',
    hostRoute: '/shop/browse',
    hostCode: 'M_GHOST_ELEMENTS_CAROUSEL',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_UNSORTED_ARCHIVE_NO_CONTROLS',
    slug: 'unsorted-archive-no-controls',
    ref: 'X24',
    taxonomyId: 'F-CNT-03',
    hostRoute: '/mail/archive',
    hostCode: 'M_GESTURE_ONLY_ARCHIVE',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_CAMOUFLAGED_SPONSORED_ROWS',
    slug: 'camouflaged-sponsored-rows',
    ref: 'X23',
    taxonomyId: 'F-CNT-02',
    hostRoute: '/shop/listing',
    hostCode: 'M_TEXT_AS_IMAGE',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_STALE_NAMES_AFTER_FILTER',
    slug: 'stale-names-after-filter',
    ref: 'X17',
    taxonomyId: 'F-STR-01',
    hostRoute: '/banking',
    hostCode: 'M_SWIPE_CATEGORIZE',
    // Re-sited to its own list during implementation, same reason as X16.
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_RECYCLED_GRID_CELL_NAMES',
    slug: 'recycled-grid-cell-names',
    ref: 'X16',
    taxonomyId: 'F-STR-01',
    hostRoute: '/photos',
    hostCode: 'M_PULL_TO_REFRESH_ONLY',
    // Re-sited to its own grid during implementation: recycling the host's
    // Recents grid would have been a second region defect on one list.
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_INACCESSIBLE_SELECT_ALL',
    slug: 'inaccessible-select-all',
    ref: 'X13',
    taxonomyId: 'F-PRC-05',
    hostRoute: '/mail/categories',
    hostCode: 'M_DEAD_SEGMENT',
    // Host owns the selection state and renders the selected-row treatment.
    modifiesHost: true,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_UNTREED_CLOSE_SUBSCRIPTION',
    slug: 'untreed-close-subscription',
    ref: 'X33',
    taxonomyId: 'F-INS-01',
    hostRoute: '/music/browse',
    hostCode: 'M_DEAD_TAB_ITEM',
    modifiesHost: false,
    isolation: 'gated',
  },
  {
    code: 'M_TINY_OFFSET_CLOSE_UPSELL',
    slug: 'tiny-offset-close-upsell',
    ref: 'X32',
    taxonomyId: 'F-INS-01',
    hostRoute: '/mail/compose',
    hostCode: 'M_SEND_NO_EFFECT',
    modifiesHost: false,
    isolation: 'gated',
  },
  {
    code: 'M_COLLAPSED_UNMOUNTED_SECTION',
    slug: 'collapsed-unmounted-section',
    ref: 'X29',
    taxonomyId: 'F-TMP-01',
    hostRoute: '/settings/apps',
    hostCode: 'M_RENAME_SETTINGS_APPS',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_HORIZONTAL_LAZY_RAIL',
    slug: 'horizontal-lazy-rail',
    ref: 'X28',
    taxonomyId: 'F-TMP-01',
    hostRoute: '/music/playlist',
    hostCode: 'M_LONGPRESS_NO_CUE_MUSIC',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_UNBOUNDED_ALERT_HISTORY',
    slug: 'unbounded-alert-history',
    ref: 'X27',
    taxonomyId: 'F-FBK-01',
    hostRoute: '/dashboard/alerts',
    hostCode: 'M_NONBLOCKING_OVERLAY_OCCLUSION',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_VERSION_TOKEN_REPORT_ROWS',
    slug: 'version-token-report-rows',
    ref: 'X22',
    taxonomyId: 'F-CNT-02',
    hostRoute: '/dashboard/reports',
    hostCode: 'M_BANNER_OCCLUDES_CTA',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_SWAPPED_SECTION_HEADINGS',
    slug: 'swapped-section-headings',
    ref: 'X20',
    taxonomyId: 'F-CNT-01',
    hostRoute: '/music/discover',
    hostCode: 'M_DEAD_SEEALL_LINK',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_VAGUE_ACCORDION_TRIPLET',
    slug: 'vague-accordion-triplet',
    ref: 'X19',
    taxonomyId: 'F-NAV-01',
    hostRoute: '/careers/position',
    hostCode: 'M_NONCLICKABLE_APPLY',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_UNLABELLED_OVERFLOW_LABELS',
    slug: 'unlabelled-overflow-labels',
    ref: 'X18',
    taxonomyId: 'F-NAV-01',
    hostRoute: '/mail/labels',
    hostCode: 'M_LABEL_VISUAL_MISMATCH',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_LOW_CONTRAST_SELECTED_STATE',
    slug: 'low-contrast-selected-state',
    ref: 'X15',
    taxonomyId: 'F-PRC-06',
    hostRoute: '/settings/preferences',
    hostCode: 'M_TOGGLE_POINTEREVENTS_NONE',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_OPAQUE_CHART_SEGMENTS',
    slug: 'opaque-chart-segments',
    ref: 'X14',
    taxonomyId: 'F-PRC-05',
    hostRoute: '/dashboard/overview',
    hostCode: 'M_DISABLED_LOOKS_ENABLED',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_SYSTEM_PHOTO_PICKER_COMPOSE',
    slug: 'system-photo-picker-compose',
    ref: 'X12',
    taxonomyId: 'F-PRC-04',
    hostRoute: '/social/compose',
    hostCode: 'M_REQUIRED_FIELD_NO_INDICATOR',
    modifiesHost: false,
    isolation: 'gated',
  },
  {
    code: 'M_SYSTEM_SHARE_SHEET_GALLERY',
    slug: 'system-share-sheet-gallery',
    ref: 'X11',
    taxonomyId: 'F-PRC-04',
    hostRoute: '/shop/gallery',
    hostCode: 'M_DEAD_CAROUSEL_ARROWS',
    modifiesHost: false,
    isolation: 'gated',
  },
  {
    code: 'M_ACTION_HIDDEN_AMONG_SIBLINGS',
    slug: 'action-hidden-among-siblings',
    ref: 'X10',
    taxonomyId: 'F-PRC-03',
    hostRoute: '/social/profile',
    hostCode: 'M_ZERO_HIT_AREA_FOLLOW',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_WEBVIEW_OPAQUE_GIFTCARD',
    slug: 'webview-opaque-giftcard',
    ref: 'X09',
    taxonomyId: 'F-PRC-02',
    hostRoute: '/shop/checkout',
    hostCode: 'M_SWAPPED_DIALOG_BUTTONS',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_WEBVIEW_OPAQUE_PRIVACY_PANEL',
    slug: 'webview-opaque-privacy-panel',
    ref: 'X08',
    taxonomyId: 'F-PRC-02',
    hostRoute: '/appstore/listing',
    hostCode: 'M_UNSUPPORTED_LANGUAGE_CONTENT',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_DEUTERANOPIA_PRIORITY_FLAGS',
    slug: 'deuteranopia-priority-flags',
    ref: 'X07',
    taxonomyId: 'F-IDT-05',
    hostRoute: '/tasks/checklist',
    hostCode: 'M_DECOY_OVERLAY_CHECKBOX',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_COLOR_INVERSION_CALENDAR_PICKER',
    slug: 'color-inversion-calendar-picker',
    ref: 'X06',
    taxonomyId: 'F-IDT-05',
    hostRoute: '/calendar/new',
    hostCode: 'M_INPUT_SILENT_TRUNCATE',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_REBRAND_COLLISION_NOTIFICATIONS',
    slug: 'rebrand-collision-notifications',
    ref: 'X05',
    taxonomyId: 'F-IDT-04',
    hostRoute: '/settings/notifications',
    hostCode: 'M_DEAD_CHECKBOX',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_REPEATED_GLYPH_PHOTO_ACTIONS',
    slug: 'repeated-glyph-photo-actions',
    ref: 'X04',
    taxonomyId: 'F-IDT-03',
    hostRoute: '/photos/album',
    hostCode: 'M_MISSING_SORT_CONTROLS',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_OVERLOADED_ICON_ALBUM_MORE',
    slug: 'overloaded-icon-album-more',
    ref: 'X03',
    taxonomyId: 'F-IDT-03',
    hostRoute: '/music/album',
    hostCode: 'M_DUPLICATE_ACCESSIBLE_NAME',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_DISABLED_STYLED_SORTCODE',
    slug: 'disabled-styled-sortcode',
    ref: 'X02',
    taxonomyId: 'F-IDT-02',
    hostRoute: '/banking/payee',
    hostCode: 'M_TRANSIENT_CONFIRMATION',
    modifiesHost: false,
    isolation: 'disjoint-region',
  },
  {
    code: 'M_A11Y_HEADER_TEXT_MISMATCH',
    slug: 'a11y-header-text-mismatch',
    ref: 'X21',
    taxonomyId: 'F-CNT-01',
    hostRoute: '/careers/reapply',
    hostCode: 'M_SILENT_FAILED_SUBMISSION',
    // Owns the header block: a second correctly-named title node would defeat it.
    modifiesHost: true,
    isolation: 'disjoint-region',
  },
];
