import type { ComponentType } from 'react';

import NonClickableNormalCta from './non-clickable-normal-cta';
import ClickNoVisibleEffect from './click-no-visible-effect';
import ActionNotExposedInTree from './action-not-exposed-in-tree';
import MissingAccessibleName from './missing-accessible-name';
import BlockingModalNoClose from './blocking-modal-no-close';
import AsyncContentLateRender from './async-content-late-render';
import GhostElementNoBackingNode from './ghost-element-no-backing-node';
import DenseTouchTargets from './dense-touch-targets';
import SwipeAmbiguousDirection from './swipe-ambiguous-direction';
import LongPressContextMenu from './long-press-context-menu';
import CustomSliderMissingA11y from './custom-slider-missing-a11y';

interface ScreenProps {
  faultActive?: boolean;
}

export const failureRegistry: Record<string, ComponentType<ScreenProps>> = {
  'non-clickable-normal-cta': NonClickableNormalCta,
  'click-no-visible-effect': ClickNoVisibleEffect,
  'action-not-exposed-in-tree': ActionNotExposedInTree,
  'missing-accessible-name': MissingAccessibleName,
  'blocking-modal-no-close': BlockingModalNoClose,
  'async-content-late-render': AsyncContentLateRender,
  'ghost-element-no-backing-node': GhostElementNoBackingNode,
  'dense-touch-targets': DenseTouchTargets,
  'swipe-ambiguous-direction': SwipeAmbiguousDirection,
  'long-press-context-menu': LongPressContextMenu,
  'custom-slider-missing-a11y': CustomSliderMissingA11y,
};
