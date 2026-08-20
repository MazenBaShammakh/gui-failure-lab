import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

type ActionId = 'add-to-album' | 'new-album' | 'import';

interface Action {
  id: ActionId;
  /** Baseline: a glyph that reads as the specific action. */
  baselineGlyph: string;
  /** Baseline: a name that says exactly what happens. */
  baselineLabel: string;
  result: string;
}

const ACTIONS: Action[] = [
  {
    id: 'add-to-album',
    baselineGlyph: '🖼',
    baselineLabel: 'Add selected photos to an album',
    result: 'Added 0 selected photos to an album.',
  },
  {
    id: 'new-album',
    baselineGlyph: '📁',
    baselineLabel: 'Create a new album',
    result: '✓ New album created',
  },
  {
    id: 'import',
    baselineGlyph: '⤓',
    baselineLabel: 'Import photos from device',
    result: 'Import started from device storage.',
  },
];

// Faulty: all three collapse onto one glyph and one name.
const OVERLOADED_GLYPH = '＋';
const OVERLOADED_LABEL = 'Add';

/**
 * X04 · M_REPEATED_GLYPH_PHOTO_ACTIONS — F-IDT-03 Overloaded Icon (Multiple
 * Purposes). Third observation of the type; hosted on the All Photos album
 * (M_MISSING_SORT_CONTROLS).
 *
 * Mechanism — one glyph and one name REPEATED across three sibling controls,
 * distinct from the other two observations:
 *   · M_OVERLOADED_ICON_SEARCH_COMPOSE (F2.3, /mail/toolbar): a single control
 *     whose behaviour depends on WHERE it is tapped.
 *   · X03 (/music/album): a single control whose behaviour depends on hidden
 *     STATE.
 *   · X04 (here): three genuinely different actions, each with its own handler,
 *     rendered as three identical "＋ / Add" buttons sitting side by side. The
 *     overload is across instances rather than within one control.
 *
 * Both channels see three indistinguishable nodes: identical pixels, identical
 * accessible name, differing only by position. Nothing states which one creates
 * an album, so selecting correctly is a 1-in-3 guess — and two of the three
 * wrong choices produce plausible-looking output ("Import started…"), so a wrong
 * pick does not obviously read as a failure.
 *
 *   Baseline: three distinct glyphs with three specific names.
 *   Faulty:   ＋ / "Add" three times over.
 *
 *   Fails:    vision-only AND text-only.
 *
 * Isolation: a header action row above the grid. The host's defect is the absent
 * sort control / scrambled grid order below it; this task never reads the grid,
 * and the host's task never uses the header.
 */
export default function RepeatedGlyphPhotoActionsFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [result, setResult] = useState<string | null>(null);

  return (
    <View
      style={styles.bar}
      testID={faultActive ? 'defect:M_REPEATED_GLYPH_PHOTO_ACTIONS' : undefined}
    >
      <View style={styles.actions}>
        {ACTIONS.map((action) => (
          <Pressable
            key={action.id}
            onPress={() => setResult(action.result)}
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel={faultActive ? OVERLOADED_LABEL : action.baselineLabel}
          >
            <Text style={styles.actionGlyph}>
              {faultActive ? OVERLOADED_GLYPH : action.baselineGlyph}
            </Text>
            {!faultActive && <Text style={styles.actionText}>{action.baselineLabel}</Text>}
          </Pressable>
        ))}
      </View>

      {result && (
        <Text style={styles.result} accessibilityLiveRegion="polite">
          {result}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
    gap: 8,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f2f4f2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionGlyph: { fontSize: 17, color: '#33691e' },
  actionText: { fontSize: 12, color: '#33691e', fontWeight: '700' },
  result: { fontSize: 13, color: '#33691e', fontWeight: '600' },
});
