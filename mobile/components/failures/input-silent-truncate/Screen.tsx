import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import ColorInversionCalendarPicker from '@/components/failures/color-inversion-calendar-picker';

interface CalEvent {
  id: string;
  title: string;
  when: string;
}

const MAX_LEN = 10; // faulty silent truncation length

interface Props {
  faultActive?: boolean;
}

export default function InputSilentTruncateScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  // The committed value of the input. In faulty mode it is silently truncated
  // so it differs from what the user typed, with no error or visible cue.
  const [title, setTitle] = useState('');
  const [events, setEvents] = useState<CalEvent[]>([]);

  const onChangeTitle = useCallback(
    (text: string) => {
      if (faultActive) {
        // Silent truncation: commit only the first MAX_LEN characters.
        setTitle(text.slice(0, MAX_LEN));
      } else {
        setTitle(text);
      }
    },
    [faultActive],
  );

  const onSave = useCallback(() => {
    const committed = title.trim();
    if (!committed) return;
    setEvents((prev) => [
      ...prev,
      { id: `e-${Date.now()}`, title: committed, when: 'Today · 10:00 AM' },
    ]);
    setTitle('');
  }, [title]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_INPUT_SILENT_TRUNCATE' : undefined}
    >
      <Stack.Screen options={{ title: 'New event' }} />

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Event title"
        placeholderTextColor="#9e9e9e"
        value={title}
        onChangeText={onChangeTitle}
        accessibilityLabel="Event title"
        autoCorrect={false}
      />

      <Text style={styles.label}>When</Text>
      <View style={styles.staticField}>
        <Text style={styles.staticFieldText}>Today · 10:00 AM</Text>
      </View>

      {/* X06 (F-IDT-05): calendar colour picker. Sits between "When" and Save;
          the host's defect silently truncates the Title input above, which this
          task never types into. */}
      <ColorInversionCalendarPicker />

      <Pressable
        style={styles.saveButton}
        onPress={onSave}
        accessibilityRole="button"
        accessibilityLabel="Save"
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>

      {events.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Scheduled</Text>
          {events.map((e) => (
            <View key={e.id} style={styles.eventRow}>
              <View style={styles.eventDot} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{e.title}</Text>
                <Text style={styles.eventWhen}>{e.when}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 48 },
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 10,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  eventDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e53935' },
  eventInfo: { gap: 2 },
  eventTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  eventWhen: { fontSize: 13, color: '#999' },
});
