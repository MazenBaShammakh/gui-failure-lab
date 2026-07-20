import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

export default function DenseTouchTargetsScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [input, setInput] = useState('');

  const handleKey = (key: string) => {
    if (key === '*') {
      setInput('');
    } else if (input.length < 4) {
      setInput((prev) => prev + key);
    }
  };

  // Baseline: 64×64 buttons, 10px gaps — meets 44pt minimum touch target
  // Faulty: 22×22 buttons, 3px gaps — far below minimum, densely packed
  const btnSize = faultActive ? 22 : 64;
  const btnGap = faultActive ? 3 : 10;
  const btnFontSize = faultActive ? 9 : 22;

  const formatted = input.length === 4
    ? `${input.slice(0, 2)}:${input.slice(2)}`
    : input || '– –:– –';

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:B_DENSE_TOUCH_TARGETS' : undefined}
    >
      <Stack.Screen options={{ title: 'Set Alarm' }} />

      <Text style={styles.heading}>Set Alarm Time</Text>

      <View style={styles.display}>
        <Text style={styles.displayText}>{formatted}</Text>
        <Text style={styles.displayHint}>HHMM</Text>
      </View>

      <View style={[styles.keypad, { gap: btnGap }]}>
        {KEYPAD_ROWS.map((row, ri) => (
          <View key={ri} style={[styles.keypadRow, { gap: btnGap }]}>
            {row.map((key) => (
              <Pressable
                key={key}
                onPress={() => handleKey(key)}
                accessibilityRole="button"
                accessibilityLabel={key === '*' ? 'Clear' : key}
                style={({ pressed }) => [
                  styles.key,
                  {
                    width: btnSize,
                    height: btnSize,
                    borderRadius: btnSize / 2,
                    opacity: pressed ? 0.7 : 1,
                  },
                  key === '*' && styles.keySpecial,
                ]}
              >
                <Text style={[styles.keyText, { fontSize: btnFontSize }]}>
                  {key === '*' ? '⌫' : key}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      <Pressable
        style={styles.confirmBtn}
        accessibilityRole="button"
        accessibilityLabel="Confirm alarm time"
        onPress={() => setInput('')}
      >
        <Text style={styles.confirmBtnText}>Set Alarm</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 32,
  },
  heading: { fontSize: 16, fontWeight: '600', color: '#8b949e', textTransform: 'uppercase', letterSpacing: 1.5 },
  display: { alignItems: 'center', gap: 4 },
  displayText: { fontSize: 56, fontWeight: '200', color: '#e6edf3', fontVariant: ['tabular-nums'] },
  displayHint: { fontSize: 11, color: '#444', letterSpacing: 3 },
  keypad: { alignItems: 'center' },
  keypadRow: { flexDirection: 'row', alignItems: 'center' },
  key: {
    backgroundColor: '#161b22',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  keySpecial: { backgroundColor: '#1f2937' },
  keyText: { color: '#c9d1d9', fontWeight: '500' },
  confirmBtn: {
    backgroundColor: '#1db954',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
