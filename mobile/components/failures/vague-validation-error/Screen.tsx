import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

// The "Ends" field defaults to a date before "Starts" — a stale default the
// user must correct before the recurrence is valid. What differs is how
// clearly the validation failure is communicated.
const START_DATE = 'Mon, Jul 20, 2026';
const DEFAULT_END_DATE = 'Wed, Jul 15, 2026';

function parseSimpleDate(s: string): number {
  const cleaned = s.replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s*/i, '');
  const d = new Date(cleaned);
  return d.getTime();
}

export default function VagueValidationErrorScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [title, setTitle] = useState('');
  const [endDate, setEndDate] = useState(DEFAULT_END_DATE);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    if (!title.trim()) return;

    const startMs = parseSimpleDate(START_DATE);
    const endMs = parseSimpleDate(endDate);
    const invalidRange = !Number.isNaN(endMs) && endMs <= startMs;
    const unparseable = Number.isNaN(endMs);

    if (invalidRange || unparseable) {
      // Baseline: names the exact field and the exact fix.
      // Faulty: a single generic message, no field reference at all.
      setError(faultActive ? 'Invalid input' : 'End date must be after start date.');
      setSaved(false);
      return;
    }

    setError(null);
    setSaved(true);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_VAGUE_VALIDATION_ERROR' : undefined}
    >
      <Stack.Screen options={{ title: 'Recurring Event' }} />

      {saved && (
        <View style={styles.successBanner} accessibilityLiveRegion="polite">
          <Text style={styles.successText}>✓ Recurring event created</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorBanner} accessibilityLiveRegion="polite">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Event title"
        placeholderTextColor="#9e9e9e"
        value={title}
        onChangeText={setTitle}
        accessibilityLabel="Event title"
      />

      <Text style={styles.label}>Starts</Text>
      <View style={styles.staticField}>
        <Text style={styles.staticFieldText}>{START_DATE}</Text>
      </View>

      <Text style={styles.label}>Repeat</Text>
      <View style={styles.staticField}>
        <Text style={styles.staticFieldText}>Weekly</Text>
      </View>

      <Text style={styles.label}>Ends</Text>
      <TextInput
        style={styles.input}
        value={endDate}
        onChangeText={setEndDate}
        accessibilityLabel="Ends"
      />

      <Pressable
        style={styles.saveButton}
        onPress={onSave}
        accessibilityRole="button"
        accessibilityLabel="Save"
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 48 },
  successBanner: { backgroundColor: '#e8f5e9', borderRadius: 10, padding: 14, marginBottom: 16 },
  successText: { color: '#2e7d32', fontSize: 14, fontWeight: '600' },
  errorBanner: { backgroundColor: '#fdecea', borderRadius: 10, padding: 14, marginBottom: 16 },
  errorText: { color: '#c62828', fontSize: 14, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: '#f6f6f8',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#dcdce0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
    marginBottom: 16,
  },
  staticField: {
    backgroundColor: '#f6f6f8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  staticFieldText: { fontSize: 16, color: '#333' },
  saveButton: {
    backgroundColor: '#e53935',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
