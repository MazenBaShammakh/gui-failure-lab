import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Result {
  id: string;
  name: string;
  price: string;
  emoji: string;
  sponsored: boolean;
}

// Sponsored and organic entries are interleaved, and the sponsored ones are the
// more prominent-sounding products — so "the obvious result" is the paid one.
const RESULTS: Result[] = [
  { id: 'r1', name: 'ProChef Ceramic Pan 28cm', price: '$74.00', emoji: '🍳', sponsored: true },
  { id: 'r2', name: 'Everyday Ceramic Pan 28cm', price: '$41.00', emoji: '🍳', sponsored: false },
  { id: 'r3', name: 'ProChef Knife Block Set', price: '$129.00', emoji: '🔪', sponsored: true },
  { id: 'r4', name: 'Ridge Chef Knife 20cm', price: '$38.00', emoji: '🔪', sponsored: false },
  { id: 'r5', name: 'ProChef Steel Stockpot', price: '$96.00', emoji: '🍲', sponsored: true },
  { id: 'r6', name: 'Basics Stockpot 5L', price: '$29.00', emoji: '🍲', sponsored: false },
];

/** The 2nd organic result: r2 is the 1st, r4 is the 2nd. */
const TARGET_ID = 'r4';

/**
 * X23 · M_CAMOUFLAGED_SPONSORED_ROWS — F-CNT-02 Cluttered List with Similar
 * Items. Third observation of the type; hosted on the Listing
 * (M_TEXT_AS_IMAGE).
 *
 * Mechanism — the list is cluttered by an ADVERSARIAL CLASS DISTINCTION rather
 * than by near-duplicate content. The three observations differ in what makes
 * the right row hard to pick:
 *   · M_CLUTTERED_SIMILAR_LIST (F6.2, /careers/similar): rows are genuinely
 *     alike; the difficulty is discrimination between similar things.
 *   · X22 (/dashboard/reports): rows differ by exactly one short token; the
 *     difficulty is precision on a single character.
 *   · X23 (here): the rows are easy to tell apart — but the property the task
 *     depends on ("organic", i.e. not paid placement) is DELIBERATELY NOT
 *     RENDERED. Sponsored rows are styled identically to organic ones and carry
 *     no badge, no label, and no accessibility hint distinguishing them.
 *
 * This is the case where more careful reading does not help: the discriminating
 * attribute is absent from both channels, so counting "the second result" returns
 * a sponsored row and any answer is unverifiable from the screen. It models a
 * real dark pattern rather than an accident, which is why the sponsored entries
 * are also the more authoritative-sounding products.
 *
 *   Baseline: every paid row carries a visible "Sponsored" badge and says so in
 *             its accessible name, so organic results can be counted directly.
 *   Faulty:   the badge and the label text are removed; ordering is unchanged.
 *
 *   Fails:    vision-only AND text-only.
 *
 * Isolation: its own "Kitchen essentials" results block below the host's featured
 * cards. The host's defect bakes sale prices into an image on the FEATURED cards;
 * this task never reads those, and these rows use real Text for every price.
 */
export default function CamouflagedSponsoredRowsFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [opened, setOpened] = useState<Result | null>(null);

  return (
    <View style={styles.wrap} testID={faultActive ? 'defect:M_CAMOUFLAGED_SPONSORED_ROWS' : undefined}>
      <Text style={styles.heading}>Kitchen essentials</Text>

      {RESULTS.map((r) => (
        <Pressable
          key={r.id}
          style={styles.row}
          onPress={() => setOpened(r)}
          accessibilityRole="button"
          accessibilityLabel={
            r.sponsored && !faultActive
              ? `Sponsored result: ${r.name}, ${r.price}`
              : `${r.name}, ${r.price}`
          }
        >
          <Text style={styles.rowEmoji}>{r.emoji}</Text>
          <View style={styles.rowInfo}>
            <Text style={styles.rowName}>{r.name}</Text>
            {/* Baseline only: the paid-placement disclosure. */}
            {r.sponsored && !faultActive && (
              <View style={styles.sponsoredBadge}>
                <Text style={styles.sponsoredText}>Sponsored</Text>
              </View>
            )}
          </View>
          <Text style={styles.rowPrice}>{r.price}</Text>
        </Pressable>
      ))}

      {opened && (
        <Text
          style={[styles.opened, opened.id !== TARGET_ID && styles.openedWrong]}
          accessibilityLiveRegion="polite"
        >
          Opened: {opened.name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 20, gap: 6 },
  heading: { fontSize: 15, fontWeight: '800', color: '#111', marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  rowEmoji: { fontSize: 22 },
  rowInfo: { flex: 1, gap: 3, alignItems: 'flex-start' },
  rowName: { fontSize: 14, color: '#111', fontWeight: '600' },
  sponsoredBadge: {
    backgroundColor: '#eceff1',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sponsoredText: { fontSize: 10, color: '#78909c', fontWeight: '800', letterSpacing: 0.4 },
  rowPrice: { fontSize: 14, color: '#111', fontWeight: '700' },
  opened: { fontSize: 13, color: '#2e7d32', fontWeight: '700', marginTop: 6 },
  openedWrong: { color: '#555' },
});
