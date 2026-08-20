import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Version {
  v: number;
  savedBy: string;
  savedAt: string;
  note: string;
}

// Seven revisions of ONE report. Everything except the version number is shared,
// and the numbers are non-monotonic in the list order so position cannot be used
// as a shortcut.
const VERSIONS: Version[] = [
  { v: 3, savedBy: 'A. Okafor', savedAt: 'Jul 02, 14:12', note: 'Q2 Summary' },
  { v: 7, savedBy: 'A. Okafor', savedAt: 'Jul 09, 09:41', note: 'Q2 Summary' },
  { v: 1, savedBy: 'A. Okafor', savedAt: 'Jun 28, 16:55', note: 'Q2 Summary' },
  { v: 5, savedBy: 'A. Okafor', savedAt: 'Jul 05, 11:03', note: 'Q2 Summary' },
  { v: 2, savedBy: 'A. Okafor', savedAt: 'Jul 01, 08:20', note: 'Q2 Summary' },
  { v: 6, savedBy: 'A. Okafor', savedAt: 'Jul 07, 17:36', note: 'Q2 Summary' },
  { v: 4, savedBy: 'A. Okafor', savedAt: 'Jul 03, 13:09', note: 'Q2 Summary' },
];

const TARGET_V = 5;

/**
 * X22 · M_VERSION_TOKEN_REPORT_ROWS — F-CNT-02 Cluttered List with Similar Items.
 * Second observation of the type; hosted on Reports (M_BANNER_OCCLUDES_CTA).
 *
 * Mechanism — rows separated by a SINGLE SHORT TOKEN buried inside otherwise
 * identical text. M_CLUTTERED_SIMILAR_LIST (F6.2, /careers/similar) uses rows that
 * are similar in the ordinary way: same shape, overlapping titles and companies,
 * but still several independent fields to discriminate on (role, employer,
 * location). Here every field is byte-identical across all seven rows — same
 * report name, same author, same size, same format — and the ONLY discriminator
 * is a one-character version number.
 *
 * Two properties make it bite:
 *   · There is no redundancy. A single mis-read character selects the wrong row,
 *     and every wrong row looks exactly like a correct outcome.
 *   · The versions are listed out of numeric order, so positional heuristics
 *     ("the fifth one") silently produce v2.
 *
 *   Baseline: each row carries a distinguishing summary line (what changed in
 *             that revision) and is sorted by version, so the target is unique
 *             on several independent cues.
 *   Faulty:   all rows collapse to the same text plus "v{n}", order scrambled.
 *
 *   Fails:    vision-only AND text-only (both see the same undifferentiated set).
 *
 * Isolation: sits high on the screen, directly under the page subtitle. The
 * host's defect is a sticky banner occluding the "Export report" CTA at the
 * BOTTOM of the screen; this task opens a version and never scrolls to export.
 */
export default function VersionTokenReportRowsFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [opened, setOpened] = useState<Version | null>(null);

  // Baseline: sorted and individually summarised. Faulty: as authored above.
  const rows = faultActive ? VERSIONS : [...VERSIONS].sort((a, b) => a.v - b.v);

  const summaryFor = (v: number) =>
    ({
      1: 'Initial draft',
      2: 'Added regional split',
      3: 'Fixed EMEA totals',
      4: 'Added YoY comparison',
      5: 'Final figures signed off',
      6: 'Chart formatting',
      7: 'Board-ready export',
    })[v] ?? '';

  return (
    <View style={styles.wrap} testID={faultActive ? 'defect:M_VERSION_TOKEN_REPORT_ROWS' : undefined}>
      <Text style={styles.sectionTitle}>Q2 Summary — version history</Text>

      {rows.map((row) => (
        <Pressable
          key={row.v}
          style={styles.row}
          onPress={() => setOpened(row)}
          accessibilityRole="button"
          accessibilityLabel={
            faultActive
              ? `${row.note} v${row.v}`
              : `${row.note} version ${row.v} — ${summaryFor(row.v)}, saved ${row.savedAt}`
          }
        >
          <Text style={styles.rowIcon}>📄</Text>
          <View style={styles.rowInfo}>
            <Text style={styles.rowName}>
              {row.note} (v{row.v})
            </Text>
            <Text style={styles.rowMeta}>
              {faultActive ? `${row.savedBy} · PDF · 2.4 MB` : `${summaryFor(row.v)} · ${row.savedAt}`}
            </Text>
          </View>
        </Pressable>
      ))}

      {opened && (
        <Text
          style={[styles.opened, opened.v !== TARGET_V && styles.openedWrong]}
          accessibilityLiveRegion="polite"
        >
          Opened Q2 Summary v{opened.v} ({opened.savedAt})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 18, marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#111', marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  rowIcon: { fontSize: 18 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '600', color: '#111' },
  rowMeta: { fontSize: 12, color: '#999', marginTop: 2 },
  opened: { fontSize: 13, color: '#2e7d32', fontWeight: '700', marginTop: 6 },
  openedWrong: { color: '#555' },
});
