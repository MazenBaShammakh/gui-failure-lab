import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Agenda {
  id: string;
  title: string;
  time: string;
}

// Visual order is the intended agenda order: index 0 is the FIRST task.
const AGENDA: Agenda[] = [
  { id: 'a1', title: 'Daily standup', time: '09:00' },
  { id: 'a2', title: 'Design review', time: '10:30' },
  { id: 'a3', title: 'Lunch with Priya', time: '12:00' },
  { id: 'a4', title: 'Sprint planning', time: '14:00' },
  { id: 'a5', title: 'Customer demo', time: '16:00' },
];

const ROW_HEIGHT = 72;
const ROW_GAP = 10;
const ROW_STRIDE = ROW_HEIGHT + ROW_GAP;

interface RowProps {
  item: Agenda;
  visualIndex: number;
  done: boolean;
  absolute: boolean;
  onComplete: () => void;
}

function AgendaRow({ item, visualIndex, done, absolute, onComplete }: RowProps) {
  return (
    <View
      style={[
        styles.row,
        done && styles.rowDone,
        absolute && { position: 'absolute', left: 0, right: 0, top: visualIndex * ROW_STRIDE },
      ]}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowTime}>{item.time}</Text>
        <Text style={[styles.rowTitle, done && styles.rowTitleDone]}>{item.title}</Text>
      </View>
      <Pressable
        onPress={onComplete}
        disabled={done}
        accessibilityRole="button"
        accessibilityLabel={`Complete ${item.title}`}
        style={[styles.completeBtn, done && styles.completeBtnDone]}
      >
        <Text style={[styles.completeBtnText, done && styles.completeBtnTextDone]}>
          {done ? '✓ Done' : 'Complete'}
        </Text>
      </Pressable>
    </View>
  );
}

export default function ScrambledFocusOrderScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const complete = useCallback((id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: true }));
  }, []);

  // Faulty: render in REVERSED tree order but absolutely position each row at its
  // visual slot — so the visual top item is the LAST child in the tree. A
  // tree/index agent acting on "the first task" (first child) hits the visually
  // LAST item. Baseline: tree order == visual order.
  const treeOrder = faultActive ? [...AGENDA].reverse() : AGENDA;

  const firstTask = AGENDA[0];
  const completedFirst = !!completed[firstTask.id];
  const wrongTask = AGENDA.find((t, i) => i !== 0 && completed[t.id]);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_SCRAMBLED_FOCUS_ORDER' : undefined}
    >
      <Stack.Screen options={{ title: 'Agenda' }} />

      <Text style={styles.heading}>Today’s agenda</Text>

      <View
        style={[
          styles.list,
          faultActive && { height: AGENDA.length * ROW_STRIDE - ROW_GAP },
        ]}
      >
        {treeOrder.map((item) => {
          const visualIndex = AGENDA.findIndex((a) => a.id === item.id);
          return (
            <AgendaRow
              key={item.id}
              item={item}
              visualIndex={visualIndex}
              done={!!completed[item.id]}
              absolute={faultActive}
              onComplete={() => complete(item.id)}
            />
          );
        })}
      </View>

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {completedFirst
            ? `Completed the first task (${firstTask.title}). ✓`
            : wrongTask
            ? `Completed ${wrongTask.title} — not the first task.`
            : 'Complete the first task.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f3f7' },
  heading: { fontSize: 18, fontWeight: '700', color: '#111', padding: 16, paddingBottom: 8 },

  list: { paddingHorizontal: 16, gap: ROW_GAP },

  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  rowDone: { backgroundColor: '#f1f8f1' },
  rowText: { flex: 1, gap: 3 },
  rowTime: { fontSize: 12, color: '#999', fontWeight: '600' },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#111' },
  rowTitleDone: { color: '#9a9a9a', textDecorationLine: 'line-through' },

  completeBtn: {
    backgroundColor: '#1565c0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  completeBtnDone: { backgroundColor: '#e0e0e0' },
  completeBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  completeBtnTextDone: { color: '#4caf50' },

  statusBar: {
    marginTop: 'auto',
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusText: { fontSize: 13, color: '#555' },
});
