import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const LIBRARY = ['🏔️', '🌅', '🐕', '🍕', '🎂', '🌊', '🚲', '🌻', '🏙️', '🍦', '🌷', '🎣'];

/**
 * X12 · M_SYSTEM_PHOTO_PICKER_COMPOSE — F-PRC-04 System Dialog Outside App-Scoped
 * A11y Tree. Third observation of the type; hosted on Create Post
 * (M_REQUIRED_FIELD_NO_INDICATOR).
 *
 * Mechanism — a FULL-SCREEN system surface, which changes the consequence rather
 * than just the trigger:
 *   · A3 (/maps/locate): a centred permission dialog blocks progress; the agent
 *     knows it is stuck but not why.
 *   · X11 (/shop/gallery): a bottom sheet holds the task target; the agent does
 *     not realise it is stuck at all.
 *   · X12 (here): the picker covers the ENTIRE viewport while being absent from
 *     the tree. The compose form underneath remains fully present and correctly
 *     named, so a text-only agent keeps operating it — typing into the body,
 *     pressing Publish — and every one of those actions is aimed at a control
 *     that is now underneath an opaque, input-capturing surface.
 *
 * So the failure is not a stall or a wrong target: it is a sequence of actions
 * dispatched into a covered screen, none of which land. The tree says the form is
 * right there and responsive; the pixels say the app is not on screen at all. It
 * is the widest divergence between the two channels of the three observations.
 *
 *   Baseline: the picker is a modal in the tree; each thumbnail is a named button
 *             and the background is correctly marked non-modal.
 *   Faulty:   drawn full-bleed, withdrawn from the tree, background left exposed.
 *
 *   Fails:    text-only.
 *   Succeeds: vision-only (the grid is drawn and tappable).
 *
 * Isolation: GATED. The picker is not mounted until "Attach a photo" is pressed,
 * so the host's task (publishing a post, which needs the body field and the
 * audience control) never raises it.
 */
export default function SystemPhotoPickerComposeFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [pickerOpen, setPickerOpen] = useState(false);
  const [attached, setAttached] = useState<string | null>(null);

  return (
    <View
      style={styles.wrap}
      testID={faultActive && pickerOpen ? 'defect:M_SYSTEM_PHOTO_PICKER_COMPOSE' : undefined}
    >
      <Pressable
        style={styles.attachBtn}
        onPress={() => setPickerOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Attach a photo"
      >
        <Text style={styles.attachText}>📎 Attach a photo</Text>
      </Pressable>

      {attached && (
        <View style={styles.attachedRow} accessibilityLiveRegion="polite">
          <Text style={styles.attachedThumb}>{attached}</Text>
          <Text style={styles.attachedNote}>Photo attached</Text>
        </View>
      )}

      {pickerOpen && (
        <View
          style={StyleSheet.absoluteFill}
          accessible={faultActive ? false : undefined}
          accessibilityViewIsModal={!faultActive}
          accessibilityElementsHidden={faultActive}
          importantForAccessibility={faultActive ? 'no-hide-descendants' : 'auto'}
        >
          {/* Full-bleed and opaque: on a real device this is a separate system
              window that entirely covers the app. */}
          <View style={styles.picker}>
            <View style={styles.pickerBar}>
              <Pressable
                onPress={() => setPickerOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel photo selection"
              >
                <Text style={styles.pickerCancel}>Cancel</Text>
              </Pressable>
              <Text style={styles.pickerTitle}>Recents</Text>
              <View style={styles.pickerBarSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.grid}>
              {LIBRARY.map((emoji, i) => (
                <Pressable
                  key={`${emoji}-${i}`}
                  style={styles.cell}
                  onPress={() => {
                    setAttached(emoji);
                    setPickerOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Photo ${i + 1}`}
                >
                  <Text style={styles.cellEmoji}>{emoji}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 6, marginBottom: 10 },
  attachBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#eceff1',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  attachText: { fontSize: 13, color: '#37474f', fontWeight: '700' },
  attachedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  attachedThumb: { fontSize: 26 },
  attachedNote: { fontSize: 13, color: '#2e7d32', fontWeight: '700' },

  picker: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff' },
  pickerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  pickerCancel: { fontSize: 15, color: '#0a84ff', width: 70 },
  pickerTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  pickerBarSpacer: { width: 70 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 6 },
  cell: {
    width: '25%',
    aspectRatio: 1,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellEmoji: { fontSize: 34 },
});
