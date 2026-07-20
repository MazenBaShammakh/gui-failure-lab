import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface CalEvent {
  id: string;
  title: string;
  location: string;
}

const SUGGESTIONS = ['Central Park', 'Times Square', 'Empire State Building', 'Brooklyn Bridge'];

export default function ComboboxUncommittedValueScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [title, setTitle] = useState('');
  const [locationInput, setLocationInput] = useState('');
  // The actually-committed value. Baseline: typing alone commits it (on
  // change/blur). Faulty: only an explicit tap on a dropdown suggestion
  // ever writes here — typing text and saving without tapping a suggestion
  // leaves this empty, with no error surfaced anywhere.
  const [locationCommitted, setLocationCommitted] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [events, setEvents] = useState<CalEvent[]>([]);

  const filteredSuggestions = SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(locationInput.toLowerCase()),
  );

  const onChangeLocation = (text: string) => {
    setLocationInput(text);
    setShowSuggestions(text.length > 0);
    if (!faultActive) {
      setLocationCommitted(text);
    }
  };

  const onSelectSuggestion = (s: string) => {
    setLocationInput(s);
    setLocationCommitted(s);
    setShowSuggestions(false);
  };

  const onBlurLocation = () => {
    setShowSuggestions(false);
    if (!faultActive) {
      setLocationCommitted(locationInput);
    }
  };

  const onSave = () => {
    if (!title.trim()) return;
    setEvents((prev) => [
      ...prev,
      { id: `e-${Date.now()}`, title: title.trim(), location: locationCommitted },
    ]);
    setTitle('');
    setLocationInput('');
    setLocationCommitted('');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_COMBOBOX_UNCOMMITTED_VALUE' : undefined}
    >
      <Stack.Screen options={{ title: 'New Event' }} />

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Event title"
        placeholderTextColor="#9e9e9e"
        value={title}
        onChangeText={setTitle}
        accessibilityLabel="Event title"
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Search for a location"
        placeholderTextColor="#9e9e9e"
        value={locationInput}
        onChangeText={onChangeLocation}
        onFocus={() => setShowSuggestions(locationInput.length > 0)}
        onBlur={onBlurLocation}
        accessibilityLabel="Location"
      />

      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionBox}>
          {filteredSuggestions.map((s) => (
            <Pressable
              key={s}
              onPress={() => onSelectSuggestion(s)}
              accessibilityRole="button"
              accessibilityLabel={s}
              style={styles.suggestionRow}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </Pressable>
          ))}
        </View>
      )}

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
                <Text style={styles.eventWhen}>
                  {e.location.length > 0 ? e.location : 'No location'}
                </Text>
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
  suggestionBox: {
    marginTop: -10,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#dcdce0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  suggestionText: { fontSize: 15, color: '#111' },
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
