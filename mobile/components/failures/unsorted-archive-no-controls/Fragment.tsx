import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Archived {
  id: string;
  from: string;
  subject: string;
  /** Sortable. Rendered as a relative string so no absolute date is visible. */
  daysAgo: number;
}

// Archive order is by DATE ARCHIVED, not date received — so the list looks
// ordered while the property the task asks about is scattered through it.
const ARCHIVE: Archived[] = [
  { id: 'v01', from: 'Dropbox', subject: 'Your files are ready', daysAgo: 12 },
  { id: 'v02', from: 'Lena Müller', subject: 'Re: Budget approval Q3', daysAgo: 240 },
  { id: 'v03', from: 'GitHub', subject: 'Security advisory for lodash', daysAgo: 58 },
  { id: 'v04', from: 'Figma', subject: 'Your team plan renews soon', daysAgo: 401 },
  { id: 'v05', from: 'Sarah Chen', subject: 'Offsite logistics', daysAgo: 33 },
  { id: 'v06', from: 'Notion', subject: 'Weekly digest', daysAgo: 512 },
  { id: 'v07', from: 'Stripe', subject: 'Payout scheduled', daysAgo: 90 },
  { id: 'v08', from: 'Alex Johnson', subject: 'Hike photos', daysAgo: 178 },
  { id: 'v09', from: 'Careers', subject: 'Application received', daysAgo: 803 },
  { id: 'v10', from: 'Marcus Webb', subject: 'Contract draft v2', daysAgo: 66 },
  { id: 'v11', from: 'LinkedIn', subject: 'New connection requests', daysAgo: 145 },
  { id: 'v12', from: 'Support', subject: 'Ticket #4482 closed', daysAgo: 621 },
  { id: 'v13', from: 'Adobe', subject: 'Invoice for July', daysAgo: 21 },
  { id: 'v14', from: 'Anna Kovacs', subject: 'Recipe you asked for', daysAgo: 355 },
  { id: 'v15', from: 'Bank', subject: 'Statement available', daysAgo: 74 },
  { id: 'v16', from: 'Old Team', subject: 'Farewell lunch', daysAgo: 940 },
  { id: 'v17', from: 'Newsletter', subject: 'Issue 212', daysAgo: 112 },
  { id: 'v18', from: 'Calendar', subject: 'Invitation: retro', daysAgo: 47 },
];

/** v16 "Farewell lunch" at 940 days is the genuine oldest. */
const OLDEST_ID = 'v16';

function relative(daysAgo: number): string {
  if (daysAgo < 30) return `${daysAgo}d ago`;
  if (daysAgo < 365) return `${Math.round(daysAgo / 30)}mo ago`;
  const years = (daysAgo / 365).toFixed(1);
  return `${years}y ago`;
}

/**
 * X24 · M_UNSORTED_ARCHIVE_NO_CONTROLS — F-CNT-03 Missing Filter or Sort
 * Controls. Second observation of the type; hosted on Archive
 * (M_GESTURE_ONLY_ARCHIVE).
 *
 * Mechanism — the list IS ordered, just not by the axis the task needs, and no
 * control exists to reorder it. M_MISSING_SORT_CONTROLS (F6.3, /photos/album)
 * presents a visibly scrambled grid: the disorder is apparent, so an agent knows
 * it must inspect every cell. Here the archive is cleanly sorted by date
 * ARCHIVED while the task asks for oldest RECEIVED, and nothing says which
 * ordering is in force.
 *
 * That produces a specific and likely failure: the list looks authoritative, so
 * the plausible shortcut — take the last row — returns a confident wrong answer.
 * Getting it right requires reading all 18 relative timestamps and comparing
 * across mixed units ("12d", "8mo", "2.6y"), with no sort affordance to delegate
 * that to.
 *
 *   Baseline: a "Sort: Oldest received" control is present and applied, so the
 *             target is simply the first row.
 *   Faulty:   no sort control of any kind; order is by archived-date.
 *
 *   Fails:    vision-only AND text-only.
 *
 * Isolation: its own "All archived" section below the host's swipe list. The
 * host's defect is that archiving is gesture-only on ITS rows; these rows are
 * read-only, and this task archives nothing.
 */
export default function UnsortedArchiveNoControlsFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [answered, setAnswered] = useState<Archived | null>(null);

  // Baseline applies the sort the task cares about; faulty leaves archive order.
  const rows = faultActive ? ARCHIVE : [...ARCHIVE].sort((a, b) => b.daysAgo - a.daysAgo);

  return (
    <View style={styles.wrap} testID={faultActive ? 'defect:M_UNSORTED_ARCHIVE_NO_CONTROLS' : undefined}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>All archived</Text>
        {/* Baseline only: the affordance that makes the question answerable. */}
        {!faultActive && (
          <View style={styles.sortPill}>
            <Text style={styles.sortText}>Sort: Oldest received</Text>
          </View>
        )}
      </View>

      {rows.map((m) => (
        <Pressable
          key={m.id}
          style={styles.row}
          onPress={() => setAnswered(m)}
          accessibilityRole="button"
          accessibilityLabel={`${m.subject}, from ${m.from}, received ${relative(m.daysAgo)}`}
        >
          <View style={styles.rowInfo}>
            <Text style={styles.rowFrom}>{m.from}</Text>
            <Text style={styles.rowSubject} numberOfLines={1}>
              {m.subject}
            </Text>
          </View>
          <Text style={styles.rowWhen}>{relative(m.daysAgo)}</Text>
        </Pressable>
      ))}

      {answered && (
        <Text
          style={[styles.answer, answered.id !== OLDEST_ID && styles.answerWrong]}
          accessibilityLiveRegion="polite"
        >
          Selected: {answered.subject} ({relative(answered.daysAgo)})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heading: { fontSize: 15, fontWeight: '800', color: '#111' },
  sortPill: { backgroundColor: '#e8f0fe', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  sortText: { fontSize: 11, color: '#1565c0', fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  rowInfo: { flex: 1, gap: 2 },
  rowFrom: { fontSize: 13, color: '#111', fontWeight: '700' },
  rowSubject: { fontSize: 12, color: '#888' },
  rowWhen: { fontSize: 11, color: '#aaa', fontWeight: '600' },
  answer: { fontSize: 13, color: '#2e7d32', fontWeight: '700', marginTop: 10 },
  answerWrong: { color: '#555' },
});
