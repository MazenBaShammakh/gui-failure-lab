import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

/** Shared with the host so its scroll padding can be reasoned about. */
export const STICKY_BAR_HEIGHT = 60;

/**
 * X35 · M_STICKY_BAR_OCCLUDES_ROW — F-INS-03 Visual Occlusion by Non-Blocking
 * Overlay. Third observation of the type; hosted on Filter jobs
 * (M_DEAD_DROPDOWN).
 *
 * Mechanism — the overlay occludes a LIST ROW rather than a CTA, and the content
 * is reachable in principle but nothing says so. The three observations differ in
 * what is hidden and whether it can be recovered:
 *   · M_BANNER_OCCLUDES_CTA (E04, /dashboard/reports): a banner covers the export
 *     CTA — a single fixed control, simply hidden.
 *   · M_NONBLOCKING_OVERLAY_OCCLUSION (F9.3, /dashboard/alerts): a transient
 *     overlay covers the refresh control.
 *   · X35 (here): an opaque "sticky" bar is pinned to the bottom of the viewport
 *     over a SCROLLABLE list, and the list has no bottom padding to clear it. The
 *     last role therefore sits permanently in the strip the bar owns: scrolling to
 *     the end does not lift it clear, and there is no scroll indicator or "more
 *     below" cue to suggest content is being hidden. The bar is non-blocking —
 *     the list scrolls fine underneath — so nothing reads as broken; the last row
 *     is simply, quietly, never visible.
 *
 * The recovery an agent would try (scroll further) does not work, because the
 * occlusion is at a fixed screen position, not below the fold. That is what makes
 * it distinct from an ordinary off-screen item.
 *
 *   Baseline: the list reserves bottom padding equal to the bar height, so the
 *             last role scrolls into the clear above the bar.
 *   Faulty:   no such padding — the last role stays behind the bar.
 *
 *   Fails:    vision-only AND text-only (the row is present in the tree but its
 *             hit area is covered by the bar; a tap lands on the bar).
 *
 * Isolation: pinned to the bottom; the host's defect is the dead location
 * dropdown at the TOP, which this task never opens.
 */
export default function StickyBarOccludesRowFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  return (
    <View
      style={styles.bar}
      // Non-blocking to scroll gestures, but opaque and tap-catching where it sits.
      testID={faultActive ? 'defect:M_STICKY_BAR_OCCLUDES_ROW' : undefined}
    >
      <Text style={styles.text}>✨ 3 new roles since your last visit</Text>
      <Pressable
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="View new roles"
        onPress={() => {}}
      >
        <Text style={styles.buttonText}>View</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: STICKY_BAR_HEIGHT,
    backgroundColor: '#1565c0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  text: { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1 },
  button: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  buttonText: { color: '#1565c0', fontSize: 13, fontWeight: '800' },
});
