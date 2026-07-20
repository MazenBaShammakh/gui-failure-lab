import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

export default function DuplicateCtaOneDeadScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [cartCount, setCartCount] = useState(0);

  const addToCart = () => setCartCount((c) => c + 1);

  const confirmation =
    cartCount > 0 ? (
      <Text style={styles.cartConfirmation} accessibilityLiveRegion="polite">
        ✓ {cartCount} item{cartCount > 1 ? 's' : ''} added to cart
      </Text>
    ) : null;

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DUPLICATE_CTA_ONE_DEAD' : undefined}
    >
      <Stack.Screen options={{ title: 'Featured — Ergonomic Mouse' }} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>★ Featured Deal</Text>
        </View>

        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageEmoji}>🖱️</Text>
        </View>

        <Text style={styles.brand}>LogiPro</Text>
        <Text style={styles.productName}>Ergonomic Mouse</Text>

        <View style={styles.ratingRow}>
          <Text style={styles.stars}>★★★★★</Text>
          <Text style={styles.reviews}>(1,204 reviews)</Text>
        </View>

        <Text style={styles.price}>$95.00</Text>

        <Text style={styles.description}>
          Sculpted vertical design that keeps your wrist in a natural position.
          Silent clicks, 4000 DPI sensor, and up to 70 days of battery on a single
          charge. Works across three devices with Easy-Switch.
        </Text>

        {confirmation}

        {/*
          Inline CTA.
          Baseline: this is the ONLY CTA and it works.
          Faulty:   it is a dead, non-functional View (no onPress) that looks
                    identical to a real button. The working CTA is the sticky one.
        */}
        {faultActive ? (
          <View
            style={styles.inlineButton}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Add to Cart"
          >
            <Text style={styles.inlineButtonText}>Add to Cart</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.inlineButton, pressed && styles.buttonPressed]}
            onPress={addToCart}
            accessibilityRole="button"
            accessibilityLabel="Add to Cart"
          >
            <Text style={styles.inlineButtonText}>Add to Cart</Text>
          </Pressable>
        )}

        <View style={styles.specs}>
          <Text style={styles.specsTitle}>Specifications</Text>
          <Text style={styles.specLine}>• Connection: Bluetooth + USB receiver</Text>
          <Text style={styles.specLine}>• Battery: Rechargeable, 70 days</Text>
          <Text style={styles.specLine}>• Buttons: 6 programmable</Text>
          <Text style={styles.specLine}>• Warranty: 2 years</Text>
        </View>
      </ScrollView>

      {/*
        Sticky bottom CTA — identical label "Add to Cart".
        Faulty: this is the WORKING one (the inline one above is dead). Both are
        present in the a11y tree with the same name; an agent may bind to the dead one.
        Baseline: not rendered — there is a single inline CTA only.
      */}
      {faultActive && (
        <View style={styles.stickyBar}>
          <View style={styles.stickyPrice}>
            <Text style={styles.stickyPriceLabel}>Total</Text>
            <Text style={styles.stickyPriceValue}>$95.00</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.stickyButton, pressed && styles.buttonPressed]}
            onPress={addToCart}
            accessibilityRole="button"
            accessibilityLabel="Add to Cart"
          >
            <Text style={styles.stickyButtonText}>Add to Cart</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48, gap: 10 },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff4e5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: '#e08600', fontSize: 12, fontWeight: '700' },

  imagePlaceholder: {
    height: 220,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  imageEmoji: { fontSize: 80 },
  brand: { fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
  productName: { fontSize: 24, fontWeight: '700', color: '#111' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stars: { fontSize: 14, color: '#f59e0b' },
  reviews: { fontSize: 13, color: '#666' },
  price: { fontSize: 26, fontWeight: '700', color: '#1a1a1a' },
  description: { fontSize: 14, lineHeight: 22, color: '#555' },
  cartConfirmation: { fontSize: 14, color: '#2e7d32', fontWeight: '600' },

  inlineButton: {
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  inlineButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  buttonPressed: { opacity: 0.8 },

  specs: { marginTop: 16, gap: 6 },
  specsTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  specLine: { fontSize: 14, color: '#555', lineHeight: 20 },

  stickyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  stickyPrice: { gap: 1 },
  stickyPriceLabel: { fontSize: 11, color: '#888' },
  stickyPriceValue: { fontSize: 18, fontWeight: '700', color: '#111' },
  stickyButton: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  stickyButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
