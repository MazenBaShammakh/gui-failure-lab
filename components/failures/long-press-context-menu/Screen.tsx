import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Task {
  id: string;
  title: string;
  done: boolean;
  due?: string;
  priority: boolean;
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Review pull requests', done: false, due: 'Today', priority: true },
  { id: '2', title: 'Buy groceries', done: false, due: 'Today', priority: false },
  { id: '3', title: 'Call dentist', done: false, due: 'Tomorrow', priority: false },
  { id: '4', title: 'Book flight to Berlin', done: false, due: 'Jun 20', priority: true },
  { id: '5', title: 'Write quarterly report', done: false, due: 'Jun 18', priority: false },
  { id: '6', title: 'Update project roadmap', done: false, due: 'Jun 25', priority: false },
  { id: '7', title: 'Team retrospective notes', done: true, due: undefined, priority: false },
];

// ─── TaskRow ──────────────────────────────────────────────────────────────────

interface RowProps {
  task: Task;
  faultActive: boolean;
  onToggleDone: () => void;
  onOpenMenu: () => void;
}

function TaskRow({ task, faultActive, onToggleDone, onOpenMenu }: RowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.taskRow, pressed && styles.taskRowPressed]}
      onPress={onToggleDone}
      onLongPress={onOpenMenu}
      delayLongPress={500}
      accessibilityRole="button"
      accessibilityLabel={[
        task.title,
        task.done ? 'completed' : 'not completed',
        task.due ? `due ${task.due}` : null,
        task.priority ? 'priority' : null,
      ]
        .filter(Boolean)
        .join(', ')}
    >
      {/* Checkbox — visual only; touch is handled by the outer Pressable */}
      <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
        {task.done && <Text style={styles.checkmark}>✓</Text>}
      </View>

      <View style={styles.taskBody}>
        <View style={styles.taskTitleRow}>
          {task.priority && <Text style={styles.priorityStar}>★ </Text>}
          <Text
            style={[styles.taskTitle, task.done && styles.taskTitleDone]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
        </View>
        {task.due !== undefined && (
          <Text
            style={[
              styles.taskDue,
              task.due === 'Today' && styles.taskDueToday,
            ]}
          >
            {task.due === 'Today'
              ? '📅 Today'
              : task.due === 'Tomorrow'
              ? '📅 Tomorrow'
              : `📅 ${task.due}`}
          </Text>
        )}
      </View>

      {/* Options button — present in baseline, absent in faulty.
          Baseline: agents (both vision-only and a11y-tree) can tap this to reach Edit/Delete.
          Faulty:   the button is gone. The only path is onLongPress, which agents miss. */}
      {!faultActive && (
        <Pressable
          onPress={onOpenMenu}
          style={styles.moreBtn}
          accessibilityRole="button"
          accessibilityLabel={`Options for ${task.title}`}
          hitSlop={12}
        >
          <Text style={styles.moreBtnText}>···</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

interface Props {
  faultActive?: boolean;
}

export default function LongPressContextMenuScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [menuTaskId, setMenuTaskId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editText, setEditText] = useState('');

  const menuTask = tasks.find((t) => t.id === menuTaskId) ?? null;

  const openMenu = useCallback((id: string) => setMenuTaskId(id), []);
  const closeMenu = useCallback(() => setMenuTaskId(null), []);

  const toggleDone = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }, []);

  const handleTogglePriority = useCallback(() => {
    if (!menuTaskId) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === menuTaskId ? { ...t, priority: !t.priority } : t,
      ),
    );
    closeMenu();
  }, [menuTaskId, closeMenu]);

  const handleDelete = useCallback(() => {
    if (!menuTaskId) return;
    setTasks((prev) => prev.filter((t) => t.id !== menuTaskId));
    closeMenu();
  }, [menuTaskId, closeMenu]);

  const handleStartEdit = useCallback(() => {
    if (!menuTask) return;
    setEditTask(menuTask);
    setEditText(menuTask.title);
    closeMenu();
  }, [menuTask, closeMenu]);

  const handleCommitEdit = useCallback(() => {
    if (editTask && editText.trim()) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editTask.id ? { ...t, title: editText.trim() } : t,
        ),
      );
    }
    setEditTask(null);
    setEditText('');
  }, [editTask, editText]);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:B_LONG_PRESS_ONLY_CONTEXT_MENU' : undefined}
    >
      <Stack.Screen options={{ title: 'My Tasks' }} />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            faultActive={faultActive}
            onToggleDone={() => toggleDone(item.id)}
            onOpenMenu={() => openMenu(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={tasks.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>All tasks complete</Text>
          </View>
        }
      />

      {/* ── Context menu ──────────────────────────────────────────────────── */}
      <Modal
        visible={menuTaskId !== null}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
        accessibilityViewIsModal={true}
      >
        <Pressable
          style={styles.overlay}
          onPress={closeMenu}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        >
          {/* Inner Pressable swallows touches so they don't close the sheet */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle} numberOfLines={2}>
              {menuTask?.title}
            </Text>
            <View style={styles.sheetDivider} />

            <Pressable
              style={styles.sheetOption}
              onPress={handleStartEdit}
              accessibilityRole="button"
              accessibilityLabel="Edit task"
            >
              <Text style={styles.sheetOptionIcon}>✏️</Text>
              <Text style={styles.sheetOptionText}>Edit</Text>
            </Pressable>

            <Pressable
              style={styles.sheetOption}
              onPress={handleTogglePriority}
              accessibilityRole="button"
              accessibilityLabel={
                menuTask?.priority ? 'Remove priority' : 'Mark as priority'
              }
            >
              <Text style={styles.sheetOptionIcon}>
                {menuTask?.priority ? '☆' : '⭐'}
              </Text>
              <Text style={styles.sheetOptionText}>
                {menuTask?.priority ? 'Remove priority' : 'Mark as priority'}
              </Text>
            </Pressable>

            <View style={styles.sheetDivider} />

            <Pressable
              style={styles.sheetOption}
              onPress={handleDelete}
              accessibilityRole="button"
              accessibilityLabel="Delete task"
            >
              <Text style={styles.sheetOptionIcon}>🗑</Text>
              <Text style={[styles.sheetOptionText, styles.dangerText]}>
                Delete
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Edit modal ────────────────────────────────────────────────────── */}
      <Modal
        visible={editTask !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditTask(null)}
        accessibilityViewIsModal={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.editOverlay}
        >
          <View style={styles.editSheet}>
            <Text style={styles.editHeading}>Edit Task</Text>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCommitEdit}
              accessibilityLabel="Task title"
            />
            <View style={styles.editActions}>
              <Pressable
                style={[styles.editBtn, styles.editBtnCancel]}
                onPress={() => setEditTask(null)}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text style={styles.editBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.editBtn, styles.editBtnSave]}
                onPress={handleCommitEdit}
                accessibilityRole="button"
                accessibilityLabel="Save"
              >
                <Text style={styles.editBtnSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },

  listContent: { paddingVertical: 8 },
  emptyContainer: { flex: 1 },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
    marginLeft: 60,
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  taskRowPressed: { backgroundColor: '#f5f5f5' },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxDone: { backgroundColor: '#4caf50', borderColor: '#4caf50' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },

  taskBody: { flex: 1, gap: 4 },
  taskTitleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  priorityStar: { color: '#f59e0b', fontSize: 14, marginTop: 1 },
  taskTitle: { fontSize: 15, color: '#111', flexShrink: 1 },
  taskTitleDone: { color: '#aaa', textDecorationLine: 'line-through' },
  taskDue: { fontSize: 12, color: '#888' },
  taskDueToday: { color: '#e53935', fontWeight: '600' },

  moreBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreBtnText: { fontSize: 20, color: '#aaa', letterSpacing: 2, lineHeight: 24 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#888' },

  // Context menu sheet
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  sheetTitle: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 0,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  sheetOptionIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  sheetOptionText: { fontSize: 16, color: '#111' },
  dangerText: { color: '#d32f2f' },

  // Edit modal
  editOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  editSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
    gap: 16,
  },
  editHeading: { fontSize: 17, fontWeight: '700', color: '#111' },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#fafafa',
  },
  editActions: { flexDirection: 'row', gap: 12 },
  editBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  editBtnCancel: { backgroundColor: '#f0f0f0' },
  editBtnSave: { backgroundColor: '#111' },
  editBtnCancelText: { fontSize: 15, color: '#555', fontWeight: '600' },
  editBtnSaveText: { fontSize: 15, color: '#fff', fontWeight: '700' },
});
