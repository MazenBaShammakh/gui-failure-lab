import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const COMPANY = 'Acme Corp';

/**
 * X01 · M_STATIC_STYLED_COMPANY_LINK — F-IDT-02 Actionable Element Styled as
 * Static. Second observation of the type; hosted on the Featured Role screen
 * (B_CLICK_NO_VISIBLE_EFFECT).
 *
 * Mechanism (distinct from M_ACTIONABLE_TEXT_STYLED_STATIC · F2.2, /music/lyrics):
 * that one restyles the control but KEEPS accessibilityRole="button", so the
 * actionable node is still discoverable in the tree and only vision-only agents
 * are fooled. Here the affordance is erased from BOTH channels:
 *
 *   Baseline: link-blue, underlined, accessibilityRole="link" + a hint. Obviously
 *             tappable to either channel.
 *   Faulty:   painted exactly like the static metadata lines around it (same grey,
 *             same size, no underline) AND `accessible={false}` on the Pressable,
 *             so the tree collapses it to a bare text node indistinguishable from
 *             the location/salary copy. It still fires on press.
 *
 *   Fails:    vision-only AND text-only — no channel reports an affordance. The
 *             agent has nothing to suggest the company name is a control.
 *
 * This is the harder end of F-IDT-02: not a mislabelled control, but a control
 * that has been fully disguised as prose.
 *
 * Isolation: replaces the host's static company byline in the card header. The
 * host's own defect is the Save (♡) button top-right, which this task never taps;
 * the host's task never reads the byline.
 */
export default function StaticStyledCompanyLinkFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        // Faulty: withdrawn from the a11y tree, so the pressable reads as prose.
        accessible={!faultActive}
        accessibilityRole={faultActive ? undefined : 'link'}
        accessibilityLabel={faultActive ? undefined : `${COMPANY} company profile`}
        accessibilityHint={faultActive ? undefined : 'Opens the company profile'}
        testID={faultActive ? 'defect:M_STATIC_STYLED_COMPANY_LINK' : undefined}
      >
        <Text style={faultActive ? styles.companyStatic : styles.companyLink}>{COMPANY}</Text>
      </Pressable>

      {open && (
        <View style={styles.profile} accessibilityLiveRegion="polite">
          <Text style={styles.profileHeading}>{COMPANY}</Text>
          <Text style={styles.profileLine}>Software · 1,200 employees · Berlin</Text>
          <Text style={styles.profileLine}>Founded 2011 · acme.example</Text>
          <Text style={styles.profileBlurb}>
            Acme Corp builds collaboration tools for distributed product teams.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Baseline: unmistakably a link.
  companyLink: {
    fontSize: 14,
    marginTop: 2,
    color: '#1565c0',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Faulty: byte-identical to the host's `company` / `metaItem` metadata styling.
  companyStatic: { fontSize: 14, marginTop: 2, color: '#555' },

  profile: {
    marginTop: 10,
    backgroundColor: '#f4f7fb',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  profileHeading: { fontSize: 14, fontWeight: '800', color: '#111' },
  profileLine: { fontSize: 12, color: '#666' },
  profileBlurb: { fontSize: 12, color: '#444', lineHeight: 18, marginTop: 2 },
});
