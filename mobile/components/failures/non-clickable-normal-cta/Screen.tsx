import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import LateStockFetch from '@/components/failures/late-stock-fetch';

interface Props {
  faultActive?: boolean;
}

export default function NonClickableNormalCtaScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [cartCount, setCartCount] = useState(0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Air Max Pulse — Nike' }} />

      <View
        testID={faultActive ? 'defect:B_NON_CLICKABLE_NORMAL_CTA' : undefined}
        style={styles.productCard}
      >
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageEmoji}>👟</Text>
        </View>

        <Text style={styles.brand}>Nike</Text>
        <Text style={styles.productName}>Air Max Pulse</Text>

        <View style={styles.ratingRow}>
          <Text style={styles.stars}>★★★★☆</Text>
          <Text style={styles.reviews}>(328 reviews)</Text>
        </View>

        <Text style={styles.price}>$149.99</Text>

        {/* X30 (F-TMP-02): availability resolves via a late secondary fetch. A
            read-out block; the host's defect is the non-clickable Add to Cart
            below, which this task never taps. */}
        <LateStockFetch />

        <Text style={styles.description}>
          Lightweight running shoes with responsive cushioning. Engineered mesh upper for breathability. Sizes 7–13.
        </Text>

        <View style={styles.sizeRow}>
          {['8', '9', '10', '11', '12'].map((size) => (
            <View key={size} style={styles.sizeChip}>
              <Text style={styles.sizeText}>{size}</Text>
            </View>
          ))}
        </View>

        {cartCount > 0 && (
          <Text style={styles.cartConfirmation} accessibilityLiveRegion="polite">
            ✓ {cartCount} item{cartCount > 1 ? 's' : ''} added to cart
          </Text>
        )}

        {faultActive ? (
          <View
            style={styles.button}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add to Cart"
          >
            <Text style={styles.buttonText}>Add to Cart</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => setCartCount((c) => c + 1)}
            accessibilityRole="button"
            accessibilityLabel="Add to Cart"
          >
            <Text style={styles.buttonText}>Add to Cart</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 48 },
  productCard: { gap: 12 },
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
  price: { fontSize: 26, fontWeight: '700', color: '#1a1a1a' },
  description: { fontSize: 14, lineHeight: 22, color: '#555' },
  sizeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  sizeChip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sizeText: { fontSize: 14, color: '#333' },
  cartConfirmation: { fontSize: 14, color: '#2e7d32', fontWeight: '600' },
  button: {
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
