import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: string;
  emoji: string;
}

const FEATURED: Product[] = [
  { id: 'f1', name: 'Aurora Desk Lamp', price: '$34.00', emoji: '💡' },
  { id: 'f2', name: 'Noise-Cancelling Earbuds', price: '$89.00', emoji: '🎧' },
];

const RECOMMENDED: Product[] = [
  { id: 'r1', name: 'Wireless Charging Pad', price: '$24.00', emoji: '🔌' },
  { id: 'r2', name: 'Travel Mug', price: '$18.00', emoji: '☕' },
  { id: 'r3', name: 'Laptop Sleeve', price: '$29.00', emoji: '💻' },
  { id: 'r4', name: 'Desk Organizer', price: '$21.00', emoji: '🗂️' },
];

// The pixel offset the "Recommended" section sits at, well below the fold —
// a real scroll is required to reach it either way.
const RECOMMENDED_OFFSET = 920;

export default function LazySectionOutsideViewportScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [scrollY, setScrollY] = useState(0);
  const [opened, setOpened] = useState<Product | null>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(e.nativeEvent.contentOffset.y);
  };

  // Baseline: every card is mounted from first render, regardless of scroll
  // position — a snapshot taken immediately still contains the target.
  // Faulty: the section is gated behind an `onViewableItemsChanged`-style
  // check and renders only an empty placeholder until the scroll position
  // passes its offset — at snapshot time the target is live on the real
  // screen but literally not yet in the tree/pixels.
  const recommendedMounted = !faultActive || scrollY > RECOMMENDED_OFFSET - 200;

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_LAZY_SECTION_OUTSIDE_VIEWPORT' : undefined}
    >
      <Stack.Screen options={{ title: 'Recommended' }} />

      {opened && (
        <View style={styles.banner} accessibilityLiveRegion="polite">
          <Text style={styles.bannerText}>Opened: {opened.name}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Text style={styles.sectionTitle}>Featured</Text>
        <View style={styles.grid}>
          {FEATURED.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => setOpened(p)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${p.name}`}
              style={styles.card}
            >
              <Text style={styles.cardEmoji}>{p.emoji}</Text>
              <Text style={styles.cardName}>{p.name}</Text>
              <Text style={styles.cardPrice}>{p.price}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.spacer} />

        <Text style={styles.sectionTitle}>Recommended for you</Text>
        {recommendedMounted ? (
          <View style={styles.grid}>
            {RECOMMENDED.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setOpened(p)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${p.name}`}
                style={styles.card}
              >
                <Text style={styles.cardEmoji}>{p.emoji}</Text>
                <Text style={styles.cardName}>{p.name}</Text>
                <Text style={styles.cardPrice}>{p.price}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Scroll down to load recommendations…</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  banner: { backgroundColor: '#e8f5e9', padding: 14 },
  bannerText: { color: '#2e7d32', fontSize: 14, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    backgroundColor: '#f6f7f9',
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  cardEmoji: { fontSize: 30, marginBottom: 4 },
  cardName: { fontSize: 14, fontWeight: '600', color: '#111' },
  cardPrice: { fontSize: 13, color: '#2e7d32', fontWeight: '700' },
  spacer: { height: 720 },
  placeholder: {
    height: 160,
    borderRadius: 14,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 13, color: '#999' },
});
