import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

const STAR_COUNT = 5;
const STAR_SIZE = 48;
// A pan must travel at least this far to count as a drag. A tap (≈0 px) is inert.
const DRAG_ACTIVATE_PX = 14;

interface Props {
  faultActive?: boolean;
}

const PLACE = {
  name: 'Blue Bottle Coffee',
  category: 'Coffee shop · 0.3 mi',
  emoji: '☕',
};

/**
 * B13 — Continuous-value control: analog drag required where the value is
 * a11y-settable (Interaction Scope, overlaps Perceptibility).
 *
 * The star rating is plainly visible, so a vision agent grounds on it and taps
 * the desired star. The differential requires BOTH conditions to hold:
 *
 *   1. The tap path is INERT. In faulty mode the strip is a single pan recognizer;
 *      a tap registers as a zero-length drag and changes nothing. Reaching a value
 *      needs a real drag with a precise release endpoint — which a vision-grounded
 *      action reproduces unreliably (tap↔drag primitive mismatch + endpoint
 *      precision).
 *
 *   2. The value is genuinely a11y-SETTABLE. The strip exposes role "adjustable",
 *      an accessibilityValue, AND concrete actions: increment, decrement, and a
 *      custom "Set rating to N" for each N (the ACTION_SET_PROGRESS analogue). A
 *      text agent invokes the set action and lands the exact value.
 *
 *   Fails: vision-only (tap is inert; drag endpoint imprecise).
 *   Succeeds: text-only (semantic set-value, exact).
 *
 * If tap also worked there would be no differential; if the strip exposed no
 * settable semantics, text would fail too — that is A6, not this. Baseline here is
 * the corrected control: five discrete tappable stars.
 *
 * Caveat (B4 family): pointer-drag exists on web, so this is NOT native-only —
 * drag-only continuous controls (drum pickers especially) are merely a native
 * habit. Remediation: accept tap-to-set in addition to drag and expose a settable
 * value action.
 *
 * NOTE: the text-success path depends on the custom/increment AccessibilityActions
 * being read and invoked from the native device tree. React Native Web does not
 * surface accessibilityActions, so the semantic set-value arm is faithful on the
 * native build; on web only the inert-tap visual arm is reproduced.
 */
export default function RatingDragSettableScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);

  const clamp = (v: number) => Math.max(0, Math.min(STAR_COUNT, v));

  // Resolve a star value from the release x-position of a *real* drag only.
  const setFromDrag = useCallback((x: number, translation: number, width: number) => {
    if (width <= 0) return;
    if (Math.abs(translation) < DRAG_ACTIVATE_PX) return; // a tap is inert
    const raw = (x / width) * STAR_COUNT;
    setRating(clamp(Math.ceil(raw)));
  }, []);

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onEnd((e) => {
      runOnJS(setFromDrag)(e.x, e.translationX, trackWidth);
    });

  // The settable-value semantics: increment / decrement + an explicit
  // "Set rating to N" custom action for each star value.
  const setRatingActions = Array.from({ length: STAR_COUNT }, (_, i) => ({
    name: `set_${i + 1}`,
    label: `Set rating to ${i + 1}`,
  }));
  const a11yProps = {
    accessible: true as const,
    accessibilityRole: 'adjustable' as const,
    accessibilityLabel: 'Your rating',
    accessibilityValue: {
      min: 0,
      max: STAR_COUNT,
      now: rating,
      text: rating > 0 ? `${rating} of ${STAR_COUNT} stars` : 'Not rated',
    },
    accessibilityActions: [
      { name: 'increment', label: 'Increase rating' },
      { name: 'decrement', label: 'Decrease rating' },
      ...setRatingActions,
    ],
    onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
      const { actionName } = event.nativeEvent;
      if (actionName === 'increment') setRating((r) => clamp(r + 1));
      else if (actionName === 'decrement') setRating((r) => clamp(r - 1));
      else if (actionName.startsWith('set_')) {
        setRating(clamp(Number(actionName.slice(4))));
      }
    },
  };

  const stars = (
    <View
      style={styles.starRow}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      {...(faultActive ? a11yProps : {})}
    >
      {Array.from({ length: STAR_COUNT }).map((_, i) => {
        const value = i + 1;
        const filled = i < rating;
        const starGlyph = (
          <Text style={[styles.starText, filled && styles.starFilled]}>
            {filled ? '★' : '☆'}
          </Text>
        );
        // Baseline: each star is an independent, tappable button (tap-to-set works).
        // Faulty: stars are inert Views; only the strip-level pan changes the value.
        return faultActive ? (
          <View key={i} style={styles.star}>
            {starGlyph}
          </View>
        ) : (
          <Pressable
            key={i}
            style={styles.star}
            onPress={() => setRating(value)}
            accessibilityRole="button"
            accessibilityLabel={`Set rating to ${value}`}
          >
            {starGlyph}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Rate this place' }} />

      <View
        style={styles.card}
        testID={faultActive ? 'defect:M_RATING_DRAG_SETTABLE' : undefined}
      >
        <View style={styles.placeRow}>
          <View style={styles.placeImage}>
            <Text style={styles.placeEmoji}>{PLACE.emoji}</Text>
          </View>
          <View style={styles.placeInfo}>
            <Text style={styles.placeName}>{PLACE.name}</Text>
            <Text style={styles.placeSub}>{PLACE.category}</Text>
          </View>
        </View>

        <Text style={styles.label}>Rate your visit</Text>

        {faultActive ? (
          <GestureDetector gesture={panGesture}>{stars}</GestureDetector>
        ) : (
          stars
        )}

        <Text style={styles.ratingValue}>
          {rating > 0 ? `${rating} of ${STAR_COUNT} stars` : 'Not rated yet'}
        </Text>

        {submitted && (
          <Text style={styles.confirmation} accessibilityLiveRegion="polite">
            ✓ Thanks! You rated {PLACE.name} {rating} star{rating > 1 ? 's' : ''}
          </Text>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            rating === 0 && styles.submitBtnDisabled,
            pressed && styles.submitBtnPressed,
          ]}
          disabled={rating === 0}
          onPress={() => setSubmitted(true)}
          accessibilityRole="button"
          accessibilityLabel="Submit rating"
        >
          <Text style={styles.submitText}>Submit rating</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 48 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 12 },

  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  placeImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeEmoji: { fontSize: 28 },
  placeInfo: { flex: 1, gap: 2 },
  placeName: { fontSize: 16, fontWeight: '700', color: '#111' },
  placeSub: { fontSize: 13, color: '#888' },

  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 6 },
  starRow: { flexDirection: 'row', alignSelf: 'flex-start' },
  star: {
    width: STAR_SIZE,
    height: STAR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starText: { fontSize: 38, color: '#ccc' },
  starFilled: { color: '#f59e0b' },
  ratingValue: { fontSize: 13, color: '#666' },

  confirmation: { fontSize: 14, color: '#2e7d32', fontWeight: '600' },

  submitBtn: {
    backgroundColor: '#1a73e8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { backgroundColor: '#b0c7ec' },
  submitBtnPressed: { opacity: 0.85 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
