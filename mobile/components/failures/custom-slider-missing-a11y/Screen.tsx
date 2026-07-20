import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

const MIN_PRICE = 0;
const MAX_PRICE = 500;
const THUMB_SIZE = 28;
const STEP = 10;

export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  emoji: string;
}

// The product whose detail page is the "Add to Cart" CTA screen.
export const HERO_PRODUCT_ID = '12';

export const PRODUCTS: Product[] = [
  { id: '1',  name: 'Wireless Headphones',      price: 89,  rating: 4.5, emoji: '🎧' },
  { id: '2',  name: 'Laptop Stand',             price: 45,  rating: 4.7, emoji: '💻' },
  { id: '3',  name: 'Mechanical Keyboard',      price: 220, rating: 4.8, emoji: '⌨️' },
  { id: '4',  name: 'USB-C Hub 7-in-1',         price: 65,  rating: 4.3, emoji: '🔌' },
  { id: '5',  name: 'Monitor Light Bar',        price: 78,  rating: 4.6, emoji: '💡' },
  { id: '6',  name: 'HD Webcam',                price: 120, rating: 4.1, emoji: '📷' },
  { id: '7',  name: 'Cable Management Kit',     price: 28,  rating: 4.4, emoji: '🗂️' },
  { id: '8',  name: 'Noise-cancelling Earbuds', price: 180, rating: 4.7, emoji: '🎵' },
  { id: '9',  name: 'Ergonomic Mouse',          price: 95,  rating: 4.5, emoji: '🖱️' },
  { id: '10', name: 'Desk Mat XL',              price: 38,  rating: 4.6, emoji: '🟦' },
  { id: '11', name: 'Smart Power Strip',        price: 55,  rating: 4.2, emoji: '⚡' },
  { id: '12', name: 'Nike Air Max Pulse',       price: 149, rating: 4.2, emoji: '👟' },
];

// ─── PriceSlider ──────────────────────────────────────────────────────────────

interface SliderProps {
  value: number;
  faultActive: boolean;
  onCommit: (v: number) => void;
}

function PriceSlider({ value, faultActive, onCommit }: SliderProps) {
  const [displayPrice, setDisplayPrice] = useState(value);

  // Both shared values live on the UI thread so pan worklets can read them without
  // going through the JS bridge.
  const trackWidthSV = useSharedValue(0);
  const thumbX = useSharedValue(0);
  const startThumbX = useSharedValue(0);

  // Keep displayPrice label in sync with the dragging thumb.
  useAnimatedReaction(
    () => thumbX.value,
    (x) => {
      const max = trackWidthSV.value - THUMB_SIZE;
      if (max <= 0) return;
      const price = Math.round((x / max) * MAX_PRICE);
      runOnJS(setDisplayPrice)(Math.max(MIN_PRICE, Math.min(MAX_PRICE, price)));
    },
  );

  const panGesture = Gesture.Pan()
    .activeOffsetX([-6, 6])
    .failOffsetY([-12, 12])
    .onBegin(() => {
      startThumbX.value = thumbX.value;
    })
    .onUpdate((e) => {
      const max = trackWidthSV.value - THUMB_SIZE;
      thumbX.value = Math.max(0, Math.min(max, startThumbX.value + e.translationX));
    })
    .onEnd(() => {
      const max = trackWidthSV.value - THUMB_SIZE;
      if (max <= 0) return;
      const price = Math.round((thumbX.value / max) * MAX_PRICE);
      runOnJS(onCommit)(Math.max(MIN_PRICE, Math.min(MAX_PRICE, price)));
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value + THUMB_SIZE / 2,
  }));

  const setThumbFromPrice = (price: number) => {
    const max = trackWidthSV.value - THUMB_SIZE;
    if (max > 0) thumbX.value = (price / MAX_PRICE) * max;
    setDisplayPrice(price);
    onCommit(price);
  };

  // Semantic wrapper props differ entirely between baseline and faulty.
  //
  // Baseline — full adjustable semantics:
  //   accessibilityRole="adjustable", accessibilityValue with min/max/now/text,
  //   accessibilityActions for keyboard/switch-access increment and decrement.
  //
  // Faulty — plain View in the a11y tree:
  //   accessible={true} so the node IS present, but no role, no value, no label.
  //   A multimodal agent reading the tree finds an element it cannot interpret.
  const semanticProps = faultActive
    ? { accessible: true as const }
    : {
        accessible: true as const,
        accessibilityRole: 'adjustable' as const,
        accessibilityLabel: 'Maximum price filter',
        accessibilityValue: {
          min: MIN_PRICE,
          max: MAX_PRICE,
          now: displayPrice,
          text: `$${displayPrice}`,
        },
        accessibilityActions: [
          { name: 'increment', label: `Increase by $${STEP}` },
          { name: 'decrement', label: `Decrease by $${STEP}` },
        ],
        onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
          const { actionName } = event.nativeEvent;
          if (actionName === 'increment') {
            setThumbFromPrice(Math.min(MAX_PRICE, displayPrice + STEP));
          } else if (actionName === 'decrement') {
            setThumbFromPrice(Math.max(MIN_PRICE, displayPrice - STEP));
          }
        },
      };

  return (
    <View style={styles.sliderWrapper}>
      {/* The semantic wrapper is what differs.
          The visual content inside is identical in both modes. */}
      <View
        {...semanticProps}
        style={styles.sliderHitArea}
      >
        <View
          style={styles.track}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            trackWidthSV.value = w;
            thumbX.value = (value / MAX_PRICE) * (w - THUMB_SIZE);
          }}
        >
          <View style={styles.trackBackground} />
          <Animated.View style={[styles.trackFill, fillStyle]} />

          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.thumb, thumbStyle]}>
              <View style={styles.thumbInner} />
            </Animated.View>
          </GestureDetector>
        </View>
      </View>

      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabelMin}>${MIN_PRICE}</Text>
        <Text style={styles.sliderLabelValue}>${displayPrice}</Text>
        <Text style={styles.sliderLabelMax}>${MAX_PRICE}</Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

interface Props {
  faultActive?: boolean;
}

export default function CustomSliderMissingA11yScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const router = useRouter();
  const [maxPrice, setMaxPrice] = useState(350);

  const filtered = PRODUCTS.filter((p) => p.price <= maxPrice).sort(
    (a, b) => a.price - b.price,
  );

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_CUSTOM_SLIDER_MISSING_A11Y_SEMANTICS' : undefined}
    >
      <Stack.Screen options={{ title: 'Shop' }} />

      {/* Filter card — sits above the list, not inside a ScrollView */}
      <View style={styles.filterCard}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filter by Price</Text>
          <Text style={styles.filterCount}>
            {filtered.length} of {PRODUCTS.length} results
          </Text>
        </View>

        <PriceSlider
          value={maxPrice}
          faultActive={faultActive}
          onCommit={setMaxPrice}
        />

        {faultActive && (
          // Only in faulty mode: the a11y tree shows no hint that this is a slider.
          // There is no label, no role, no value — the region is meaningless to agents.
          // (This comment block is intentional for researchers reading the source.)
          null
        )}
      </View>

      {/* Product list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No products under ${maxPrice}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.productCard}
            onPress={() => router.push(`/shop/product/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, $${item.price}, rated ${item.rating} out of 5`}
          >
            <Text style={styles.productEmoji}>{item.emoji}</Text>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.productBottom}>
              <Text style={styles.productPrice}>${item.price}</Text>
              <Text style={styles.productRating}>★ {item.rating}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  filterCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
    gap: 12,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  filterCount: { fontSize: 13, color: '#888' },

  sliderWrapper: { gap: 8 },
  sliderHitArea: { paddingVertical: 10 },

  track: {
    height: THUMB_SIZE,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    position: 'absolute',
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    backgroundColor: '#1565c0',
    borderRadius: 2,
    top: (THUMB_SIZE - 4) / 2,
  },
  thumb: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1565c0',
  },

  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  sliderLabelMin: { fontSize: 12, color: '#aaa' },
  sliderLabelMax: { fontSize: 12, color: '#aaa' },
  sliderLabelValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1565c0',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },

  grid: { padding: 12, gap: 12 },
  row: { gap: 12 },

  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  productEmoji: { fontSize: 36 },
  productName: { fontSize: 13, fontWeight: '600', color: '#111', lineHeight: 18 },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#111' },
  productRating: { fontSize: 12, color: '#f59e0b' },

  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#888' },
});
