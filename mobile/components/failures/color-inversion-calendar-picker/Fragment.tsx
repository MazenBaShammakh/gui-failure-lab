import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface CalendarChoice {
  id: string;
  /** Carried in the a11y tree as the accessible name — survives the filter. */
  name: string;
  /** The ONLY visible differentiator: no text is painted on the chip. */
  swatch: string;
  /** What that swatch becomes under invert(1) — documentation, not code. */
  invertsTo: string;
}

// Swatches are chosen so the inversion is ACTIVELY MISLEADING rather than merely
// destructive: "Magenta" inverts to a convincing green, so the chip that looks
// green under the filter is the wrong one. Green itself inverts to pink.
const CALENDARS: CalendarChoice[] = [
  { id: 'personal', name: 'Green', swatch: '#2e9e44', invertsTo: 'pink #d161bb' },
  { id: 'work', name: 'Blue', swatch: '#1565c0', invertsTo: 'orange #ea9a3f' },
  { id: 'family', name: 'Red', swatch: '#d32f2f', invertsTo: 'cyan #2cd0d0' },
  { id: 'promo', name: 'Magenta', swatch: '#cc44bb', invertsTo: 'GREEN #33bb44' },
  { id: 'travel', name: 'Amber', swatch: '#f59e0b', invertsTo: 'blue #0a61f4' },
];

const TARGET_ID = 'personal';

/**
 * X06 · M_COLOR_INVERSION_CALENDAR_PICKER — F-IDT-05 OS-Level Color Transform
 * Defeats Color Grounding. Second observation of the type; hosted on New event
 * (M_INPUT_SILENT_TRUNCATE).
 *
 * Mechanism — COLOUR INVERSION rather than grayscale, which changes the failure
 * from ambiguous to confidently wrong. Under M_COLOR_FILTER_GROUNDING (B7,
 * /shop/color) every swatch collapses to the same grey: the vision channel loses
 * the cue and an agent has no basis to choose, so the failure is legible as
 * "cannot tell". Inversion instead maps every colour onto a DIFFERENT, equally
 * plausible colour. Here "Magenta" inverts to a convincing green while the real
 * green inverts to pink, so a vision-only agent asked for the green calendar
 * confidently selects the wrong one and reports success.
 *
 *   Baseline: no filter; the green chip is green.
 *   Faulty:   invert(1) over the chip row; the chip that reads as green is Magenta.
 *
 *   Fails:    vision-only (picks Magenta, with no signal anything went wrong).
 *   Succeeds: text-only (each chip's accessibilityLabel still names its colour and
 *             accessibilityState carries `selected`).
 *
 * FIDELITY NOTE: a real OS colour transform is display-wide. /shop/color models
 * that faithfully by filtering the whole screen. A fragment cannot — a screen-wide
 * filter would recolour the host and corrupt its task — so the filter is scoped to
 * this container, which technically reads as an app-side effect. The symptom
 * presented to the agent is identical; /shop/color remains the screen-wide
 * reference implementation. See plans/derive-extra-defect-observations.md §8.4.
 *
 * Isolation: sits between the host's "When" field and its Save button. The host's
 * defect silently truncates the Title input; this task never types a title.
 */
export default function ColorInversionCalendarPickerFragment({
  faultActive: faultActiveProp,
}: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = CALENDARS.find((c) => c.id === selectedId) ?? null;

  return (
    <View testID={faultActive ? 'defect:M_COLOR_INVERSION_CALENDAR_PICKER' : undefined}>
      <Text style={styles.label}>Calendar</Text>

      <View style={[styles.chipRow, faultActive && styles.inverted]}>
        {CALENDARS.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setSelectedId(c.id)}
            accessibilityRole="radio"
            // Untouched by the filter: the textual channel keeps full identity.
            accessibilityLabel={`${c.name} calendar`}
            accessibilityState={{ selected: selectedId === c.id }}
            style={[styles.chip, { backgroundColor: c.swatch }, selectedId === c.id && styles.chipSelected]}
          />
        ))}
      </View>

      {selected && (
        // Deliberately OUTSIDE the filtered container: the confirmation is
        // feedback, not the grounding cue, so it must not be recoloured.
        <Text
          style={[styles.confirm, selected.id !== TARGET_ID && styles.confirmWrong]}
          accessibilityLiveRegion="polite"
        >
          Event will be added to the {selected.name} calendar
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, marginTop: 12 },
  chipRow: { flexDirection: 'row', gap: 12, paddingVertical: 4 },
  // The whole injection.
  inverted: { filter: 'invert(1)' },
  chip: { width: 38, height: 38, borderRadius: 19 },
  chipSelected: { borderWidth: 3, borderColor: '#111' },
  confirm: { fontSize: 13, color: '#2e7d32', fontWeight: '700', marginTop: 10 },
  confirmWrong: { color: '#555' },
});
