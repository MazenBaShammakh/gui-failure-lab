import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface SystemApp {
  id: string;
  name: string;
  icon: string;
  storage: string;
  version: string;
}

const SYSTEM_APPS: SystemApp[] = [
  { id: 'updater', name: 'System Updater', icon: '🔄', storage: '412 MB', version: '14.2.1' },
  { id: 'keyboard', name: 'Keyboard', icon: '⌨️', storage: '86 MB', version: '9.4.0' },
  { id: 'wallpaper', name: 'Wallpapers', icon: '🖼️', storage: '1.2 GB', version: '3.0.7' },
  { id: 'diagnostics', name: 'Diagnostics', icon: '🩺', storage: '24 MB', version: '2.8.3' },
];

/**
 * X29 · M_COLLAPSED_UNMOUNTED_SECTION — F-TMP-01 Dynamically Rendered Content
 * Outside Viewport. Third observation of the type; hosted on Installed apps
 * (M_RENAME_SETTINGS_APPS).
 *
 * Mechanism — revealed by an EXPAND ACTION, not by any scroll axis. The three
 * observations separate three ways deferred content can stay out of reach:
 *   · M_LAZY_SECTION_OUTSIDE_VIEWPORT (F8.1, /shop/recommended): vertical scroll.
 *   · X28 (/music/playlist): horizontal scroll — a second axis the agent must
 *     realise exists.
 *   · X29 (here): no traversal reveals it at all. The children are simply not
 *     mounted until the section header is pressed.
 *
 * This is the case scroll-based exploration cannot solve in principle. An agent
 * may scroll the screen to its true end, in both axes, and the target still does
 * not exist in the tree. What is required is an interaction with a control that
 * gives no indication of holding the target — and unlike a lazy list there is no
 * loading placeholder, no spinner and no partial content to hint that anything is
 * pending. The collapsed header is the only trace.
 *
 *   Baseline: the section is expanded on mount, so its rows are present from the
 *             first render and reachable by ordinary reading.
 *   Faulty:   collapsed, children unmounted, no placeholder.
 *
 *   Fails:    vision-only AND text-only (the nodes do not exist until expansion).
 *
 * Isolation: a separate section below the host's installed-apps card. The host's
 * defect is the Chirp -> Zap rebrand on those rows; this task targets a system
 * app that appears only in this fragment, so the rebrand is never in play.
 */
export default function CollapsedUnmountedSectionFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  // Baseline: already open on first render. Faulty: closed, contents unmounted.
  const [expanded, setExpanded] = useState(!faultActive);
  const [openedId, setOpenedId] = useState<string | null>(null);

  const opened = SYSTEM_APPS.find((a) => a.id === openedId) ?? null;

  return (
    <View testID={faultActive ? 'defect:M_COLLAPSED_UNMOUNTED_SECTION' : undefined}>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel="System apps"
        accessibilityState={{ expanded }}
        style={styles.header}
      >
        <Text style={styles.headerText}>SYSTEM APPS</Text>
        <Text style={styles.chevron}>{expanded ? '⌃' : '⌄'}</Text>
      </Pressable>

      {/* The whole injection: when collapsed these rows are not rendered at all,
          so they are absent from the tree rather than merely off-screen. */}
      {expanded && (
        <View style={styles.card}>
          {SYSTEM_APPS.map((app, i) => (
            <Pressable
              key={app.id}
              onPress={() => setOpenedId(app.id)}
              accessibilityRole="button"
              accessibilityLabel={`Open storage details for ${app.name}`}
              style={[styles.row, i > 0 && styles.rowBorder]}
            >
              <View style={styles.iconBadge}>
                <Text style={styles.icon}>{app.icon}</Text>
              </View>
              <Text style={styles.name}>{app.name}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      )}

      {opened && (
        <View style={styles.details} accessibilityLiveRegion="polite">
          <Text style={styles.detailsHeading}>{opened.name} — storage</Text>
          <Text style={styles.detailsLine}>On device: {opened.storage}</Text>
          <Text style={styles.detailsLine}>Version {opened.version}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
    marginBottom: 8,
  },
  headerText: { fontSize: 12, fontWeight: '700', color: '#888', letterSpacing: 0.5 },
  chevron: { fontSize: 14, color: '#b0b4ba' },
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#e6e6ea' },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#eceff1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 18 },
  name: { flex: 1, fontSize: 15, color: '#111', fontWeight: '600' },
  details: {
    marginTop: 10,
    backgroundColor: '#f4f7fb',
    borderRadius: 10,
    padding: 12,
    gap: 3,
  },
  detailsHeading: { fontSize: 13, fontWeight: '800', color: '#111' },
  detailsLine: { fontSize: 12, color: '#555' },
});
