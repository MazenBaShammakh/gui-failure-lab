import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const PHOTOS = [
  { emoji: '👟', caption: 'Front view' },
  { emoji: '👟', caption: 'Side profile' },
  { emoji: '👟', caption: 'Sole detail' },
  { emoji: '👟', caption: 'Top view' },
];

export default function DeadCarouselArrowsScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [index, setIndex] = useState(0);

  // Faulty: the ‹ / › arrows render and look interactive, but onPress is a no-op,
  // so the visible image index never changes. Baseline: arrows change the photo.
  const goPrev = () => {
    if (faultActive) return;
    setIndex((i) => Math.max(0, i - 1));
  };
  const goNext = () => {
    if (faultActive) return;
    setIndex((i) => Math.min(PHOTOS.length - 1, i + 1));
  };

  const photo = PHOTOS[index];

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DEAD_CAROUSEL_ARROWS' : undefined}
    >
      <Stack.Screen options={{ title: 'Trail Runner — Photos' }} />

      <View style={styles.gallery}>
        <View style={styles.imageStage}>
          <Text style={styles.imageEmoji}>{photo.emoji}</Text>
          <Text style={styles.caption}>{photo.caption}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.arrow,
            styles.arrowLeft,
            pressed && !faultActive && styles.arrowPressed,
          ]}
          onPress={goPrev}
          accessibilityRole="button"
          accessibilityLabel="Previous photo"
          hitSlop={8}
        >
          <Text style={styles.arrowText}>‹</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.arrow,
            styles.arrowRight,
            pressed && !faultActive && styles.arrowPressed,
          ]}
          onPress={goNext}
          accessibilityRole="button"
          accessibilityLabel="Next photo"
          hitSlop={8}
        >
          <Text style={styles.arrowText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.dots}>
        {PHOTOS.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <Text style={styles.counter}>
        Photo {index + 1} of {PHOTOS.length}
      </Text>

      <View style={styles.info}>
        <Text style={styles.brand}>Summit Co.</Text>
        <Text style={styles.productName}>Trail Runner GTX</Text>
        <Text style={styles.price}>$129.99</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 12 },
  gallery: {
    position: 'relative',
    height: 280,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  imageStage: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  imageEmoji: { fontSize: 96 },
  caption: { fontSize: 14, color: '#777', fontWeight: '600' },
  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  arrowLeft: { left: 12 },
  arrowRight: { right: 12 },
  arrowPressed: { backgroundColor: '#e8e8e8' },
  arrowText: { fontSize: 28, color: '#111', fontWeight: '700', lineHeight: 30 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd' },
  dotActive: { backgroundColor: '#111', width: 20 },
  counter: { textAlign: 'center', fontSize: 13, color: '#888' },
  info: { gap: 4, marginTop: 8 },
  brand: { fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
  productName: { fontSize: 22, fontWeight: '700', color: '#111' },
  price: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
});
