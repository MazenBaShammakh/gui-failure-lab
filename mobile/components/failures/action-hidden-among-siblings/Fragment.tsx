import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

/**
 * X10 · M_ACTION_HIDDEN_AMONG_SIBLINGS — F-PRC-03 Interactive Node Hidden by
 * important-for-accessibility Flag. Third observation of the type; hosted on the
 * Profile screen (M_ZERO_HIT_AREA_FOLLOW).
 *
 * Mechanism — ONE control hidden while its siblings stay exposed, which is the
 * inverse presentation of the other two observations:
 *   · M_ACTION_NOT_EXPOSED_IN_TREE (/music/player/midnight) and
 *     M_NOT_IMPORTANT_FOR_A11Y (A2, /photos/details) both flag an entire cluster
 *     — a toolbar a developer mistook for decorative chrome. The whole branch
 *     vanishes, so the tree has a conspicuous hole where a control group should
 *     be, and an agent can at least infer that something is missing.
 *   · X10 (here): the flag is applied to the Message button ALONE. Share and the
 *     verification badge beside it remain fully exposed and correctly named, so
 *     the action row is present in the tree, populated, and internally coherent.
 *     Nothing indicates a third child was removed.
 *
 * The consequence is that the tree reads as deliberately curated rather than
 * truncated. A text-only agent does not conclude "the toolbar is missing"; it
 * concludes "this profile offers Share, not Message" — and either reports the
 * action unavailable or substitutes Share, which succeeds and looks reasonable.
 *
 *   Baseline: all three children are exposed; Message is a named button.
 *   Faulty:   Message carries accessibilityElementsHidden +
 *             importantForAccessibility="no-hide-descendants"; siblings untouched.
 *
 *   Fails:    text-only (no node for the one control the task needs).
 *   Succeeds: vision-only (the button is drawn and tappable as normal).
 *
 * Isolation: sits between the host's stats row and its Follow button. The host's
 * defect is the 0x0 hit area on Follow, which this task never presses.
 */
export default function ActionHiddenAmongSiblingsFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [sent, setSent] = useState(false);
  const [shared, setShared] = useState(false);

  return (
    <View style={styles.wrap} testID={faultActive ? 'defect:M_ACTION_HIDDEN_AMONG_SIBLINGS' : undefined}>
      <View style={styles.row}>
        {/* The single injected node. Drawn identically in both modes. */}
        <Pressable
          style={styles.actionBtn}
          onPress={() => setSent(true)}
          accessibilityRole="button"
          accessibilityLabel="Message Anna Kovacs"
          accessibilityElementsHidden={faultActive}
          importantForAccessibility={faultActive ? 'no-hide-descendants' : 'auto'}
        >
          <Text style={styles.actionText}>Message</Text>
        </Pressable>

        {/* Siblings stay in the tree in BOTH modes — this is what removes the
            visible "hole" that the cluster-level observations leave behind. */}
        <Pressable
          style={styles.actionBtnSecondary}
          onPress={() => setShared(true)}
          accessibilityRole="button"
          accessibilityLabel="Share this profile"
        >
          <Text style={styles.actionTextSecondary}>Share</Text>
        </Pressable>

        <View style={styles.badge} accessible accessibilityRole="text" accessibilityLabel="Verified account">
          <Text style={styles.badgeText}>✓</Text>
        </View>
      </View>

      {sent && (
        <View style={styles.composer} accessibilityLiveRegion="polite">
          <Text style={styles.composerHeading}>New message to Anna Kovacs</Text>
          <Text style={styles.composerBody}>Your message thread is open.</Text>
        </View>
      )}
      {shared && !sent && (
        <Text style={styles.sharedNote} accessibilityLiveRegion="polite">
          Profile link copied.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionBtn: {
    backgroundColor: '#0288d1',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  actionText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  actionBtnSecondary: {
    backgroundColor: '#e1f5fe',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  actionTextSecondary: { color: '#0277bd', fontSize: 14, fontWeight: '800' },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0288d1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  composer: {
    marginTop: 12,
    backgroundColor: '#e1f5fe',
    borderRadius: 10,
    padding: 12,
    gap: 3,
  },
  composerHeading: { fontSize: 14, fontWeight: '800', color: '#01579b' },
  composerBody: { fontSize: 12, color: '#0277bd' },
  sharedNote: { marginTop: 10, fontSize: 13, color: '#0277bd', fontWeight: '600' },
});
