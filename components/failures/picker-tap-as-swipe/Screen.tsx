import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface Props {
  faultActive?: boolean;
}

const ITEM_HEIGHT = 44;
const VISIBLE = 5; // odd, so there is a center row
const CENTER = Math.floor(VISIBLE / 2);

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = ['00', '15', '30', '45'];
const PERIODS = ['AM', 'PM'];

interface WheelProps {
  values: string[];
  index: number;
  faultActive: boolean;
  onChange: (next: number) => void;
  label: string;
}

function Wheel({ values, index, faultActive, onChange, label }: WheelProps) {
  const offset = useSharedValue(0);

  const commit = useCallback(
    (deltaRows: number) => {
      const next = Math.max(0, Math.min(values.length - 1, index + deltaRows));
      onChange(next);
    },
    [index, values.length, onChange],
  );

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onUpdate((e) => {
      offset.value = e.translationY;
    })
    .onEnd((e) => {
      // Convert the drag distance into a number of rows to move.
      // Baseline: snaps to the nearest row, so a near-stationary tap stays put
      //   (deltaRows rounds to 0) and the row the finger lifted on is selected
      //   exactly via the per-row Pressable below.
      // Faulty: the wheel only "commits" on momentum — a tiny tap movement is
      //   amplified into a one-row fling, so tapping "9" lands on 8 or 10.
      if (faultActive) {
        // Even an almost-stationary tap registers as at least one row of drift,
        // biased by the slight direction of the touch.
        const dir = e.translationY <= 0 ? 1 : -1; // tap slightly up -> next value
        const magnitude = Math.max(1, Math.round(Math.abs(e.translationY) / ITEM_HEIGHT));
        runOnJS(commit)(dir * magnitude);
      } else {
        const deltaRows = -Math.round(e.translationY / ITEM_HEIGHT);
        if (deltaRows !== 0) runOnJS(commit)(deltaRows);
      }
      offset.value = withSpring(0, { damping: 22, stiffness: 220 });
    });

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  const renderRow = (value: string, rowIndex: number) => {
    const distance = Math.abs(rowIndex - index);
    const selected = rowIndex === index;
    const content = (
      <View
        style={[styles.item, { height: ITEM_HEIGHT }]}
        key={value}
      >
        <Text
          style={[
            styles.itemText,
            selected && styles.itemTextSelected,
            distance === 1 && styles.itemTextNear,
            distance >= 2 && styles.itemTextFar,
          ]}
        >
          {value}
        </Text>
      </View>
    );

    // Baseline: each visible value is an exact tap target.
    if (!faultActive) {
      return (
        <Pressable
          key={value}
          onPress={() => onChange(rowIndex)}
          accessibilityRole="button"
          accessibilityLabel={`${label} ${value}`}
          style={{ height: ITEM_HEIGHT }}
        >
          {content}
        </Pressable>
      );
    }
    return content;
  };

  const inner = (
    <Animated.View style={stripStyle}>
      {values.map((v, i) => renderRow(v, i))}
    </Animated.View>
  );

  // Center the selected row within the window.
  const stripTop = (CENTER - index) * ITEM_HEIGHT;

  return (
    <View style={styles.wheelCol}>
      <View style={[styles.window, { height: ITEM_HEIGHT * VISIBLE }]}>
        <View style={[styles.selectionBand, { top: CENTER * ITEM_HEIGHT, height: ITEM_HEIGHT }]} pointerEvents="none" />
        {faultActive ? (
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[styles.stripWrap, { top: stripTop }]}
              accessible
              accessibilityRole="adjustable"
              accessibilityLabel={label}
              accessibilityValue={{ text: values[index] }}
            >
              {inner}
            </Animated.View>
          </GestureDetector>
        ) : (
          <View style={[styles.stripWrap, { top: stripTop }]}>{inner}</View>
        )}
      </View>
    </View>
  );
}

export default function PickerTapAsSwipeScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  // Defaults far enough from 9:00 PM that the agent must actively select.
  const [hourIdx, setHourIdx] = useState(6); // -> 7
  const [minIdx, setMinIdx] = useState(2); // -> 30
  const [periodIdx, setPeriodIdx] = useState(0); // -> AM
  const [saved, setSaved] = useState<string | null>(null);

  const hourLabel = String(HOURS[hourIdx]);
  const minLabel = MINUTES[minIdx];
  const periodLabel = PERIODS[periodIdx];
  const timeLabel = `${hourLabel}:${minLabel} ${periodLabel}`;

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_PICKER_TAP_AS_SWIPE' : undefined}
    >
      <Stack.Screen options={{ title: 'Set Bedtime' }} />

      <Text style={styles.heading}>Bedtime</Text>
      <Text style={styles.preview}>{timeLabel}</Text>

      <View style={styles.picker}>
        <Wheel
          label="Hour"
          values={HOURS.map(String)}
          index={hourIdx}
          faultActive={faultActive}
          onChange={setHourIdx}
        />
        <Text style={styles.colon}>:</Text>
        <Wheel
          label="Minute"
          values={MINUTES}
          index={minIdx}
          faultActive={faultActive}
          onChange={setMinIdx}
        />
        <Wheel
          label="Period"
          values={PERIODS}
          index={periodIdx}
          faultActive={faultActive}
          onChange={setPeriodIdx}
        />
      </View>

      {saved && (
        <Text style={styles.confirmation} accessibilityLiveRegion="polite">
          ✓ Bedtime set for {saved}
        </Text>
      )}

      <Pressable
        style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
        onPress={() => setSaved(timeLabel)}
        accessibilityRole="button"
        accessibilityLabel="Save bedtime"
      >
        <Text style={styles.saveText}>Save Bedtime</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
    alignItems: 'center',
    padding: 24,
    gap: 18,
  },
  heading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 12,
  },
  preview: {
    fontSize: 40,
    fontWeight: '300',
    color: '#e6edf3',
    fontVariant: ['tabular-nums'],
  },

  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  colon: { fontSize: 28, color: '#e6edf3', fontWeight: '300', marginHorizontal: 2 },
  wheelCol: { width: 72 },
  window: {
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: '#161b22',
    position: 'relative',
  },
  selectionBand: {
    position: 'absolute',
    left: 6,
    right: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(88,166,255,0.12)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#30363d',
  },
  stripWrap: { position: 'absolute', left: 0, right: 0 },
  item: { justifyContent: 'center', alignItems: 'center' },
  itemText: { fontSize: 22, color: '#c9d1d9', fontWeight: '500', fontVariant: ['tabular-nums'] },
  itemTextSelected: { color: '#58a6ff', fontSize: 24, fontWeight: '700' },
  itemTextNear: { color: '#6e7681' },
  itemTextFar: { color: '#3a414b' },

  confirmation: { fontSize: 14, color: '#3fb950', fontWeight: '600', marginTop: 4 },
  saveBtn: {
    backgroundColor: '#1f6feb',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginTop: 'auto',
    marginBottom: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  saveBtnPressed: { opacity: 0.85 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
