import type { ComponentType } from 'react';
import NonClickableCtaPage from '@/components/failures/non-clickable-normal-cta/Page';
import ActionNotExposedInTreePage from '@/components/failures/action-not-exposed-in-tree/Page';
import AriaHiddenSwallowsControlPage from '@/components/failures/aria-hidden-swallows-control/Page';
import NativeDialogOutsideDomPage from '@/components/failures/native-dialog-outside-dom/Page';
import LowContrastBoundaryPage from '@/components/failures/low-contrast-boundary/Page';
import StaticElementStyledActionablePage from '@/components/failures/static-element-styled-actionable/Page';
import ActionableElementStyledStaticPage from '@/components/failures/actionable-element-styled-static/Page';
import OverloadedIconMultiPurposePage from '@/components/failures/overloaded-icon-multi-purpose/Page';
import RebrandBreaksGroundingPage from '@/components/failures/rebrand-breaks-grounding/Page';
import DomOrderVisualMismatchPage from '@/components/failures/dom-order-visual-mismatch/Page';
import PopupOutsideDomHierarchyPage from '@/components/failures/popup-outside-dom-hierarchy/Page';
import DomPresentVisuallyHiddenPage from '@/components/failures/dom-present-visually-hidden/Page';
import GestureOnlyNoVisibleCuePage from '@/components/failures/gesture-only-no-visible-cue/Page';
import ComboboxUncommittedValuePage from '@/components/failures/combobox-uncommitted-value/Page';
import HiddenBehindMenuOnlyPathPage from '@/components/failures/hidden-behind-menu-only-path/Page';
import HeadingLabelMismatchPage from '@/components/failures/heading-label-mismatch/Page';
import ClutteredListSimilarItemsPage from '@/components/failures/cluttered-list-similar-items/Page';
import MissingFilterSortControlsPage from '@/components/failures/missing-filter-sort-controls/Page';
import UnsupportedLanguageContentPage from '@/components/failures/unsupported-language-content/Page';
import NonUpdatedStateAfterFailedActionPage from '@/components/failures/non-updated-state-after-failed-action/Page';
import VagueValidationErrorPage from '@/components/failures/vague-validation-error/Page';
import RequiredFieldNoIndicatorPage from '@/components/failures/required-field-no-indicator/Page';
import ClickNoVisibleEffectPage from '@/components/failures/click-no-visible-effect/Page';
import UnboundedInfiniteScrollPage from '@/components/failures/unbounded-infinite-scroll/Page';
import LateRenderOutsideViewportPage from '@/components/failures/late-render-outside-viewport/Page';
import SlowLoadExceedsBudgetPage from '@/components/failures/slow-load-exceeds-budget/Page';
import PopupAfterSnapshotPage from '@/components/failures/popup-after-snapshot/Page';
import BlockingModalNoClosePage from '@/components/failures/blocking-modal-no-close/Page';
import InvisibleOverlayCapturesClicksPage from '@/components/failures/invisible-overlay-captures-clicks/Page';
import VisualOcclusionNonBlockingOverlayPage from '@/components/failures/visual-occlusion-non-blocking-overlay/Page';
import ColorTransformDefeatsCuePage from '@/components/failures/color-transform-defeats-cue/Page';
import GhostElementStaleListNodePage from '@/components/failures/ghost-element-stale-list-node/Page';
import RecycledRowStaleLabelPage from '@/components/failures/recycled-row-stale-label/Page';
import ActionMisroutedAcrossTabsPage from '@/components/failures/action-misrouted-across-tabs/Page';
import StaleRouteRemovedPagePage from '@/components/failures/stale-route-removed-page/Page';

type FailurePageComponent = ComponentType<{ faultActive?: boolean }>;

const pages: Record<string, FailurePageComponent> = {
  'non-clickable-normal-cta': NonClickableCtaPage,
  'action-not-exposed-in-tree': ActionNotExposedInTreePage,
  'aria-hidden-swallows-control': AriaHiddenSwallowsControlPage,
  'native-dialog-outside-dom': NativeDialogOutsideDomPage,
  'low-contrast-boundary': LowContrastBoundaryPage,
  'static-element-styled-actionable': StaticElementStyledActionablePage,
  'actionable-element-styled-static': ActionableElementStyledStaticPage,
  'overloaded-icon-multi-purpose': OverloadedIconMultiPurposePage,
  'rebrand-breaks-grounding': RebrandBreaksGroundingPage,
  'dom-order-visual-mismatch': DomOrderVisualMismatchPage,
  'popup-outside-dom-hierarchy': PopupOutsideDomHierarchyPage,
  'dom-present-visually-hidden': DomPresentVisuallyHiddenPage,
  'gesture-only-no-visible-cue': GestureOnlyNoVisibleCuePage,
  'combobox-uncommitted-value': ComboboxUncommittedValuePage,
  'hidden-behind-menu-only-path': HiddenBehindMenuOnlyPathPage,
  'heading-label-mismatch': HeadingLabelMismatchPage,
  'cluttered-list-similar-items': ClutteredListSimilarItemsPage,
  'missing-filter-sort-controls': MissingFilterSortControlsPage,
  'unsupported-language-content': UnsupportedLanguageContentPage,
  'non-updated-state-after-failed-action': NonUpdatedStateAfterFailedActionPage,
  'vague-validation-error': VagueValidationErrorPage,
  'required-field-no-indicator': RequiredFieldNoIndicatorPage,
  'click-no-visible-effect': ClickNoVisibleEffectPage,
  'unbounded-infinite-scroll': UnboundedInfiniteScrollPage,
  'late-render-outside-viewport': LateRenderOutsideViewportPage,
  'slow-load-exceeds-budget': SlowLoadExceedsBudgetPage,
  'popup-after-snapshot': PopupAfterSnapshotPage,
  'blocking-modal-no-close': BlockingModalNoClosePage,
  'invisible-overlay-captures-clicks': InvisibleOverlayCapturesClicksPage,
  'visual-occlusion-non-blocking-overlay': VisualOcclusionNonBlockingOverlayPage,
  'color-transform-defeats-cue': ColorTransformDefeatsCuePage,
  'ghost-element-stale-list-node': GhostElementStaleListNodePage,
  'recycled-row-stale-label': RecycledRowStaleLabelPage,
  'action-misrouted-across-tabs': ActionMisroutedAcrossTabsPage,
  'stale-route-removed-page': StaleRouteRemovedPagePage,
};

export function getFailurePage(id: string): FailurePageComponent | null {
  return pages[id] ?? null;
}
