import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface FlaggedItem {
  id: string;
  title: string;
  /** Colour name — carried in the a11y tree, never painted as text. */
  priority: string;
  /** Normal rendering. */
  swatch: string;
  /** The same swatch after a deuteranopia correction filter (see note below). */
  swatchCorrected: string;
}

// Red and green converge on ONE value under the transform; blue and amber survive
// nearly intact. That partial survival is the trap: colour still appears to be
// carrying information, so there is no cue that the channel has degraded.
const FLAGGED: FlaggedItem[] = [
  { id: 'f1', title: 'Book flights to Berlin', priority: 'Red', swatch: '#d32f2f', swatchCorrected: '#9a8b3d' },
  { id: 'f2', title: 'Water the plants', priority: 'Green', swatch: '#2e9e44', swatchCorrected: '#9a8b3d' },
  { id: 'f3', title: 'Pay electricity bill', priority: 'Blue', swatch: '#1565c0', swatchCorrected: '#1f6ab8' },
  { id: 'f4', title: 'Order printer ink', priority: 'Amber', swatch: '#f59e0b', swatchCorrected: '#d9b23c' },
];

const TARGET_ID = 'f1';

/**
 * X07 · M_DEUTERANOPIA_PRIORITY_FLAGS — F-IDT-05 OS-Level Color Transform Defeats
 * Color Grounding. Third observation of the type; hosted on the Checklist
 * (M_DECOY_OVERLAY_CHECKBOX).
 *
 * Mechanism — a PARTIAL collapse along one axis, distinct from the other two:
 *   · M_COLOR_FILTER_GROUNDING (B7, /shop/color): grayscale flattens EVERY colour.
 *     The vision channel is uniformly dead and the agent can tell it is stuck.
 *   · X06 (/calendar/new): inversion remaps every colour to a different one, so
 *     the agent is confidently wrong.
 *   · X07 (here): a colour-blind correction filter collapses only the red–green
 *     axis. Blue and amber still read correctly, so colour LOOKS like it is
 *     working; only the one distinction the task depends on is gone. The agent
 *     has positive evidence that the channel is healthy while it is not.
 *
 *   Baseline: red and green flags are plainly different.
 *   Faulty:   both render #9a8b3d — pixel-identical — while blue/amber survive.
 *
 *   Fails:    vision-only (red vs green is a coin flip).
 *   Succeeds: text-only (each row's accessibilityLabel names its priority colour).
 *
 * IMPLEMENTATION NOTE: this renders the POST-TRANSFORM colour values directly
 * rather than applying a CSS `filter` chain. A real deuteranopia correction is an
 * LMS matrix; CSS can only approximate it with saturate()/hue-rotate(), and the
 * exact rendered output of such a chain cannot be predicted without eyeballing it.
 * Substituting the transformed values makes the fixture deterministic — the
 * collapse is guaranteed rather than hoped for. The agent-facing symptom is
 * identical, and the a11y tree is untouched either way.
 *
 * FIDELITY NOTE: as with X06, a real OS transform is display-wide; scoping it here
 * keeps the host's task intact. /shop/color remains the screen-wide reference.
 *
 * Isolation: a "Flagged today" block above the host's checklist, with its own
 * items. The host's defect is a transparent decoy over the "Call dentist"
 * checkbox — a different row, in a different list, that this task never touches.
 */
export default function DeuteranopiaPriorityFlagsFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [opened, setOpened] = useState<FlaggedItem | null>(null);

  return (
    <View style={styles.wrap} testID={faultActive ? 'defect:M_DEUTERANOPIA_PRIORITY_FLAGS' : undefined}>
      <Text style={styles.heading}>Flagged today</Text>

      <View style={styles.row}>
        {FLAGGED.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setOpened(item)}
            style={styles.flagBtn}
            accessibilityRole="button"
            // Untouched by the transform: identity survives structurally.
            accessibilityLabel={`${item.title}, ${item.priority} priority`}
          >
            <View
              style={[
                styles.flag,
                { backgroundColor: faultActive ? item.swatchCorrected : item.swatch },
              ]}
            />
          </Pressable>
        ))}
      </View>

      {opened && (
        <Text
          style={[styles.opened, opened.id !== TARGET_ID && styles.openedWrong]}
          accessibilityLiveRegion="polite"
        >
          Opened: {opened.title}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, gap: 8 },
  heading: { fontSize: 13, fontWeight: '700', color: '#888', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 14 },
  flagBtn: { padding: 2 },
  flag: { width: 34, height: 34, borderRadius: 8 },
  opened: { fontSize: 13, color: '#2e7d32', fontWeight: '700' },
  openedWrong: { color: '#555' },
});
