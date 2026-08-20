import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

/** The real, authoritative answer — it only lands after this delay. */
const LATE_MS = 12000;
/** Baseline resolves within a normal budget. */
const FAST_MS = 400;

/**
 * X30 · M_LATE_STOCK_FETCH — F-TMP-02 Slow Page Load Exceeds Agent Timing Budget.
 * Third observation of the type; hosted on the product page
 * (B_NON_CLICKABLE_NORMAL_CTA).
 *
 * Mechanism — a LATE SECONDARY fetch on an already-complete screen, distinct from
 * the two existing observations that delay the WHOLE first paint:
 *   · B_ASYNC_CONTENT_LATE_RENDER (/careers) and M_LATE_RENDER_INBOX (E30,
 *     /mail/sync) both render nothing until a slow load finishes. The screen is
 *     visibly empty, so an agent knows to wait — the only risk is that it gives up.
 *   · X30 (here): the page paints instantly and completely. Only one datum — the
 *     stock status — is fetched separately, and in faulty mode it shows a definite,
 *     plausible-looking placeholder ("In stock") with NO spinner while the real
 *     value ("Out of stock") is still ~12s out.
 *
 * Because nothing on screen is pending or spinning, there is no cue to wait. An
 * agent reads a complete-looking page within its timing budget and answers from a
 * value that has not settled — the classic partial-render trap. The answer even
 * looks confirmed (a green "In stock" with a tick), so confidence is high and
 * wrong.
 *
 *   Baseline: a brief spinner (400ms) precedes the real value, so what is shown
 *             is always the settled answer.
 *   Faulty:   an immediate stale "In stock", no spinner; it flips to "Out of
 *             stock" at ~12s — past a typical read.
 *
 *   Fails:    vision-only AND text-only (both read the pre-settlement value).
 *
 * NOTE re-scoped from the plan's [host] sketch: this is a self-contained
 * availability block inserted after the price, not a hand-off of the host's price
 * render — so it does not modify host-owned UI. The host's own defect is the
 * non-clickable Add to Cart below; this task only reads stock and never taps it.
 */
export default function LateStockFetchFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  // Faulty: start "settled" on a stale value (no spinner). Baseline: start
  // pending with a spinner, then settle fast on the real value.
  const [settled, setSettled] = useState(faultActive);
  const [inStock, setInStock] = useState<boolean>(true);

  useEffect(() => {
    const delay = faultActive ? LATE_MS : FAST_MS;
    const t = setTimeout(() => {
      // The authoritative result: this product is out of stock.
      setInStock(false);
      setSettled(true);
    }, delay);
    return () => clearTimeout(t);
  }, [faultActive]);

  return (
    <View style={styles.wrap} testID={faultActive ? 'defect:M_LATE_STOCK_FETCH' : undefined}>
      <Text style={styles.label}>Availability</Text>

      {!settled ? (
        // Baseline pending: an explicit spinner tells any reader the value is not
        // ready yet.
        <View style={styles.pendingRow} accessibilityLabel="Checking availability">
          <ActivityIndicator size="small" color="#888" />
          <Text style={styles.pendingText}>Checking availability…</Text>
        </View>
      ) : (
        <Text
          style={[styles.value, inStock ? styles.inStock : styles.outStock]}
          accessibilityLiveRegion="polite"
          accessibilityLabel={inStock ? 'In stock' : 'Out of stock'}
        >
          {inStock ? '✓ In stock' : '✕ Out of stock · back in ~2 weeks'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4, marginBottom: 4, gap: 4 },
  label: { fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pendingText: { fontSize: 14, color: '#888' },
  value: { fontSize: 15, fontWeight: '700' },
  inStock: { color: '#2e7d32' },
  outStock: { color: '#c62828' },
});
