import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
  /** How many messages the current segment holds. */
  count: number;
  selected: boolean;
  onToggle: (next: boolean) => void;
}

/**
 * X13 · M_INACCESSIBLE_SELECT_ALL — F-PRC-05 Inaccessible Element from DOM/A11y
 * Tree (Unspecified Mechanism). Third observation of the type; hosted on
 * Categories (M_DEAD_SEGMENT).
 *
 * Mechanism — a STANDARD, fully-semantic control opted out with a single
 * `accessible={false}`. The three observations differ in why semantics are
 * missing:
 *   · M_CUSTOM_SLIDER_MISSING_A11Y_SEMANTICS (/shop): semantics were NEVER ADDED.
 *     A hand-rolled pan responder has no role, name or value because nobody gave
 *     it any — the omission is a consequence of building a custom widget.
 *   · X14 (/dashboard/overview): semantics are SWALLOWED. The segments are fine
 *     in themselves; their container publishes as one graphic and takes them down
 *     with it.
 *   · X13 (here): semantics are DELIBERATELY SUPPRESSED on a control that has
 *     them all. It is an ordinary checkbox with role, label and checked state —
 *     conventional in every respect — and one prop removes it from the tree.
 *
 * NOTE the API matters for attribution: this uses bare `accessible={false}`, NOT
 * `importantForAccessibility` / `accessibilityElementsHidden`. Those flags are the
 * defining mechanism of F-PRC-03 and are used by X10; reusing them here would make
 * the two types indistinguishable in a run record.
 *
 *   Baseline: a normal checkbox — role=checkbox, "Select all messages", state.
 *   Faulty:   pixel-identical and fully functional, absent from the tree.
 *
 *   Fails:    text-only (no node exists to target).
 *   Succeeds: vision-only (an obvious, correctly-sized checkbox).
 *
 * Isolation: the list header. The host's defect is the inert segment bar above
 * it; this task stays on Primary and never switches segment.
 */
export default function InaccessibleSelectAllFragment({
  faultActive: faultActiveProp,
  count,
  selected,
  onToggle,
}: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  return (
    <View style={styles.bar} testID={faultActive ? 'defect:M_INACCESSIBLE_SELECT_ALL' : undefined}>
      <Pressable
        style={styles.control}
        onPress={() => onToggle(!selected)}
        // The entire injection. Everything else about this control is textbook.
        accessible={!faultActive}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel="Select all messages"
      >
        <View style={[styles.box, selected && styles.boxOn]}>
          {selected && <Text style={styles.check}>✓</Text>}
        </View>
        <Text style={styles.label}>Select all</Text>
      </Pressable>

      <Text style={styles.count}>
        {selected ? `${count} selected` : `${count} messages`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  control: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9aa0a6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxOn: { backgroundColor: '#1565c0', borderColor: '#1565c0' },
  check: { color: '#fff', fontSize: 13, fontWeight: '900', marginTop: -1 },
  label: { fontSize: 14, color: '#333', fontWeight: '600' },
  count: { fontSize: 12, color: '#999', fontWeight: '600' },
});
