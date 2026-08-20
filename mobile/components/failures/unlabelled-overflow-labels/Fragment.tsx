import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

/**
 * X18 · M_UNLABELLED_OVERFLOW_LABELS — F-NAV-01 Important Links Hidden in Subtle
 * Menu. Second observation of the type; hosted on Labels
 * (M_LABEL_VISUAL_MISMATCH).
 *
 * Mechanism — SHALLOW but semantically empty, the inverse of the existing
 * observation. M_HIDDEN_NAV_SUBTLE_MENU (F5.1, /banking/support) buries "Report
 * fraud" two levels down, but every step on the way is descriptively named
 * ("Account issues" -> "Report fraud"): an agent that decides to explore can read
 * the labels and predict where the action lives. Here the action is exactly ONE
 * tap away, and that tap is the problem — the entry point is a hairline "⋯" glyph
 * with no visible text and only a generic accessible name ("More"). Neither
 * channel carries any evidence that label management is behind it.
 *
 * Depth is therefore not what makes an important link undiscoverable; predictive
 * labelling is. An agent cannot plan toward an affordance that announces nothing,
 * and exhaustively opening every unlabelled glyph is not a strategy that scales.
 *
 *   Baseline: a full-width "＋ New label" button sits directly in the section
 *             header — named, weighted, and impossible to miss in either channel.
 *   Faulty:   that button is replaced by a low-contrast ⋯ opening a small menu
 *             whose first item is the real action.
 *
 *   Fails:    vision-only AND text-only (the affordance is uninformative in both).
 *
 * Isolation: the section header above the message list. The host's defect is on
 * the per-row archive control (its accessibilityLabel says "Delete" while the
 * visible affordance reads Archive); this task never touches a row.
 */
export default function UnlabelledOverflowLabelsFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [menuOpen, setMenuOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState('');
  const [labels, setLabels] = useState<string[]>(['Work', 'Personal', 'Travel']);

  const startCreating = () => {
    setCreating(true);
    setMenuOpen(false);
  };

  const commit = () => {
    const name = draft.trim();
    if (!name) return;
    setLabels((prev) => [...prev, name]);
    setDraft('');
    setCreating(false);
  };

  return (
    <View style={styles.wrap} testID={faultActive ? 'defect:M_UNLABELLED_OVERFLOW_LABELS' : undefined}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Labels</Text>

        {faultActive ? (
          <Pressable
            onPress={() => setMenuOpen((prev) => !prev)}
            style={styles.glyphBtn}
            accessibilityRole="button"
            accessibilityLabel="More"
          >
            <Text style={styles.glyph}>⋯</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={startCreating}
            style={styles.primaryBtn}
            accessibilityRole="button"
            accessibilityLabel="Create a new label"
          >
            <Text style={styles.primaryBtnText}>＋ New label</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.chips}>
        {labels.map((l) => (
          <View key={l} style={styles.chip}>
            <Text style={styles.chipText}>{l}</Text>
          </View>
        ))}
      </View>

      {menuOpen && (
        <View style={styles.menu}>
          <Pressable
            onPress={startCreating}
            accessibilityRole="button"
            accessibilityLabel="Create a new label"
            style={styles.menuItem}
          >
            <Text style={styles.menuItemText}>New label</Text>
          </Pressable>
          <Text style={styles.menuItemMuted}>Label settings</Text>
          <Text style={styles.menuItemMuted}>Manage subscriptions</Text>
        </View>
      )}

      {creating && (
        <View style={styles.creator}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Label name"
            placeholderTextColor="#9e9e9e"
            accessibilityLabel="New label name"
            onSubmitEditing={commit}
            autoFocus
          />
          <Pressable
            style={styles.saveBtn}
            onPress={commit}
            accessibilityRole="button"
            accessibilityLabel="Save label"
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e6e6ea',
    gap: 10,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontSize: 16, fontWeight: '800', color: '#111' },
  primaryBtn: {
    backgroundColor: '#1565c0',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  glyphBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  // Deliberately weightless: thin, pale, no container, no text.
  glyph: { fontSize: 18, color: '#b9bcc2', marginTop: -6 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#eef1f4', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 12, color: '#4a5058', fontWeight: '600' },

  menu: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 4, elevation: 3 },
  menuItem: { paddingHorizontal: 14, paddingVertical: 10 },
  menuItemText: { fontSize: 14, color: '#111', fontWeight: '600' },
  menuItemMuted: { fontSize: 14, color: '#b0b4ba', paddingHorizontal: 14, paddingVertical: 10 },

  creator: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: '#f6f6f8',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#dcdce0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    color: '#111',
  },
  saveBtn: { backgroundColor: '#1565c0', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
