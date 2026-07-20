import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const ALERTS = [
  { id: 'a1', label: 'API latency above threshold', severity: 'Warning' },
  { id: 'a2', label: 'Disk usage at 82%', severity: 'Warning' },
  { id: 'a3', label: 'Nightly backup completed', severity: 'Info' },
];

export default function NonblockingOverlayOcclusionScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [refreshed, setRefreshed] = useState(false);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_NONBLOCKING_OVERLAY_OCCLUSION' : undefined}
    >
      <Stack.Screen options={{ title: 'Alerts' }} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>

        <View style={styles.refreshWrap}>
          <Pressable
            onPress={() => setRefreshed(true)}
            accessibilityRole="button"
            accessibilityLabel="Refresh"
            style={styles.refreshButton}
          >
            <Text style={styles.refreshButtonText}>↻ Refresh</Text>
          </Pressable>

          {faultActive && (
            // Faulty: a translucent "Syncing…" strip visually covers the
            // Refresh button but has pointerEvents="none", so taps pass
            // through to the real button beneath — a vision-only agent
            // can't see/locate the target even though it's still
            // structurally tappable. Contrast with M_BANNER_OCCLUDES_CTA
            // (box-only, blocking) — this is the non-blocking counterpart.
            <View style={styles.syncingStrip} pointerEvents="none">
              <Text style={styles.syncingText}>Syncing…</Text>
            </View>
          )}
        </View>
      </View>

      {refreshed && (
        <View style={styles.banner} accessibilityLiveRegion="polite">
          <Text style={styles.bannerText}>✓ Data refreshed</Text>
        </View>
      )}

      {ALERTS.map((a) => (
        <View key={a.id} style={styles.row}>
          <Text
            style={[
              styles.severityDot,
              a.severity === 'Warning' && styles.severityDotWarning,
            ]}
          >
            ●
          </Text>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>{a.label}</Text>
            <Text style={styles.rowSeverity}>{a.severity}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  refreshWrap: { position: 'relative' },
  refreshButton: {
    backgroundColor: '#fce4ec',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  refreshButtonText: { fontSize: 13, fontWeight: '700', color: '#c2185b' },
  syncingStrip: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    left: -8,
    right: -8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncingText: { fontSize: 12, fontWeight: '700', color: '#999' },
  banner: { backgroundColor: '#fce4ec', paddingHorizontal: 20, paddingVertical: 12 },
  bannerText: { color: '#c2185b', fontSize: 14, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#f0f0f0',
  },
  severityDot: { fontSize: 10, color: '#90a4ae' },
  severityDotWarning: { color: '#e65100' },
  rowInfo: { gap: 2 },
  rowLabel: { fontSize: 15, color: '#111', fontWeight: '600' },
  rowSeverity: { fontSize: 12, color: '#999' },
});
