import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const VALID_SUFFIX = '4417';

/**
 * X09 · M_WEBVIEW_OPAQUE_GIFTCARD — F-PRC-02 WebView Content Opaque to Native
 * A11y Tree. Third observation of the type; hosted on Checkout
 * (M_SWAPPED_DIALOG_BUTTONS).
 *
 * Mechanism — an UNNAMED opaque region next to a working wrong action. The three
 * observations differ in what the agent is left able to conclude:
 *   · A1 (/banking/webform): the screen IS the WebView, exposed as one node named
 *     "Web content". The agent can tell it is blocked and why.
 *   · X08 (/appstore/listing): a labelled opaque panel; the agent knows a region
 *     exists but cannot read it.
 *   · X09 (here): the third-party redeem widget is withdrawn from the tree with
 *     NO accessible name at all. A text-only agent has no evidence a gift-card
 *     facility exists on this screen — and a fully functional "Place Order"
 *     button sits directly beneath it. The most plausible next action is to place
 *     the order without redeeming, which succeeds and looks correct.
 *
 * So the failure is not "blocked", nor "under-informed", but *misled into
 * completing the wrong transaction* — the task said redeem first.
 *
 *   Baseline: the bridge is wired; the field and button are named and reachable.
 *   Faulty:   the whole widget is one unnamed, elided container.
 *
 *   Fails:    text-only.
 *   Succeeds: vision-only (the widget is drawn and operable).
 *
 * Isolation: sits above the totals, mid-screen. The host's defect lives in the
 * confirmation dialog raised by "Place Order"; this task redeems and stops, so
 * that dialog is never opened.
 */
export default function WebViewOpaqueGiftcardFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [code, setCode] = useState('');
  const [redeemed, setRedeemed] = useState(false);
  const [error, setError] = useState(false);

  const redeem = () => {
    if (code.trim().endsWith(VALID_SUFFIX)) {
      setRedeemed(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <View testID={faultActive ? 'defect:M_WEBVIEW_OPAQUE_GIFTCARD' : undefined}>
      <Text style={styles.sectionTitle}>Gift card</Text>

      {/* Third-party redeem widget in an embedded WebView. Faulty: withdrawn from
          the native tree with no accessibleLabel, so nothing announces it. */}
      <View
        style={styles.webview}
        accessible={faultActive}
        accessibilityElementsHidden={faultActive}
        importantForAccessibility={faultActive ? 'no-hide-descendants' : 'auto'}
      >
        <View style={styles.chrome}>
          <Text style={styles.chromeUrl}>secure.giftpay.example/redeem</Text>
        </View>

        <View style={styles.body}>
          {redeemed ? (
            <Text style={styles.redeemed}>✓ $25.00 gift card applied</Text>
          ) : (
            <>
              <Text style={styles.hint}>Enter your gift card number</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={code}
                  onChangeText={(t) => {
                    setCode(t);
                    setError(false);
                  }}
                  placeholder="•••• •••• •••• 4417"
                  placeholderTextColor="#9e9e9e"
                  accessibilityLabel="Gift card number"
                  keyboardType="number-pad"
                />
                <Pressable
                  style={styles.redeemBtn}
                  onPress={redeem}
                  accessibilityRole="button"
                  accessibilityLabel="Redeem gift card"
                >
                  <Text style={styles.redeemBtnText}>Redeem</Text>
                </Pressable>
              </View>
              {error && <Text style={styles.error}>That card number was not recognised.</Text>}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  webview: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d8dade',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  chrome: { backgroundColor: '#eceff1', paddingHorizontal: 10, paddingVertical: 6 },
  chromeUrl: { fontSize: 11, color: '#78909c' },
  body: { padding: 12, gap: 8 },
  hint: { fontSize: 12, color: '#78909c' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: '#f6f6f8',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#dcdce0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    color: '#111',
  },
  redeemBtn: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  redeemBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  redeemed: { fontSize: 14, color: '#2e7d32', fontWeight: '700' },
  error: { fontSize: 12, color: '#c62828' },
});
