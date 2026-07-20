import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Task {
  id: string;
  title: string;
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Review pull requests' },
  { id: '2', title: 'Write quarterly report' },
  { id: '3', title: 'Buy groceries' },
  { id: '4', title: 'Book flight to Berlin' },
  { id: '5', title: 'Update project roadmap' },
  { id: '6', title: 'Call dentist' },
];

interface RowProps {
  task: Task;
  index: number;
  total: number;
  faultActive: boolean;
  onMoveUp: () => void;
  onMoveToTop: () => void;
}

function TaskRow({ task, index, total, faultActive, onMoveUp, onMoveToTop }: RowProps) {
  return (
    <View style={styles.taskRow}>
      {/* Drag handle — present in both modes, but in faulty mode it is the ONLY
          affordance and only a real long-press + drag (no library here) would
          reorder. There are no tappable up/move-to-top controls in faulty. */}
      <View
        style={styles.dragHandle}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel="Drag handle"
      >
        <Text style={styles.dragHandleText}>≡</Text>
      </View>

      <View style={styles.taskBody}>
        <Text style={styles.taskTitle}>{task.title}</Text>
      </View>

      {/* Baseline: visible, tappable reorder controls (move up + move to top).
          Faulty: nothing tappable — reorder is drag-only, with no hint. */}
      {!faultActive && (
        <View style={styles.controls}>
          <Pressable
            style={({ pressed }) => [styles.ctrlBtn, pressed && styles.ctrlBtnPressed]}
            onPress={onMoveToTop}
            disabled={index === 0}
            accessibilityRole="button"
            accessibilityLabel={`Move ${task.title} to top`}
            hitSlop={8}
          >
            <Text style={[styles.ctrlText, index === 0 && styles.ctrlDisabled]}>⤒</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.ctrlBtn, pressed && styles.ctrlBtnPressed]}
            onPress={onMoveUp}
            disabled={index === 0}
            accessibilityRole="button"
            accessibilityLabel={`Move ${task.title} up`}
            hitSlop={8}
          >
            <Text style={[styles.ctrlText, index === 0 && styles.ctrlDisabled]}>▲</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

interface Props {
  faultActive?: boolean;
}

export default function DragReorderOnlyScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    setTasks((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveToTop = useCallback((index: number) => {
    if (index === 0) return;
    setTasks((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  }, []);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DRAG_REORDER_ONLY' : undefined}
    >
      <Stack.Screen options={{ title: 'Reorder Tasks' }} />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TaskRow
            task={item}
            index={index}
            total={tasks.length}
            faultActive={faultActive}
            onMoveUp={() => moveUp(index)}
            onMoveToTop={() => moveToTop(index)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  listContent: { paddingVertical: 8 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#e0e0e0', marginLeft: 56 },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  dragHandle: { width: 24, alignItems: 'center', justifyContent: 'center' },
  dragHandleText: { fontSize: 20, color: '#bbb' },
  taskBody: { flex: 1 },
  taskTitle: { fontSize: 15, color: '#111' },

  controls: { flexDirection: 'row', gap: 4 },
  ctrlBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctrlBtnPressed: { backgroundColor: '#e0e0e0' },
  ctrlText: { fontSize: 16, color: '#1565c0', fontWeight: '700' },
  ctrlDisabled: { color: '#ccc' },
});
