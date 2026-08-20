import { View, Text, StyleSheet } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const VISIBLE_HEADING = 'DevOps Engineer — Reapply';
const VISIBLE_META = 'Nimbus Cloud · Remote';

// The name the stale/incorrect header node reports in faulty mode. Deliberately
// from the same app domain (an application status) so the mismatch reads as a
// plausible copy bug rather than obvious nonsense — but it names no role, so it
// cannot answer "which role am I reapplying for?".
const FAULTY_HEADER_NAME = 'Application Withdrawn';

/**
 * X21 · M_A11Y_HEADER_TEXT_MISMATCH — F-CNT-01 Heading/Label Mismatch Breaks
 * Grounding. Third observation of the type; hosted on the Reapply screen
 * (M_SILENT_FAILED_SUBMISSION).
 *
 * Mechanism (distinct from the other two observations): the visible heading and
 * the accessibility header node DISAGREE WITH EACH OTHER. `M_HEADING_LABEL_MISMATCH`
 * (F6.1, /shop/track) swaps both the nav title and the on-screen heading together,
 * so both channels are wrong in the same way; `X20` swaps two section headings with
 * each other. Here only the a11y channel is wrong:
 *
 *   Baseline: the header node's name === the pixels === "DevOps Engineer — Reapply".
 *   Faulty:   the pixels still read "DevOps Engineer — Reapply", but the node
 *             exposed as accessibilityRole="header" is named "Application
 *             Withdrawn". The a11y tree contains NO node naming the role.
 *
 *   Fails:    text-only (the only header node names a status, not a role — the
 *             agent either answers "Application Withdrawn" or cannot answer).
 *   Succeeds: vision-only (the heading pixels are correct and unobstructed).
 *
 * This fragment OWNS the screen's header block — the host no longer renders its
 * own title/meta. That is required, not incidental: if the host also rendered a
 * plain "DevOps Engineer" Text node, a text-only agent could still ground the role
 * from it and the defect would not bite.
 *
 * Isolation: the host's own defect (a silently rejected submission) lives on the
 * Submit button at the bottom of the form. This task is a read-out — it never
 * submits — so the two never interact.
 */
export default function A11yHeaderTextMismatchFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="header"
      // The single point of injection: the header node's name detaches from the
      // text rendered inside it.
      accessibilityLabel={faultActive ? FAULTY_HEADER_NAME : VISIBLE_HEADING}
      testID={faultActive ? 'defect:M_A11Y_HEADER_TEXT_MISMATCH' : undefined}
    >
      {/* Children are collapsed out of the tree so the block reports exactly one
          name (the label above) while still drawing the real, correct pixels —
          the same single-node technique used by M_RECYCLED_NODE_IDENTITY rows. */}
      <Text
        style={styles.title}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        {VISIBLE_HEADING}
      </Text>
      <Text
        style={styles.meta}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        {VISIBLE_META}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#111' },
  meta: { fontSize: 13, color: '#888', marginTop: 4 },
});
