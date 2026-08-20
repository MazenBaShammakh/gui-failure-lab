import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const SORT_CODE = '20-45-45';

/**
 * X02 · M_DISABLED_STYLED_SORTCODE — F-IDT-02 Actionable Element Styled as Static.
 * Third observation of the type; hosted on Add payee (M_TRANSIENT_CONFIRMATION).
 *
 * Mechanism — a FALSE NEGATIVE affordance, distinct from the other two:
 *   · M_ACTIONABLE_TEXT_STYLED_STATIC (F2.2, /music/lyrics): keeps
 *     accessibilityRole="button", only the paint is wrong. Vision fails, text OK.
 *   · X01 (/careers/job/acme): affordance simply ABSENT from both channels.
 *   · X02 (here): the control actively asserts it is NOT usable. It is painted in
 *     the muted "read-only field" treatment this form uses for locked values, and
 *     reports `accessibilityState={{ disabled: true }}` — yet onPress fires.
 *
 * An agent that correctly respects a disabled state is penalised for it, which is
 * why this is the sharpest variant: skipping the control is the *reasonable* read
 * of both channels, not a lapse.
 *
 *   Baseline: rendered as a real link (blue, chevron, role="button", not disabled).
 *   Faulty:   grey "locked value" treatment + disabled state; still pressable.
 *
 *   Fails:    vision-only AND text-only — both are told the value is inert.
 *
 * Isolation: a details block above the form. The host's own defect is the
 * disappearing confirmation toast after "Add payee"; this task never submits.
 */
export default function DisabledStyledSortcodeFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [open, setOpen] = useState(false);

  return (
    <View style={styles.card} testID={faultActive ? 'defect:M_DISABLED_STYLED_SORTCODE' : undefined}>
      <Text style={styles.cardTitle}>Bank details</Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Sort code</Text>
        <Pressable
          onPress={() => setOpen((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel={`Sort code ${SORT_CODE}`}
          accessibilityHint={faultActive ? undefined : 'Shows the branch details for this sort code'}
          // The injection: the node advertises itself as disabled while remaining
          // fully functional.
          accessibilityState={faultActive ? { disabled: true } : undefined}
        >
          <Text style={faultActive ? styles.valueLocked : styles.valueLink}>
            {SORT_CODE}
            {faultActive ? '' : '  ›'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>BIC</Text>
        <Text style={styles.valueLocked}>BARCGB22</Text>
      </View>

      {open && (
        <View style={styles.details} accessibilityLiveRegion="polite">
          <Text style={styles.detailsHeading}>Branch for {SORT_CODE}</Text>
          <Text style={styles.detailsLine}>Barclays · Piccadilly Circus</Text>
          <Text style={styles.detailsLine}>28 Regent Street, London W1B 5RU</Text>
          <Text style={styles.detailsLine}>Faster Payments supported</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { fontSize: 14, color: '#555' },
  valueLink: { fontSize: 15, color: '#1a73e8', fontWeight: '700' },
  // Identical to the BIC row below it — the treatment this form uses for values
  // you cannot act on.
  valueLocked: { fontSize: 15, color: '#9e9e9e', fontWeight: '600' },

  details: {
    marginTop: 4,
    backgroundColor: '#f4f7fb',
    borderRadius: 10,
    padding: 12,
    gap: 3,
  },
  detailsHeading: { fontSize: 13, fontWeight: '800', color: '#111' },
  detailsLine: { fontSize: 12, color: '#555' },
});
