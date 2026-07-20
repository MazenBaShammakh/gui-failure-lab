import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const SLIDES = [
  { emoji: '🛍️', title: 'Welcome to ShopFast', body: 'Thousands of products, delivered to your door.' },
  { emoji: '🚚', title: 'Free 2-Day Shipping', body: 'On every order over $25, no membership needed.' },
  { emoji: '💳', title: 'Secure Checkout', body: 'Pay safely with your card or wallet in one tap.' },
  { emoji: '🎁', title: 'Start Saving Today', body: 'Get 15% off your first order with code HELLO15.' },
];

export default function DeadPaginationDotsScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [index, setIndex] = useState(0);

  // Faulty: the pagination dots are decorative Views (not Pressable), so you
  // cannot jump to the last slide by tapping its dot. Baseline: each dot is a
  // button that jumps to that slide.
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DEAD_PAGINATION_DOTS' : undefined}
    >
      <Stack.Screen options={{ title: 'Getting Started' }} />

      <View style={styles.slide}>
        <Text style={styles.slideEmoji}>{slide.emoji}</Text>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideBody}>{slide.body}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) =>
          faultActive ? (
            // Faulty: plain decorative dot — no touch handler.
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ) : (
            // Baseline: tappable dot jumps directly to that slide.
            <Pressable
              key={i}
              onPress={() => setIndex(i)}
              accessibilityRole="button"
              accessibilityLabel={`Go to slide ${i + 1} of ${SLIDES.length}`}
              hitSlop={10}
            >
              <View style={[styles.dot, i === index && styles.dotActive]} />
            </Pressable>
          ),
        )}
      </View>

      <Pressable
        style={({ pressed }) => [styles.nextBtn, pressed && styles.nextBtnPressed]}
        onPress={() => setIndex((i) => Math.min(SLIDES.length - 1, i + 1))}
        disabled={isLast}
        accessibilityRole="button"
        accessibilityLabel={isLast ? 'Get started' : 'Next slide'}
      >
        <Text style={styles.nextText}>{isLast ? 'Get Started' : 'Next'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
    gap: 32,
  },
  slide: { alignItems: 'center', gap: 14 },
  slideEmoji: { fontSize: 96 },
  slideTitle: { fontSize: 24, fontWeight: '800', color: '#111', textAlign: 'center' },
  slideBody: { fontSize: 15, lineHeight: 23, color: '#666', textAlign: 'center', paddingHorizontal: 16 },

  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#d8d8d8' },
  dotActive: { backgroundColor: '#111', width: 24 },

  nextBtn: {
    backgroundColor: '#111',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnPressed: { opacity: 0.8 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
