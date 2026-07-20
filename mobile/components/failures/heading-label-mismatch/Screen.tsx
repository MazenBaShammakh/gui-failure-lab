import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const STEPS = [
  { id: 'ordered', label: 'Ordered', done: true },
  { id: 'shipped', label: 'Shipped', done: true },
  { id: 'out', label: 'Out for delivery', done: true },
  { id: 'delivered', label: 'Delivered', done: false },
];

export default function HeadingLabelMismatchScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  // Baseline: the nav title and on-screen heading both read "Track Order",
  // matching the entry-point label and the task wording. Faulty: both are
  // swapped to "Write a Review" — a label borrowed from an unrelated hub
  // entry, so there's no shared wording *or* domain (shipping vs. reviews)
  // left to ground the task or the hub label against, unlike a same-domain
  // paraphrase such as "Shipment Status".
  const heading = faultActive ? 'Write a Review' : 'Track Order';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_HEADING_LABEL_MISMATCH' : undefined}
    >
      <Stack.Screen options={{ title: heading }} />

      <Text style={styles.heading}>{heading}</Text>

      <View style={styles.card}>
        <Text style={styles.orderName}>Wireless Charging Pad</Text>
        <Text style={styles.orderMeta}>Order #A19284 · Arriving Jul 15</Text>
      </View>

      <View style={styles.stepsList}>
        {STEPS.map((s, i) => (
          <View key={s.id} style={styles.stepRow}>
            <View style={[styles.stepDot, s.done && styles.stepDotDone]} />
            <Text style={[styles.stepLabel, s.done && styles.stepLabelDone]}>{s.label}</Text>
            {i === 2 && s.done && <Text style={styles.stepBadge}>Current</Text>}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 16 },
  card: {
    backgroundColor: '#f6f6f8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  orderName: { fontSize: 16, fontWeight: '700', color: '#111' },
  orderMeta: { fontSize: 13, color: '#888', marginTop: 4 },
  stepsList: { gap: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ddd' },
  stepDotDone: { backgroundColor: '#2e7d32' },
  stepLabel: { fontSize: 15, color: '#999' },
  stepLabelDone: { color: '#111', fontWeight: '600' },
  stepBadge: {
    marginLeft: 'auto',
    fontSize: 11,
    fontWeight: '700',
    color: '#2e7d32',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
});
