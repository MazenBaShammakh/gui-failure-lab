import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Theme {
  id: string;
  label: string;
  /** Card background — identical in both modes. */
  paper: string;
  ink: string;
}

const THEMES: Theme[] = [
  { id: 'light', label: 'Light', paper: '#ffffff', ink: '#111111' },
  { id: 'sepia', label: 'Sepia', paper: '#f4ecd8', ink: '#4a3f2f' },
  { id: 'dark', label: 'Dark', paper: '#1e1e1e', ink: '#eeeeee' },
];

const SELECTED_ID = 'sepia';

/**
 * X15 · M_LOW_CONTRAST_SELECTED_STATE — F-PRC-06 Low Color Contrast. Third
 * observation of the type; hosted on Preferences (M_TOGGLE_POINTEREVENTS_NONE).
 *
 * Mechanism — the contrast failure is on a STATE INDICATOR, not on a control.
 * M_LOW_CONTRAST_CTA (P01, /shop/deal) and M_LOW_CONTRAST_CONTROLS (B11,
 * /banking/quickactions) both under-contrast a thing to be ACTED ON: the agent
 * cannot find the button, so it cannot act, and the failure surfaces as a missing
 * affordance. Here every control is perfectly legible and perfectly operable —
 * what falls below threshold is the 2px ring that says which option is CURRENTLY
 * CHOSEN (#cfd4da on #c9ced6, ~1.2:1).
 *
 * The task is a read-out, so the failure is a WRONG ANSWER rather than a blocked
 * action: three equally-selected-looking cards, and the agent reports whichever it
 * guesses (most likely the first). Nothing about the screen looks broken, and the
 * agent has no reason to flag uncertainty.
 *
 *   Baseline: the selected card carries a solid #1565c0 ring plus a ✓ badge.
 *   Faulty:   the ring drops to #cfd4da against #c9ced6 and the badge is removed.
 *
 *   Fails:    vision-only (cannot tell which card is ringed).
 *   Succeeds: text-only (accessibilityState.selected is untouched — the state is
 *             carried structurally even though it is not carried visually).
 *
 * Isolation: its own APPEARANCE PREVIEW section. The host's defect is the Dark
 * Mode toggle in the card above (pointerEvents:'none'); this task changes nothing.
 */
export default function LowContrastSelectedStateFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [selectedId, setSelectedId] = useState<string>(SELECTED_ID);

  return (
    <View testID={faultActive ? 'defect:M_LOW_CONTRAST_SELECTED_STATE' : undefined}>
      <Text style={styles.sectionLabel}>READING THEME</Text>

      <View style={styles.row}>
        {THEMES.map((t) => {
          const isSelected = selectedId === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setSelectedId(t.id)}
              accessibilityRole="radio"
              accessibilityLabel={`${t.label} theme`}
              // Structural state survives; only its rendering is degraded.
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.card,
                isSelected && (faultActive ? styles.cardSelectedFaulty : styles.cardSelected),
              ]}
            >
              <View style={[styles.preview, { backgroundColor: t.paper }]}>
                <View style={[styles.previewLine, { backgroundColor: t.ink }]} />
                <View style={[styles.previewLine, styles.previewLineShort, { backgroundColor: t.ink }]} />
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardLabel}>{t.label}</Text>
                {/* Baseline only: a second, non-colour channel for the state. */}
                {isSelected && !faultActive && <Text style={styles.check}>✓</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
    marginTop: 26,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 2,
    // Unselected border == the faulty selected border's background context.
    borderColor: '#c9ced6',
    backgroundColor: '#c9ced6',
    padding: 6,
    gap: 6,
  },
  // Baseline: unmistakable.
  cardSelected: { borderColor: '#1565c0' },
  // Faulty: ~1.2:1 against the card background — present, but not perceivable.
  cardSelectedFaulty: { borderColor: '#cfd4da' },
  preview: { height: 54, borderRadius: 6, padding: 7, gap: 5, justifyContent: 'center' },
  previewLine: { height: 4, borderRadius: 2, opacity: 0.75 },
  previewLineShort: { width: '60%' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  cardLabel: { fontSize: 12, fontWeight: '700', color: '#37474f' },
  check: { fontSize: 12, fontWeight: '900', color: '#1565c0' },
});
