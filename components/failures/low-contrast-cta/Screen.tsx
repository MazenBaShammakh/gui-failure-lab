import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

export default function LowContrastCtaScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [purchased, setPurchased] = useState(false);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_LOW_CONTRAST_CTA' : undefined}
    >
      <Stack.Screen options={{ title: 'Flash Deal' }} />

      <View style={styles.dealBanner}>
        <Text style={styles.dealBadge}>⚡ FLASH DEAL</Text>
        <Text style={styles.dealTimer}>Ends in 02:14:08</Text>
      </View>

      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageEmoji}>💡</Text>
      </View>

      <Text style={styles.brand}>Aurora</Text>
      <Text style={styles.productName}>Aurora Desk Lamp</Text>

      <View style={styles.ratingRow}>
        <Text style={styles.stars}>★★★★★</Text>
        <Text style={styles.reviews}>(1,902 reviews)</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>$34.99</Text>
        <Text style={styles.priceWas}>$69.99</Text>
        <Text style={styles.priceOff}>50% off</Text>
      </View>

      <Text style={styles.description}>
        Adjustable LED desk lamp with 5 brightness levels, warm-to-cool color
        temperature, and a USB-C charging port in the base. Touch-dimmable.
      </Text>

      {purchased && (
        <Text style={styles.confirmation} accessibilityLiveRegion="polite">
          ✓ Purchase confirmed — your Aurora Desk Lamp is on its way!
        </Text>
      )}

      {/* The control is identically wired in both modes; only the colors differ.
          Baseline: white text on near-black fill (high contrast).
          Faulty:   #cfcfcf text on #dcdcdc fill (~1.5:1) — present and pressable
                    in the tree, but a vision-only agent cannot segment/read it. */}
      <Pressable
        style={({ pressed }) => [
          styles.buyButton,
          faultActive ? styles.buyButtonFaulty : styles.buyButtonBaseline,
          pressed && styles.buyButtonPressed,
        ]}
        onPress={() => setPurchased(true)}
        accessibilityRole="button"
        accessibilityLabel="Buy now"
      >
        <Text style={faultActive ? styles.buyTextFaulty : styles.buyTextBaseline}>
          Buy now
        </Text>
      </Pressable>

      <Text style={styles.fineprint}>Free returns within 30 days.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 48, gap: 12 },
  dealBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dealBadge: { fontSize: 13, fontWeight: '800', color: '#e65100', letterSpacing: 0.5 },
  dealTimer: { fontSize: 13, fontWeight: '600', color: '#bf360c' },
  imagePlaceholder: {
    height: 220,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  imageEmoji: { fontSize: 80 },
  brand: { fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
  productName: { fontSize: 24, fontWeight: '700', color: '#111' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stars: { fontSize: 14, color: '#f59e0b' },
  reviews: { fontSize: 13, color: '#666' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  price: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  priceWas: { fontSize: 16, color: '#999', textDecorationLine: 'line-through' },
  priceOff: { fontSize: 14, fontWeight: '700', color: '#2e7d32' },
  description: { fontSize: 14, lineHeight: 22, color: '#555' },
  confirmation: { fontSize: 14, color: '#2e7d32', fontWeight: '600' },
  buyButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buyButtonBaseline: { backgroundColor: '#111' },
  buyButtonFaulty: { backgroundColor: '#dcdcdc' },
  buyButtonPressed: { opacity: 0.85 },
  buyTextBaseline: { color: '#fff', fontSize: 16, fontWeight: '700' },
  buyTextFaulty: { color: '#cfcfcf', fontSize: 16, fontWeight: '700' },
  fineprint: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 4 },
});
