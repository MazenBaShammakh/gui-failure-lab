import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface TaskItem {
  id: string;
  title: string;
  done: boolean;
}

// A list long enough to require scrolling, so the recycled-node pool wraps and a
// given node identity ends up bound to a different data row than it first held.
// The target item ("Renew passport") sits well below the fold.
const INITIAL_ITEMS: TaskItem[] = [
  { id: 't01', title: 'Reply to onboarding email', done: true },
  { id: 't02', title: 'Submit timesheet', done: false },
  { id: 't03', title: 'Call dentist', done: false },
  { id: 't04', title: 'Pick up dry cleaning', done: false },
  { id: 't05', title: 'Renew gym membership', done: false },
  { id: 't06', title: 'Book flights to Berlin', done: false },
  { id: 't07', title: 'Water the plants', done: false },
  { id: 't08', title: 'Send invoice to client', done: false },
  { id: 't09', title: 'Schedule car service', done: false },
  { id: 't10', title: 'Buy birthday gift', done: false },
  { id: 't11', title: 'Update résumé', done: false },
  { id: 't12', title: 'Cancel old subscription', done: false },
  { id: 't13', title: 'Read chapter 4', done: false },
  { id: 't14', title: 'Pay electricity bill', done: false },
  { id: 't15', title: 'Back up laptop', done: false },
  { id: 't16', title: 'Confirm hotel booking', done: false },
  { id: 't17', title: 'Renew passport', done: false },
  { id: 't18', title: 'Organize garage', done: false },
  { id: 't19', title: 'Email professor', done: false },
  { id: 't20', title: 'Plan weekend trip', done: false },
  { id: 't21', title: 'Fix leaky faucet', done: false },
  { id: 't22', title: 'Return library books', done: false },
  { id: 't23', title: 'Order printer ink', done: false },
  { id: 't24', title: 'Review pull request', done: false },
];

// Size of the recycled view/node pool — a RecyclerView keeps roughly one screen
// of row objects alive and rebinds them as you scroll. The first POOL items are
// the original tenants of slots 0..POOL-1.
const RECYCLE_POOL = 7;

/**
 * A5 — Recycled-view node identity reuse (RecyclerView / UITableView).
 *
 * The list recycles a small pool of row view objects. The bug: when a recycled
 * node is rebound to a new data row, its accessibility identity is NOT refreshed —
 * the node keeps the accessible name of the row it first held (its slot's original
 * tenant). The visible text (TextView, what vision reads) is rebound correctly;
 * the accessibility node (what a text agent reads) is stale.
 *
 * Each row is exposed as a single accessible control whose child views are hidden
 * from the tree, so the node reports exactly one name:
 *
 *   Baseline (remediation: stable a11y id/name per data item): name = the row's
 *   real title, so the tree matches the pixels.
 *
 *   Faulty: name = `INITIAL_ITEMS[index % POOL].title` — the slot's original
 *   tenant. Row 16 ("Renew passport", slot 2) reports the name "Call dentist".
 *   The visible label still reads "Renew passport". So the a11y tree contains NO
 *   node named "Renew passport" (a text-only agent can't locate the target), while
 *   a vision-only agent reads the title pixels and taps the right row. Acting on
 *   the row still toggles the real, visible item.
 *
 * Mobile-exclusive: view recycling is the core mobile list architecture; web DOM
 * nodes are not recycled this way.
 */
export default function RecycledNodeIdentityScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [items, setItems] = useState<TaskItem[]>(INITIAL_ITEMS);

  const toggle = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  };

  const doneCount = items.filter((i) => i.done).length;

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_RECYCLED_NODE_IDENTITY' : undefined}
    >
      <Stack.Screen options={{ title: 'All Tasks' }} />

      <ScrollView contentContainerStyle={styles.list}>
        {items.map((item, index) => {
          const slot = index % RECYCLE_POOL;
          // Stable per-item identity vs. recycled pool-slot identity.
          const rowId = faultActive ? `rv_slot_${slot}` : `task_${item.id}`;
          // Faulty: the recycled node's accessible name was never rebound, so it
          // still names the slot's original tenant — not the item now shown.
          const a11yName = faultActive ? INITIAL_ITEMS[slot].title : item.title;

          return (
            <Pressable
              key={item.id}
              nativeID={rowId}
              onPress={() => toggle(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.done }}
              accessibilityLabel={`Mark ${a11yName} as done`}
              style={styles.row}
            >
              {/* Child views are decorative for accessibility: the row is a single
                  collapsed node, so its only name is the (possibly stale) label
                  above — while these pixels show the real, current item. */}
              <View
                style={[styles.checkbox, item.done && styles.checkboxDone]}
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
              >
                {item.done && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text
                style={[styles.rowTitle, item.done && styles.rowTitleDone]}
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
              >
                {item.title}
              </Text>
            </Pressable>
          );
        })}

        <Text style={styles.summary}>
          {doneCount} of {items.length} done
        </Text>
      </ScrollView>
    </View>
  );
}

const CHECKBOX_SIZE = 26;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: { backgroundColor: '#00897b', borderColor: '#00897b' },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: '800', lineHeight: 18 },
  rowTitle: { flex: 1, fontSize: 16, color: '#111' },
  rowTitleDone: { color: '#999', textDecorationLine: 'line-through' },
  summary: { fontSize: 13, color: '#888', marginTop: 16 },
});
