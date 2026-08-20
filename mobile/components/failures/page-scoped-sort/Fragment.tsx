import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  emoji: string;
}

// 18 products; only the first PAGE are loaded initially. The genuine cheapest
// ($6 Sponge Pack) sits OUTSIDE the loaded page, so a sort that only reorders
// loaded rows can never surface it.
const PRODUCTS: Product[] = [
  { id: 'q01', name: 'Ceramic Mug', price: 12, emoji: '☕' },
  { id: 'q02', name: 'Desk Organizer', price: 24, emoji: '🗂️' },
  { id: 'q03', name: 'Notebook Set', price: 15, emoji: '📓' },
  { id: 'q04', name: 'Phone Grip', price: 9, emoji: '📱' },
  { id: 'q05', name: 'Cable Ties', price: 11, emoji: '🔌' },
  { id: 'q06', name: 'Sticky Notes', price: 8, emoji: '🗒️' },
  // --- everything below is unloaded until "Load more" ---
  { id: 'q07', name: 'Sponge Pack', price: 6, emoji: '🧽' },
  { id: 'q08', name: 'Dish Towels', price: 13, emoji: '🧺' },
  { id: 'q09', name: 'Storage Jar', price: 17, emoji: '🫙' },
  { id: 'q10', name: 'Trivet', price: 10, emoji: '🔥' },
  { id: 'q11', name: 'Measuring Cups', price: 14, emoji: '🥣' },
  { id: 'q12', name: 'Bottle Brush', price: 7, emoji: '🧴' },
  { id: 'q13', name: 'Oven Mitt', price: 12, emoji: '🧤' },
  { id: 'q14', name: 'Spice Rack', price: 26, emoji: '🧂' },
  { id: 'q15', name: 'Cutting Board', price: 21, emoji: '🔪' },
  { id: 'q16', name: 'Colander', price: 16, emoji: '🍚' },
  { id: 'q17', name: 'Tea Infuser', price: 9, emoji: '🍵' },
  { id: 'q18', name: 'Napkin Holder', price: 11, emoji: '🧻' },
];

const PAGE = 6;
// Intended answers (for reviewers): the true cheapest is q07 Sponge Pack at $6,
// which is unloaded; the cheapest among the first page only is q06 Sticky Notes
// at $8, which is what a faulty-mode page-scoped sort surfaces as the top row.

/**
 * X25 · M_PAGE_SCOPED_SORT — F-CNT-03 Missing Filter or Sort Controls. Third
 * observation of the type; hosted on Browse categories (M_GHOST_ELEMENTS_CAROUSEL).
 *
 * Mechanism — the sort control is PRESENT and appears to work, but silently
 * operates on the loaded page only. This is the sharpest of the three F-CNT-03
 * observations:
 *   · M_MISSING_SORT_CONTROLS (F6.3, /photos/album): no control, visibly
 *     scrambled — the agent knows it must inspect everything.
 *   · X24 (/mail/archive): no control, deceptively clean order — the agent may
 *     not realise inspection is needed.
 *   · X25 (here): a control EXISTS. "Sort by price" reorders the six loaded rows,
 *     so its output looks authoritative and complete. But 12 more products are
 *     unpaged, including the real cheapest, so the top row after sorting ($8
 *     Sticky Notes) is wrong — the true answer is the unloaded $6 Sponge Pack.
 *
 * A working-looking control is more dangerous than a missing one: it invites the
 * agent to DELEGATE the comparison and trust the result, removing the very
 * suspicion that manual inspection would raise. The only route to the right
 * answer is to page in the rest before sorting — which nothing prompts.
 *
 *   Baseline: sorting sorts the FULL set (auto-loading the remainder first), so
 *             the top row is the genuine cheapest.
 *   Faulty:   sorting reorders only what is currently loaded.
 *
 *   Fails:    vision-only AND text-only (both act on the sorted loaded page).
 *
 * Isolation: its own "Popular this week" grid, appended below the host's
 * carousels. The host's defect is ghost carousel cards; this grid is a paged
 * vertical list with none, and this task never touches the carousels.
 */
export default function PageScopedSortFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [loaded, setLoaded] = useState(PAGE);
  const [sorted, setSorted] = useState(false);

  const hasMore = loaded < PRODUCTS.length;

  const sortByPrice = () => {
    if (!faultActive) {
      // Baseline: pull in the full catalogue, THEN sort — the honest behaviour.
      setLoaded(PRODUCTS.length);
    }
    setSorted(true);
  };

  // The injection is entirely in the ORDER of operations: faulty sorts the
  // already-loaded slice; baseline has just loaded everything.
  const visible = PRODUCTS.slice(0, loaded);
  const rows = sorted ? [...visible].sort((a, b) => a.price - b.price) : visible;

  return (
    <View style={styles.wrap} testID={faultActive ? 'defect:M_PAGE_SCOPED_SORT' : undefined}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Popular this week</Text>
        <Pressable
          onPress={sortByPrice}
          style={[styles.sortBtn, sorted && styles.sortBtnOn]}
          accessibilityRole="button"
          accessibilityLabel="Sort by price, low to high"
          accessibilityState={{ selected: sorted }}
        >
          <Text style={[styles.sortText, sorted && styles.sortTextOn]}>↑ Price</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {rows.map((p) => (
          <View key={p.id} style={styles.card}>
            <Text style={styles.cardEmoji}>{p.emoji}</Text>
            <Text style={styles.cardName} numberOfLines={1}>
              {p.name}
            </Text>
            <Text style={styles.cardPrice}>${p.price}</Text>
          </View>
        ))}
      </View>

      {hasMore && (
        <Pressable
          style={styles.loadMore}
          onPress={() => setLoaded(PRODUCTS.length)}
          accessibilityRole="button"
          accessibilityLabel="Load more products"
        >
          <Text style={styles.loadMoreText}>Load more ({PRODUCTS.length - loaded} more)</Text>
        </Pressable>
      )}

      {sorted && rows.length > 0 && (
        <Text style={styles.debugNote} accessibilityLiveRegion="polite">
          Cheapest shown: {rows[0].name} ${rows[0].price}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 24, gap: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontSize: 18, fontWeight: '700', color: '#111' },
  sortBtn: {
    backgroundColor: '#eceff1',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sortBtnOn: { backgroundColor: '#1a1a1a' },
  sortText: { fontSize: 12, color: '#37474f', fontWeight: '700' },
  sortTextOn: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: 130,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  cardEmoji: { fontSize: 34 },
  cardName: { fontSize: 13, fontWeight: '600', color: '#111' },
  cardPrice: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  loadMore: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f0fe',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  loadMoreText: { fontSize: 12, color: '#1565c0', fontWeight: '700' },
  debugNote: { fontSize: 12, color: '#2e7d32', fontWeight: '600' },
});
