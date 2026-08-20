import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface ShareTarget {
  id: string;
  label: string;
  glyph: string;
}

// Rendered by the OS on a real device, not by the app.
const TARGETS: ShareTarget[] = [
  { id: 'mail', label: 'Mail', glyph: '✉️' },
  { id: 'messages', label: 'Messages', glyph: '💬' },
  { id: 'notes', label: 'Notes', glyph: '📝' },
  { id: 'airdrop', label: 'AirDrop', glyph: '📡' },
  { id: 'copy', label: 'Copy link', glyph: '🔗' },
];

/**
 * X11 · M_SYSTEM_SHARE_SHEET_GALLERY — F-PRC-04 System Dialog Outside App-Scoped
 * A11y Tree. Second observation of the type; hosted on the Photo gallery
 * (M_DEAD_CAROUSEL_ARROWS).
 *
 * Mechanism — the system surface holds the TASK TARGET rather than blocking
 * progress, and it is raised BY the agent rather than appearing on its own.
 * M_SYSTEM_DIALOG_OUTSIDE_TREE (A3, /maps/locate) is a permission prompt: it
 * interposes itself, nothing else can proceed until it is answered, and a
 * text-only agent experiences an invisible wall. Here:
 *
 *   · the sheet only exists because the agent pressed Share (gating, §4 Rule B);
 *   · the thing it must choose ("Mail") lives inside that sheet;
 *   · `accessibilityViewIsModal` is FALSE in faulty mode, so the gallery behind
 *     it stays in the tree, unchanged and apparently healthy.
 *
 * A text-only agent therefore presses Share, re-reads the tree, finds it
 * identical, and concludes Share is another dead control on a screen that already
 * has one — a locally reasonable inference that is wrong. Repeated attempts stack
 * more invisible sheets. The diagnostic situation is the opposite of A3: there the
 * agent knows it is stuck and cannot see why; here it does not know it is stuck
 * at all.
 *
 *   Baseline: the sheet is a modal in the tree; each target is a named button.
 *   Faulty:   drawn but withdrawn, and non-modal, so the app reads as untouched.
 *
 *   Fails:    text-only.
 *   Succeeds: vision-only (the sheet is drawn; "Mail" is tappable).
 *
 * Isolation: GATED. In faulty mode the sheet subtree is not mounted until Share
 * is pressed, so the host's task ("view the next product photo", which uses the
 * carousel arrows below) never encounters it — the arming check in the plan's §7
 * must confirm the defect node is absent before the gate is opened.
 */
export default function SystemShareSheetGalleryFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sharedVia, setSharedVia] = useState<string | null>(null);

  return (
    <View
      style={styles.bar}
      // Only marks the defect once the gate is open — before that this fragment
      // is an ordinary, working Share button.
      testID={faultActive && sheetOpen ? 'defect:M_SYSTEM_SHARE_SHEET_GALLERY' : undefined}
    >
      <View style={styles.barRow}>
        {sharedVia ? (
          <Text style={styles.sharedNote} accessibilityLiveRegion="polite">
            ✓ Shared via {sharedVia}
          </Text>
        ) : (
          <View style={styles.spacer} />
        )}

        <Pressable
          style={styles.shareBtn}
          onPress={() => setSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Share this photo"
        >
          <Text style={styles.shareGlyph}>⇪</Text>
        </Pressable>
      </View>

      {sheetOpen && (
        <View
          style={StyleSheet.absoluteFill}
          // The system-surface recipe, as used by M_SYSTEM_DIALOG_OUTSIDE_TREE.
          accessible={faultActive ? false : undefined}
          accessibilityViewIsModal={!faultActive}
          accessibilityElementsHidden={faultActive}
          importantForAccessibility={faultActive ? 'no-hide-descendants' : 'auto'}
        >
          <Pressable
            style={styles.scrim}
            onPress={() => setSheetOpen(false)}
            accessibilityLabel="Dismiss share sheet"
            accessibilityRole="button"
          />
          <View style={styles.sheetWrap} pointerEvents="box-none">
            <View style={styles.sheet}>
              <View style={styles.grabber} />
              <Text style={styles.sheetTitle}>Share photo</Text>
              <View style={styles.targets}>
                {TARGETS.map((t) => (
                  <Pressable
                    key={t.id}
                    style={styles.target}
                    onPress={() => {
                      setSharedVia(t.label);
                      setSheetOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Share via ${t.label}`}
                  >
                    <Text style={styles.targetGlyph}>{t.glyph}</Text>
                    <Text style={styles.targetLabel}>{t.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingHorizontal: 16, paddingTop: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spacer: { flex: 1 },
  sharedNote: { flex: 1, fontSize: 13, color: '#2e7d32', fontWeight: '700' },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eef1f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareGlyph: { fontSize: 18, color: '#37474f' },

  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#f7f7f9',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 28,
    paddingTop: 8,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#c7c7cc',
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8e8e93',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  targets: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 6 },
  target: { width: 72, alignItems: 'center', paddingVertical: 10, gap: 5 },
  targetGlyph: { fontSize: 26 },
  targetLabel: { fontSize: 11, color: '#3c3c43', fontWeight: '600' },
});
