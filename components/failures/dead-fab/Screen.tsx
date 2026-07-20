import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const INITIAL_TASKS = [
  'Draft Q3 roadmap',
  'Sync with design team',
  'Review API contract',
];

export default function DeadFabScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [tasks, setTasks] = useState<string[]>(INITIAL_TASKS);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');

  const openComposer = () => {
    if (faultActive) return; // dead FAB never opens the composer
    setComposing(true);
  };

  const addTask = () => {
    const title = draft.trim();
    if (!title) return;
    setTasks((prev) => [...prev, title]);
    setDraft('');
    setComposing(false);
  };

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DEAD_FAB' : undefined}
    >
      <Stack.Screen options={{ title: 'Mobile App — Tasks' }} />

      <View style={styles.list}>
        {tasks.map((t, i) => (
          <View key={i} style={styles.taskCard}>
            <View style={styles.bullet} />
            <Text style={styles.taskText}>{t}</Text>
          </View>
        ))}
        {tasks.length === 0 && <Text style={styles.empty}>No tasks yet.</Text>}
      </View>

      {composing && !faultActive && (
        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            placeholder="New task…"
            placeholderTextColor="#aaa"
            value={draft}
            onChangeText={setDraft}
            autoFocus
            accessibilityLabel="New task title"
            onSubmitEditing={addTask}
          />
          <Pressable
            style={({ pressed }) => [styles.composerBtn, pressed && styles.composerBtnPressed]}
            onPress={addTask}
            accessibilityRole="button"
            accessibilityLabel="Save task"
          >
            <Text style={styles.composerBtnText}>Add</Text>
          </Pressable>
        </View>
      )}

      {/* Faulty: a plain styled View that looks exactly like a FAB but has no
          handler — tapping it does nothing. Baseline: a real Pressable FAB that
          opens the new-task composer. */}
      {faultActive ? (
        <View
          style={styles.fab}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Create a new task"
        >
          <Text style={styles.fabIcon}>＋</Text>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={openComposer}
          accessibilityRole="button"
          accessibilityLabel="Create a new task"
        >
          <Text style={styles.fabIcon}>＋</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8', padding: 16 },
  list: { gap: 10 },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  bullet: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#bbb' },
  taskText: { fontSize: 15, color: '#111', flex: 1 },
  empty: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 32 },

  composer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  composerInput: { flex: 1, fontSize: 15, color: '#111', paddingHorizontal: 8, paddingVertical: 8 },
  composerBtn: { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 },
  composerBtnPressed: { opacity: 0.8 },
  composerBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabPressed: { backgroundColor: '#1d4ed8' },
  fabIcon: { color: '#fff', fontSize: 30, fontWeight: '400', lineHeight: 32, marginTop: -2 },
});
