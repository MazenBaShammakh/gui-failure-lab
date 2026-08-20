import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Segment {
  id: string;
  label: string;
  pct: number;
  color: string;
  sessions: string;
  bounce: string;
}

const SEGMENTS: Segment[] = [
  { id: 'mobile', label: 'Mobile', pct: 38, color: '#1e88e5', sessions: '18,402', bounce: '41%' },
  { id: 'desktop', label: 'Desktop', pct: 31, color: '#43a047', sessions: '15,013', bounce: '28%' },
  { id: 'tablet', label: 'Tablet', pct: 19, color: '#fb8c00', sessions: '9,201', bounce: '35%' },
  { id: 'other', label: 'Other', pct: 12, color: '#8e24aa', sessions: '5,812', bounce: '52%' },
];

/**
 * X14 · M_OPAQUE_CHART_SEGMENTS — F-PRC-05 Inaccessible Element from DOM/A11y Tree
 * (Unspecified Mechanism). Second observation of the type; hosted on Overview
 * (M_DISABLED_LOOKS_ENABLED).
 *
 * Mechanism — interactive regions drawn INSIDE a graphic. The existing observation
 * (M_CUSTOM_SLIDER_MISSING_A11Y_SEMANTICS, /shop) is a hand-rolled pan responder:
 * a real view hierarchy exists, it simply carries no role, name or value. Here the
 * controls are chart segments: the whole card is published as a single graphic
 * node ("Traffic sources chart") and every segment — plus the legend that names
 * them — is withdrawn beneath it. Nothing in the tree indicates the chart is
 * interactive at all, or that "Mobile" is a thing that can be selected.
 *
 * This is the data-visualisation form of the type, and the reason the taxonomy
 * calls the mechanism unspecified: there is no missing attribute to point at. The
 * node is correctly labelled for what the author thought it was — a picture.
 *
 *   Baseline: each segment is its own button ("Mobile, 38 percent"), legend
 *             included; the chart is an ordinary group.
 *   Faulty:   one image node; segments and legend hidden, but still tappable.
 *
 *   Fails:    text-only (no per-segment node exists to target).
 *   Succeeds: vision-only (the segments are drawn, sized and tappable).
 *
 * IMPLEMENTATION NOTE: rendered as a stacked proportional bar rather than the
 * donut the plan sketched. The defect is about accessibility opacity, not chart
 * shape, and a flex-weighted bar has deterministic geometry — a donut needs
 * rotated/clipped wedges whose layout cannot be confirmed without running the app.
 * The mechanism (tappable sub-regions inside one opaque graphic) is identical.
 *
 * Isolation: sits between the host's stats grid and its Refresh button. The host's
 * defect is that Refresh is silently disabled; this task never presses it.
 */
export default function OpaqueChartSegmentsFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [openId, setOpenId] = useState<string | null>(null);
  const open = SEGMENTS.find((s) => s.id === openId) ?? null;

  return (
    <View style={styles.card} testID={faultActive ? 'defect:M_OPAQUE_CHART_SEGMENTS' : undefined}>
      <Text style={styles.cardTitle}>Traffic sources</Text>

      {/* Faulty: the entire visualisation collapses to one graphic node. */}
      <View
        accessible={faultActive}
        accessibilityRole={faultActive ? 'image' : undefined}
        accessibilityLabel={faultActive ? 'Traffic sources chart' : undefined}
        accessibilityElementsHidden={faultActive}
        importantForAccessibility={faultActive ? 'no-hide-descendants' : 'auto'}
      >
        <View style={styles.bar}>
          {SEGMENTS.map((s) => (
            <Pressable
              key={s.id}
              style={[styles.slice, { flex: s.pct, backgroundColor: s.color }]}
              onPress={() => setOpenId(s.id)}
              accessibilityRole="button"
              accessibilityLabel={`${s.label}, ${s.pct} percent`}
            />
          ))}
        </View>

        <View style={styles.legend}>
          {SEGMENTS.map((s) => (
            <View key={s.id} style={styles.legendItem}>
              <View style={[styles.swatch, { backgroundColor: s.color }]} />
              <Text style={styles.legendText}>
                {s.label} {s.pct}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {open && (
        <View style={styles.breakdown} accessibilityLiveRegion="polite">
          <Text style={styles.breakdownHeading}>{open.label} breakdown</Text>
          <Text style={styles.breakdownLine}>Sessions: {open.sessions}</Text>
          <Text style={styles.breakdownLine}>Bounce rate: {open.bounce}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 4,
    gap: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#111' },
  bar: { flexDirection: 'row', height: 26, borderRadius: 6, overflow: 'hidden' },
  slice: { height: '100%' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 12, color: '#555', fontWeight: '600' },
  breakdown: {
    backgroundColor: '#f4f7fb',
    borderRadius: 10,
    padding: 12,
    gap: 3,
  },
  breakdownHeading: { fontSize: 13, fontWeight: '800', color: '#111' },
  breakdownLine: { fontSize: 12, color: '#555' },
});
