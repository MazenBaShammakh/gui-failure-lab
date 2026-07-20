import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Colorway {
  id: string;
  name: string; // carried in the a11y tree as the accessible name
  swatch: string; // the ONLY visible differentiator — no text on the chip
}

// A product offered in several colorways. The swatches are bare color chips:
// nothing but the fill colour tells them apart on screen. The colour name lives
// in each chip's accessibilityLabel (as real shopping apps do for screen
// readers), so the textual channel can still identify "Green".
const COLORWAYS: Colorway[] = [
  { id: 'red', name: 'Red', swatch: '#d32f2f' },
  { id: 'green', name: 'Green', swatch: '#2e9e44' },
  { id: 'blue', name: 'Blue', swatch: '#1565c0' },
  { id: 'amber', name: 'Amber', swatch: '#f59e0b' },
  { id: 'violet', name: 'Violet', swatch: '#7e3ff2' },
];

const TARGET_ID = 'green';

/**
 * B7 — System color transforms defeat color-based grounding (Identifiability).
 *
 * Mechanism: an OS-wide colour filter (grayscale "bedtime"/digital-wellbeing
 * mode, here simulated with a CSS `grayscale(1)` filter over the whole screen)
 * recolours every rendered pixel. The task differentiates the target ONLY by
 * colour — "select the Green colourway" — and the swatches carry no on-chip
 * text. Under grayscale every chip renders as the same grey, so a vision-only
 * agent can no longer match the colour cue. The accessibility tree is untouched:
 * each chip's accessibilityLabel still reads "Red", "Green", … and its
 * accessibilityState carries `selected`, so a text-only agent grounds on the
 * label and taps the right chip.
 *
 *   Fails: vision-only (the colour cue is destroyed by the global filter).
 *   Succeeds: text-only (colour name + state carried structurally in the tree).
 *
 * Mobile-exclusive: grayscale / Night Light / colour-inversion / colour-blind
 * correction are system-level display filters applied globally by the mobile OS;
 * nothing equivalent recolours a desktop browser viewport. There is no app-side
 * remediation for the OS filter — the study point is that colour-only grounding
 * is brittle while the textual channel carries identity robustly.
 */
export default function ColorFilterGroundingScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const selected = COLORWAYS.find((c) => c.id === selectedId) ?? null;

  return (
    <ScrollView
      style={styles.container}
      // FAULTY: the global colour filter is enabled. It recolours the pixels of
      // the whole screen (what a vision agent screenshots) but does not touch the
      // accessibility tree. BASELINE: no filter, colours render normally.
      contentContainerStyle={[styles.content, faultActive && styles.grayscale]}
      testID={faultActive ? 'defect:M_COLOR_FILTER_GROUNDING' : undefined}
    >
      <Stack.Screen options={{ title: 'Choose Colour' }} />

      <Text style={styles.emoji}>👟</Text>
      <Text style={styles.title}>Aurora Runner</Text>
      <Text style={styles.price}>$149</Text>

      <Text style={styles.sectionLabel}>Colour</Text>

      <View style={styles.swatchRow}>
        {COLORWAYS.map((c) => {
          const isSelected = selectedId === c.id;
          return (
            <Pressable
              key={c.id}
              style={styles.swatchHit}
              onPress={() => {
                setSelectedId(c.id);
                setAdded(false);
              }}
              accessibilityRole="button"
              // The colour name is the accessible name — the textual channel that
              // survives the OS colour filter.
              accessibilityLabel={c.name}
              accessibilityState={{ selected: isSelected }}
            >
              <View
                style={[
                  styles.swatchRing,
                  isSelected && styles.swatchRingSelected,
                ]}
              >
                <View style={[styles.swatch, { backgroundColor: c.swatch }]} />
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.addBtn, !selected && styles.addBtnDisabled]}
        disabled={!selected}
        onPress={() => selected && setAdded(true)}
        accessibilityRole="button"
        accessibilityLabel="Add to bag"
      >
        <Text style={styles.addBtnText}>Add to bag</Text>
      </Pressable>

      {selected && (
        <Text style={styles.selectedNote} accessibilityLiveRegion="polite">
          Selected colour: {selected.name}
        </Text>
      )}

      {added && selected && (
        <Text
          style={[
            styles.addedNote,
            selected.id === TARGET_ID ? styles.addedOk : styles.addedWrong,
          ]}
          accessibilityLiveRegion="polite"
        >
          ✓ Added {selected.name} to your bag
        </Text>
      )}
    </ScrollView>
  );
}

const SWATCH_SIZE = 44;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingBottom: 48, alignItems: 'center' },
  // The OS-wide colour transform: drains all hue from the rendered pixels.
  grayscale: { filter: 'grayscale(1)' },

  emoji: { fontSize: 64, marginTop: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#111', marginTop: 8 },
  price: { fontSize: 18, color: '#444', marginTop: 4 },

  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 32,
    marginBottom: 12,
  },

  swatchRow: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: 14,
    flexWrap: 'wrap',
  },
  swatchHit: { padding: 2 },
  swatchRing: {
    width: SWATCH_SIZE + 8,
    height: SWATCH_SIZE + 8,
    borderRadius: (SWATCH_SIZE + 8) / 2,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Selection ring is a neutral dark border, so the selected-state feedback
  // survives the grayscale filter (it is feedback, not the grounding cue).
  swatchRingSelected: { borderColor: '#111' },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
  },

  addBtn: {
    marginTop: 40,
    alignSelf: 'stretch',
    backgroundColor: '#111',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addBtnDisabled: { backgroundColor: '#ccc' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  selectedNote: { marginTop: 20, fontSize: 15, color: '#555' },
  addedNote: { marginTop: 8, fontSize: 15, fontWeight: '700' },
  addedOk: { color: '#2e9e44' },
  addedWrong: { color: '#d32f2f' },
});
