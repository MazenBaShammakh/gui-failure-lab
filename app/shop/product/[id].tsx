import { useLocalSearchParams, Stack } from 'expo-router';
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import NonClickableNormalCta from '@/components/failures/non-clickable-normal-cta';
import {
  PRODUCTS,
  HERO_PRODUCT_ID,
} from '@/components/failures/custom-slider-missing-a11y/Screen';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // The hero product opens the dedicated "Add to Cart" CTA screen.
  if (id === HERO_PRODUCT_ID) return <NonClickableNormalCta />;

  const product = PRODUCTS.find((p) => p.id === id);
  return <GenericProductDetail name={product?.name} price={product?.price} emoji={product?.emoji} rating={product?.rating} />;
}

function GenericProductDetail({
  name,
  price,
  emoji,
  rating,
}: {
  name?: string;
  price?: number;
  emoji?: string;
  rating?: number;
}) {
  const [cartCount, setCartCount] = useState(0);

  if (!name) {
    return (
      <View style={styles.notFound}>
        <Stack.Screen options={{ title: 'Product' }} />
        <Text style={styles.notFoundText}>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: name }} />

      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageEmoji}>{emoji}</Text>
      </View>

      <Text style={styles.productName}>{name}</Text>
      <View style={styles.ratingRow}>
        <Text style={styles.stars}>★</Text>
        <Text style={styles.reviews}>{rating?.toFixed(1)}</Text>
      </View>
      <Text style={styles.price}>${price}</Text>
      <Text style={styles.description}>
        A reliable everyday pick from our catalog. Free returns within 30 days.
      </Text>

      {cartCount > 0 && (
        <Text style={styles.cartConfirmation} accessibilityLiveRegion="polite">
          ✓ {cartCount} item{cartCount > 1 ? 's' : ''} added to cart
        </Text>
      )}

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => setCartCount((c) => c + 1)}
        accessibilityRole="button"
        accessibilityLabel="Add to Cart"
      >
        <Text style={styles.buttonText}>Add to Cart</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 48, gap: 12 },
  imagePlaceholder: {
    height: 220,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  imageEmoji: { fontSize: 80 },
  productName: { fontSize: 24, fontWeight: '700', color: '#111' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stars: { fontSize: 14, color: '#f59e0b' },
  reviews: { fontSize: 13, color: '#666' },
  price: { fontSize: 26, fontWeight: '700', color: '#1a1a1a' },
  description: { fontSize: 14, lineHeight: 22, color: '#555' },
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
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  notFoundText: { fontSize: 15, color: '#888' },
});
