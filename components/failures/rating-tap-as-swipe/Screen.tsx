import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

const STAR_COUNT = 5;
const STAR_SIZE = 44;

interface Props {
  faultActive?: boolean;
}

export default function RatingTapAsSwipeScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please select a star rating before submitting.');
      return;
    }
    setSubmitted(true);
  };

  // Faulty: the whole star row is a single horizontal pan. A "tap" on the 4th
  // star registers as a tiny pan and resolves from the final x-position with a
  // momentum bias, so it lands on the wrong value (or snaps to 0 if the gesture
  // barely moved). Discrete per-star tapping is impossible.
  const setFromX = useCallback(
    (x: number, width: number) => {
      if (width <= 0) return;
      // Bias resolution downward so a near-stationary tap under-shoots.
      const raw = (x / width) * STAR_COUNT;
      const value = Math.round(raw - 0.5);
      setRating(Math.max(0, Math.min(STAR_COUNT, value)));
    },
    [],
  );

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onEnd((e) => {
      runOnJS(setFromX)(e.x, trackWidth);
    });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Write a Review' }} />

      <View
        style={styles.card}
        testID={faultActive ? 'defect:M_RATING_TAP_AS_SWIPE' : undefined}
      >
        <View style={styles.productRow}>
          <View style={styles.productImage}>
            <Text style={styles.productEmoji}>🎧</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>Wireless Headphones</Text>
            <Text style={styles.productSub}>How was your experience?</Text>
          </View>
        </View>

        <Text style={styles.label}>Your rating</Text>

        {faultActive ? (
          // Faulty: single pan recognizer over the entire star strip.
          <GestureDetector gesture={panGesture}>
            <View
              style={styles.starRow}
              onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
              accessible
              accessibilityRole="adjustable"
              accessibilityLabel="Star rating"
              accessibilityValue={{ min: 0, max: STAR_COUNT, now: rating }}
            >
              {Array.from({ length: STAR_COUNT }).map((_, i) => (
                <View key={i} style={styles.star}>
                  <Text style={[styles.starText, i < rating && styles.starFilled]}>
                    {i < rating ? '★' : '☆'}
                  </Text>
                </View>
              ))}
            </View>
          </GestureDetector>
        ) : (
          // Baseline: five independent, tappable stars.
          <View style={styles.starRow}>
            {Array.from({ length: STAR_COUNT }).map((_, i) => {
              const value = i + 1;
              return (
                <Pressable
                  key={i}
                  style={styles.star}
                  onPress={() => setRating(value)}
                  accessibilityRole="button"
                  accessibilityLabel={`${value} star${value > 1 ? 's' : ''}`}
                >
                  <Text style={[styles.starText, i < rating && styles.starFilled]}>
                    {i < rating ? '★' : '☆'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={styles.ratingValue}>
          {rating > 0 ? `${rating} of ${STAR_COUNT} stars` : 'Not rated yet'}
        </Text>

        <Text style={styles.label}>Your review (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Share details about your experience…"
          placeholderTextColor="#aaa"
          multiline
          value={reviewText}
          onChangeText={setReviewText}
          accessibilityLabel="Review text"
        />

        {submitted && (
          <Text style={styles.confirmation} accessibilityLiveRegion="polite">
            ✓ Review submitted with {rating} star{rating > 1 ? 's' : ''}
          </Text>
        )}

        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed]}
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityLabel="Submit review"
        >
          <Text style={styles.submitText}>Submit Review</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 48 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: { fontSize: 28 },
  productInfo: { flex: 1, gap: 2 },
  productName: { fontSize: 16, fontWeight: '700', color: '#111' },
  productSub: { fontSize: 13, color: '#888' },

  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 6 },
  starRow: { flexDirection: 'row', alignSelf: 'flex-start' },
  star: {
    width: STAR_SIZE,
    height: STAR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starText: { fontSize: 34, color: '#ccc' },
  starFilled: { color: '#f59e0b' },
  ratingValue: { fontSize: 13, color: '#666' },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#111',
  },
  confirmation: { fontSize: 14, color: '#2e7d32', fontWeight: '600' },

  submitBtn: {
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnPressed: { opacity: 0.8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
