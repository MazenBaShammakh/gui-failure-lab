import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import DeuteranopiaPriorityFlags from '@/components/failures/deuteranopia-priority-flags';

interface Props {
  faultActive?: boolean;
}

interface ChecklistItem {
  id: string;
  title: string;
  done: boolean;
}

const INITIAL_ITEMS: ChecklistItem[] = [
  { id: '1', title: 'Reply to onboarding email', done: true },
  { id: '2', title: 'Submit timesheet', done: false },
  { id: '3', title: 'Call dentist', done: false },
  { id: '4', title: 'Pick up dry cleaning', done: false },
  { id: '5', title: 'Renew gym membership', done: false },
];

export default function DecoyOverlayCheckboxScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [items, setItems] = useState<ChecklistItem[]>(INITIAL_ITEMS);

  const toggle = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  };

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DECOY_OVERLAY_CHECKBOX' : undefined}
    >
      <Stack.Screen options={{ title: 'Today' }} />

      {/* X07 (F-IDT-05): its own flagged-items block, above the checklist. The
          host's decoy overlay sits on the "Call dentist" checkbox further down
          and is never touched by this task. */}
      <DeuteranopiaPriorityFlags />

      <Text style={styles.heading}>Checklist</Text>

      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.checkboxWrap}>
              <Pressable
                style={[styles.checkbox, item.done && styles.checkboxDone]}
                onPress={() => toggle(item.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: item.done }}
                accessibilityLabel={`Mark ${item.title} as done`}
                hitSlop={6}
              >
                {item.done && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>

              {/* Faulty: a fully transparent decoy View is absolutely positioned
                  over the checkbox and intercepts the tap. The checkbox is
                  perfectly visible and reads as a checkbox in the tree, but the
                  tap never reaches it. Baseline: no decoy, the checkbox toggles. */}
              {faultActive && (
                <View style={styles.decoy} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
              )}
            </View>

            <Text style={[styles.rowTitle, item.done && styles.rowTitleDone]}>
              {item.title}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.summary}>
        {items.filter((i) => i.done).length} of {items.length} done
      </Text>
    </View>
  );
}

const CHECKBOX_SIZE = 26;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, gap: 12 },
  heading: { fontSize: 22, fontWeight: '800', color: '#111' },
  list: { gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  checkboxWrap: { position: 'relative', width: CHECKBOX_SIZE, height: CHECKBOX_SIZE },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: '800', lineHeight: 18 },
  // Transparent decoy that swallows the tap. Slightly larger than the checkbox
  // so it reliably covers the entire hit area.
  decoy: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: 'transparent',
  },
  rowTitle: { flex: 1, fontSize: 16, color: '#111' },
  rowTitleDone: { color: '#999', textDecorationLine: 'line-through' },
  summary: { fontSize: 13, color: '#888', marginTop: 8 },
});
