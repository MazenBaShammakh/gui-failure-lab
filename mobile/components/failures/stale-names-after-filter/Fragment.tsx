import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

type Category = 'all' | 'card' | 'transfer';

interface Txn {
  id: string;
  merchant: string;
  amount: string;
  when: string;
  category: Exclude<Category, 'all'>;
}

// Unfiltered order. Merchants are deliberately distinct from the host's Recent
// activity list so the two sections can never be confused for one another.
const TXNS: Txn[] = [
  { id: 's1', merchant: 'Netflix', amount: '-$17.99', when: 'Jul 18', category: 'card' },
  { id: 's2', merchant: 'Landlord', amount: '-$1,450.00', when: 'Jul 17', category: 'transfer' },
  { id: 's3', merchant: 'Whole Foods', amount: '-$86.42', when: 'Jul 16', category: 'card' },
  { id: 's4', merchant: 'Shell', amount: '-$61.10', when: 'Jul 15', category: 'card' },
  { id: 's5', merchant: 'Mum', amount: '-$200.00', when: 'Jul 14', category: 'transfer' },
  { id: 's6', merchant: 'Spotify', amount: '-$10.99', when: 'Jul 13', category: 'card' },
  { id: 's7', merchant: 'Gym', amount: '-$45.00', when: 'Jul 12', category: 'card' },
  { id: 's8', merchant: 'Savings', amount: '-$500.00', when: 'Jul 11', category: 'transfer' },
];

const FILTERS: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'card', label: 'Card payments' },
  { key: 'transfer', label: 'Transfers' },
];

/**
 * X17 · M_STALE_NAMES_AFTER_FILTER — F-STR-01 Recycled-View Stale Accessible
 * Name. Third observation of the type; hosted on Accounts (M_SWIPE_CATEGORIZE).
 *
 * Mechanism — the rebind is triggered by the AGENT'S OWN ACTION, and the tree is
 * CORRECT until it happens. This is what separates it from the other two:
 *   · M_RECYCLED_NODE_IDENTITY (A5, /tasks/longlist): staleness accumulates as
 *     the pool wraps during scrolling.
 *   · X16 (/photos): staleness is present from first render, camouflaged by grid
 *     layout.
 *   · X17 (here): every name is accurate on arrival. Applying a filter reuses the
 *     same row objects for a different subset and never refreshes their
 *     accessible names, so they keep the tenant they held BEFORE the filter.
 *
 * The consequence is specific and severe: an agent that verifies the list, then
 * narrows it, then acts on a name it already confirmed is operating on evidence
 * that its own interaction invalidated. Re-reading the tree after filtering does
 * not help either — the stale names are internally consistent and every one of
 * them is a real merchant from this account.
 *
 * Worked example (filter = Card payments):
 *   filtered row 1 shows "Whole Foods" but is NAMED "Landlord"
 *   filtered row 2 shows "Shell"       but is NAMED "Whole Foods"
 * so a text-only agent asked for the Whole Foods amount reports Shell's -$61.10.
 *
 *   Baseline: names are rebound with the data on every filter change.
 *   Faulty:   names stay bound to the pre-filter row at the same index.
 *
 *   Fails:    text-only (returns a confident, well-formed, wrong amount).
 *   Succeeds: vision-only (the merchant column is rebound correctly).
 *
 * Isolation: its own Statement section, rendered as the host list's footer. It
 * deliberately does NOT recycle the host's Recent activity list, which already
 * carries a region-scoped defect (plan §4 Rule C).
 */
export default function StaleNamesAfterFilterFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [filter, setFilter] = useState<Category>('all');

  const rows = filter === 'all' ? TXNS : TXNS.filter((t) => t.category === filter);

  return (
    <View style={styles.wrap} testID={faultActive ? 'defect:M_STALE_NAMES_AFTER_FILTER' : undefined}>
      <Text style={styles.heading}>Statement</Text>

      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Filter by ${f.label}`}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {rows.map((txn, index) => {
        // Faulty: the row object at this index was previously bound to the
        // unfiltered transaction at the same index, and its accessible name was
        // never refreshed when the data changed underneath it.
        const staleTenant = TXNS[index];
        const named = faultActive ? staleTenant : txn;

        return (
          <Pressable
            key={txn.id}
            nativeID={faultActive ? `rv_txn_${index}` : `txn_${txn.id}`}
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel={`${named.merchant}, ${named.amount}, ${named.when}`}
          >
            <View
              style={styles.rowInfo}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
            >
              <Text style={styles.merchant}>{txn.merchant}</Text>
              <Text style={styles.when}>{txn.when}</Text>
            </View>
            <Text
              style={styles.amount}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
            >
              {txn.amount}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 28 },
  heading: { fontSize: 15, fontWeight: '800', color: '#111', marginBottom: 10 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  chip: {
    backgroundColor: '#eceff1',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: '#0288d1' },
  chipText: { fontSize: 12, color: '#546e7a', fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eceff1',
  },
  rowInfo: { gap: 2 },
  merchant: { fontSize: 14, color: '#111', fontWeight: '600' },
  when: { fontSize: 11, color: '#9e9e9e' },
  amount: { fontSize: 14, color: '#111', fontWeight: '700' },
});
