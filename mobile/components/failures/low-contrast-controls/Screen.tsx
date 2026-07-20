import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Action {
  id: string;
  label: string;
  sublabel: string;
}

// A grid of large quick-action tiles. Disambiguating the target depends entirely
// on reading the tile's label — there are no icons or colour cues to fall back on.
const ACTIONS: Action[] = [
  { id: 'transfer', label: 'Transfer', sublabel: 'Move money between accounts' },
  { id: 'paybills', label: 'Pay Bills', sublabel: 'Utilities, rent & more' },
  { id: 'deposit', label: 'Deposit Cheque', sublabel: 'Snap a photo to deposit' },
  { id: 'statements', label: 'Statements', sublabel: 'View & download PDFs' },
  { id: 'cards', label: 'Manage Cards', sublabel: 'Freeze, limits & PINs' },
  { id: 'support', label: 'Support', sublabel: 'Chat with an agent' },
];

/**
 * B11 — App-authored low colour contrast on large controls (Perceptibility).
 *
 * The screen presents six large, generously-sized tappable tiles. Each tile is
 * fully present in the accessibility tree — role "button", complete label, and
 * on-screen bounds. The ONLY thing that changes between modes is colour:
 *
 *   Baseline: tinted fill + visible border + dark label (well above WCAG 3:1 for
 *   large UI components and text), so a vision agent segments each tile and reads
 *   its label.
 *
 *   Faulty: the tile fill sits at ~1.05:1 against the white page and the label at
 *   ~1.06:1 against the fill — both far below threshold. The tiles are still huge
 *   and pressable, but a vision-only agent cannot detect a tile's boundary or read
 *   its label, so it can neither locate nor disambiguate "Pay Bills". A text-only
 *   agent reads the label/role/bounds from the tree and taps the right tile.
 *
 *   Fails: vision-only (controls sub-perceptible).
 *   Succeeds: text-only (label/role/bounds intact in the tree).
 *
 * Caveat (same as B4): the low-contrast mechanism is NOT mobile-exclusive — it
 * reproduces identically on desktop web. Mobile only AMPLIFIES it (auto-brightness,
 * outdoor sunlight, power-saver dimming lower effective on-screen contrast further).
 * Do not file this under any native-only claim. Remediation is app-side: meet WCAG
 * contrast (4.5:1 body text, 3:1 large text and UI components).
 */
export default function LowContrastControlsScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [openedId, setOpenedId] = useState<string | null>(null);
  const opened = ACTIONS.find((a) => a.id === openedId) ?? null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_LOW_CONTRAST_CONTROLS' : undefined}
    >
      <Stack.Screen options={{ title: 'Quick Actions' }} />

      <Text style={styles.heading}>Quick actions</Text>
      <Text style={styles.subheading}>Tap an action to get started</Text>

      <View style={styles.grid}>
        {ACTIONS.map((action) => (
          <Pressable
            key={action.id}
            // The tile is identically wired and sized in both modes; only the
            // colours differ. The label/role/bounds are always in the a11y tree.
            style={({ pressed }) => [
              styles.tile,
              faultActive ? styles.tileFaulty : styles.tileBaseline,
              pressed && styles.tilePressed,
            ]}
            onPress={() => setOpenedId(action.id)}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Text
              style={[
                styles.tileLabel,
                faultActive ? styles.tileLabelFaulty : styles.tileLabelBaseline,
              ]}
            >
              {action.label}
            </Text>
            <Text
              style={[
                styles.tileSub,
                faultActive ? styles.tileSubFaulty : styles.tileSubBaseline,
              ]}
            >
              {action.sublabel}
            </Text>
          </Pressable>
        ))}
      </View>

      {opened && (
        <Text style={styles.openedNote} accessibilityLiveRegion="polite">
          Opened: {opened.label}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', color: '#111' },
  subheading: { fontSize: 14, color: '#888', marginTop: 2, marginBottom: 20 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  tile: {
    width: '48%',
    minHeight: 116,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: 'center',
  },
  // Baseline: tinted fill, clear border, dark label — well above WCAG 3:1.
  tileBaseline: {
    backgroundColor: '#e0f2f1',
    borderWidth: 1.5,
    borderColor: '#4db6ac',
  },
  // Faulty: fill ~1.05:1 vs the white page, border barely off-white — the tile
  // boundary is sub-perceptible despite the large hit area.
  tileFaulty: {
    backgroundColor: '#f6f6f6',
    borderWidth: 1.5,
    borderColor: '#f2f2f2',
  },
  tilePressed: { opacity: 0.85 },

  tileLabel: { fontSize: 18, fontWeight: '700' },
  tileLabelBaseline: { color: '#004d40' },
  // Label ~1.06:1 against the faulty fill — present in the tree, unreadable on screen.
  tileLabelFaulty: { color: '#ededed' },

  tileSub: { fontSize: 13, marginTop: 6 },
  tileSubBaseline: { color: '#00695c' },
  tileSubFaulty: { color: '#f1f1f1' },

  openedNote: { fontSize: 15, color: '#00838f', fontWeight: '700', marginTop: 24 },
});
