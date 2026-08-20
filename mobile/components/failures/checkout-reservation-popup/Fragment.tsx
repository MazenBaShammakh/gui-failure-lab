import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
  /** Owned by the host Checkout button — this is the "entering checkout" gate. */
  visible: boolean;
  onClose: () => void;
}

/** Delay past a typical agent snapshot of the checkout sub-step. */
const POPUP_MS = 1200;

/**
 * X31 · M_CHECKOUT_RESERVATION_POPUP — F-TMP-03 Popup Appears After Snapshot.
 * Third observation of the type; hosted on the Cart (M_SWIPE_NO_CUE_CART).
 *
 * Mechanism — the popup ABSORBS THE TAP with NO layout shift, distinct from the
 * two existing observations:
 *   · M_POPUP_AFTER_SNAPSHOT (F8.3, /tasks/sync): a toast is injected at the
 *     target's coordinates after the snapshot; the tap lands on the toast instead
 *     of the control beneath.
 *   · M_LAYOUT_SHIFT_MISTAP (P08, /social/timeline): a delayed banner pushes the
 *     layout down, so the tap lands on the wrong (shifted) row.
 *   · X31 (here): the popup neither moves other content NOR sits at a decoy
 *     location — it materialises directly over the "Place order" CTA the agent
 *     already located, as an opaque, tappable overlay. The agent's tap, planned
 *     against the pre-popup snapshot, lands exactly where it intended and still
 *     misses, because what is now under the cursor is the reservation toast, not
 *     the button. Dismissing the toast reveals the unchanged button, so re-reading
 *     shows nothing wrong — the layout never shifted and the CTA never moved.
 *
 * GATED on entering checkout (this component is only mounted once the host's
 * Checkout button sets `visible`), NOT on mount — so the host's swipe-to-remove
 * task, which never opens checkout, never arms it (plan §4 Rule B). The timer is
 * keyed to the sub-step becoming visible, so the popup lands after the agent's
 * snapshot of THAT step.
 *
 *   Baseline: no toast; "Place order" places the order.
 *   Faulty:   ~1.2s after the sub-step opens, the reservation toast covers the
 *             CTA and swallows the next tap.
 *
 *   Fails:    vision-only AND text-only (both plan a tap the overlay intercepts).
 */
export default function CheckoutReservationPopupFragment({
  faultActive: faultActiveProp,
  visible,
  onClose,
}: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [toastVisible, setToastVisible] = useState(false);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    if (!visible) {
      // Reset each time the sub-step is reopened.
      setToastVisible(false);
      setPlaced(false);
      return;
    }
    if (!faultActive) return;
    const t = setTimeout(() => setToastVisible(true), POPUP_MS);
    return () => clearTimeout(t);
  }, [visible, faultActive]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={styles.sheet}
          testID={faultActive && visible ? 'defect:M_CHECKOUT_RESERVATION_POPUP' : undefined}
        >
          <View style={styles.grabber} />
          <Text style={styles.title}>Review your order</Text>

          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>4 items</Text>
            <Text style={styles.lineValue}>$220</Text>
          </View>
          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>Shipping</Text>
            <Text style={styles.lineValue}>$4.99</Text>
          </View>
          <View style={[styles.lineRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>$224.99</Text>
          </View>

          {placed && (
            <Text style={styles.placed} accessibilityLiveRegion="polite">
              ✓ Order placed — thank you!
            </Text>
          )}

          {/* The CTA the agent aims at. Its position never changes. */}
          <View style={styles.ctaSlot}>
            <Pressable
              style={styles.placeBtn}
              onPress={() => setPlaced(true)}
              accessibilityRole="button"
              accessibilityLabel="Place order"
            >
              <Text style={styles.placeBtnText}>Place order</Text>
            </Pressable>

            {/* Faulty: an opaque, tappable overlay lands exactly over the CTA
                after the snapshot. No layout shift — it is absolutely positioned
                and the button beneath is unmoved. Tapping it only dismisses it. */}
            {toastVisible && (
              <Pressable
                style={styles.reservationToast}
                onPress={() => setToastVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="2 items in your cart are reserved for 10:00. Tap to dismiss."
              >
                <Text style={styles.toastText}>⏳ 2 items reserved for 10:00 — dismiss</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    paddingBottom: 32,
    gap: 10,
  },
  grabber: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: '#d0d0d0' },
  title: { fontSize: 18, fontWeight: '800', color: '#111', marginTop: 4 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lineLabel: { fontSize: 14, color: '#666' },
  lineValue: { fontSize: 14, color: '#111', fontWeight: '600' },
  totalRow: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#eee', paddingTop: 8, marginTop: 2 },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#111' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#111' },
  placed: { fontSize: 14, color: '#2e7d32', fontWeight: '700', marginTop: 4 },

  // Fixed-height slot so the button position is deterministic and the overlay can
  // cover it exactly without moving anything.
  ctaSlot: { height: 52, marginTop: 8, justifyContent: 'center' },
  placeBtn: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  reservationToast: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4a2f00',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastText: { color: '#ffd699', fontSize: 14, fontWeight: '700' },
});
