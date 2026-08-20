import { View, Text, StyleSheet } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface DataRow {
  category: string;
  detail: string;
}

// The answer to the task lives ONLY here — nowhere else on the listing.
const COLLECTED: DataRow[] = [
  { category: 'Contact info', detail: 'Email address, name' },
  { category: 'Usage data', detail: 'Product interaction, crash logs' },
  { category: 'Identifiers', detail: 'Device ID, advertising ID' },
];

/**
 * X08 · M_WEBVIEW_OPAQUE_PRIVACY_PANEL — F-PRC-02 WebView Content Opaque to
 * Native A11y Tree. Second observation of the type; hosted on the Notiz listing
 * (M_UNSUPPORTED_LANGUAGE_CONTENT).
 *
 * Mechanism — a PARTIAL panel blocking INFORMATION rather than a full-screen
 * WebView blocking INTERACTION. M_WEBVIEW_OPAQUE_A11Y_TREE (A1, /banking/webform)
 * hands the agent a screen that is essentially one opaque node: the whole task is
 * inside the WebView, so a text-only agent immediately sees it has nothing to work
 * with. Here the WebView is a small embedded panel on an otherwise fully
 * accessible native screen, and the task is a READ-OUT:
 *
 *   · every other element (title, developer, Get button, description, reviews) is
 *     present and correctly named, so the tree looks complete and healthy;
 *   · the one region holding the answer collapses to a single node.
 *
 * The agent is therefore not blocked — it is silently under-informed, with no cue
 * that a section was elided. The likely failure is a confident answer drawn from
 * the description text instead of the privacy table, or a flat "the listing does
 * not say".
 *
 *   Baseline: the a11y bridge is wired; each data row is its own labelled node.
 *   Faulty:   the panel is one opaque node named "Web content"; rows are hidden.
 *
 *   Fails:    text-only (the rows are unreachable).
 *   Succeeds: vision-only (the table is drawn normally).
 *
 * Isolation: sits between the host's Description and Reviews sections. The host's
 * defect is the unsupported-language description above it, which this task does
 * not need — and this panel is the only place the collected-data answer exists.
 */
export default function WebViewOpaquePrivacyPanelFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  return (
    <View testID={faultActive ? 'defect:M_WEBVIEW_OPAQUE_PRIVACY_PANEL' : undefined}>
      <Text style={styles.sectionTitle}>App Privacy</Text>

      {/* Embedded WebView panel. Faulty: the subtree is withdrawn from the native
          a11y tree and the container reports as one opaque node — the same
          bridge-not-wired simulation used by M_WEBVIEW_OPAQUE_A11Y_TREE. */}
      <View
        style={styles.webview}
        accessible={faultActive}
        accessibilityRole={faultActive ? 'image' : undefined}
        accessibilityLabel={faultActive ? 'Web content' : undefined}
        accessibilityElementsHidden={faultActive}
        importantForAccessibility={faultActive ? 'no-hide-descendants' : 'auto'}
      >
        <View style={styles.chrome}>
          <Text style={styles.chromeUrl}>privacy.notiz.example/ios</Text>
        </View>

        <Text style={styles.panelHeading}>Data this app collects</Text>
        {COLLECTED.map((row) => (
          <View key={row.category} style={styles.dataRow}>
            <Text style={styles.dataCategory}>{row.category}</Text>
            <Text style={styles.dataDetail}>{row.detail}</Text>
          </View>
        ))}
        <Text style={styles.panelFoot}>Not linked to you · Not used for tracking</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginTop: 22,
    marginBottom: 8,
  },
  webview: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d8dade',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  chrome: { backgroundColor: '#eceff1', paddingHorizontal: 10, paddingVertical: 6 },
  chromeUrl: { fontSize: 11, color: '#78909c' },
  panelHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
  },
  dataRow: { paddingHorizontal: 12, paddingVertical: 6 },
  dataCategory: { fontSize: 13, fontWeight: '700', color: '#37474f' },
  dataDetail: { fontSize: 12, color: '#78909c', marginTop: 1 },
  panelFoot: {
    fontSize: 11,
    color: '#90a4ae',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
