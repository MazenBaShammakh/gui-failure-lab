import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

/**
 * X34 · M_CHAT_BUBBLE_OVERLAY_CTA — F-INS-02 Invisible Clickable Overlay Captures
 * Input. Third observation of the type; hosted on the Quantity screen
 * (M_DEAD_STEPPER).
 *
 * Mechanism — a REAL, LIVE widget with an oversized transparent hit area, not a
 * purpose-built decoy. The three observations differ in what the overlay IS:
 *   · M_INVISIBLE_TAP_OVERLAY (E03, /mail/inbox): a bare transparent View placed
 *     to eat taps — an artefact with no other purpose.
 *   · M_DECOY_OVERLAY_CHECKBOX (E20, /tasks/checklist): a transparent decoy over
 *     one specific control.
 *   · X34 (here): a genuine support-chat button that legitimately exists on the
 *     page, whose touch target has simply been made far larger than its visible
 *     bubble — a common real bug (a full-width invisible tap zone around a small
 *     FAB). That zone happens to blanket the "Add to cart" CTA beneath it.
 *
 * This is the most realistic of the three and the hardest to attribute: there IS
 * a visible thing near the tap (the chat bubble), so a vision-only agent that
 * notices its tap "did something" may rationalise the opened chat as expected
 * chrome rather than a mis-hit. The CTA is fully visible and correctly named in
 * both channels; nothing marks it as unreachable.
 *
 *   Baseline: the chat button's hit area matches its visible bubble, so the CTA
 *             beneath is freely tappable and adds to the cart.
 *   Faulty:   the chat button's transparent hit area is stretched to cover the
 *             CTA, so the first "Add to cart" tap opens the chat instead.
 *
 *   Fails:    vision-only AND text-only (both aim at the CTA; the overlay wins).
 *
 * IMPLEMENTATION — mounted INSIDE a relative wrapper the host places around its
 * Add-to-cart Pressable, so the capture layer is bounded to the CTA exactly. The
 * host also gains real `added` state (its stub CTA was a no-op), so baseline can
 * succeed. The host's own defect is the dead +/- stepper above; this task uses
 * the default quantity and never touches it.
 */
export default function ChatBubbleOverlayCtaFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {/* Faulty: the chat widget's transparent hit area is stretched across the
          whole CTA wrapper. Rendered last, so it captures the tap. It is not
          invisible chrome for its own sake — pressing it opens the real chat. */}
      {faultActive && (
        <Pressable
          style={styles.captureLayer}
          onPress={() => setChatOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Chat with support"
        >
          {/* The only painted part: a small bubble in the corner. The rest of the
              pressable is transparent and overlaps the CTA. */}
          <View style={styles.bubble}>
            <Text style={styles.bubbleGlyph}>💬</Text>
          </View>
        </Pressable>
      )}

      {chatOpen && (
        <View style={styles.chatPanel} accessibilityLiveRegion="polite">
          <Text style={styles.chatTitle}>Support chat</Text>
          <Text style={styles.chatBody}>Hi! How can we help with your order?</Text>
          <Pressable
            style={styles.chatClose}
            onPress={() => setChatOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close support chat"
          >
            <Text style={styles.chatCloseText}>Close</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Covers the wrapper (== the CTA) plus a little above it, matching a plausibly
  // oversized FAB hit target.
  captureLayer: {
    ...StyleSheet.absoluteFillObject,
    top: -12,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a84ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    marginBottom: 4,
  },
  bubbleGlyph: { fontSize: 18 },
  chatPanel: {
    marginTop: 10,
    backgroundColor: '#eef4ff',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  chatTitle: { fontSize: 14, fontWeight: '800', color: '#0a3d91' },
  chatBody: { fontSize: 13, color: '#33507a' },
  chatClose: { alignSelf: 'flex-start', paddingVertical: 6 },
  chatCloseText: { fontSize: 13, color: '#0a84ff', fontWeight: '700' },
});
