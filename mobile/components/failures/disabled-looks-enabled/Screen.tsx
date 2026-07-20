import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const STATS = [
  { label: 'Active Users', value: '1,284' },
  { label: 'Uptime', value: '94.2%' },
  { label: "Today's Revenue", value: '$12.4K' },
  { label: 'Open Tickets', value: '47' },
];

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function DisabledLooksEnabledScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());

  const refresh = () => setLastUpdated(new Date());

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DISABLED_LOOKS_ENABLED' : undefined}
    >
      <Stack.Screen options={{ title: 'Overview' }} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Dashboard Overview</Text>
        <Text style={styles.lastUpdated}>Last updated {formatTime(lastUpdated)}</Text>

        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Faulty: the button is disabled and styled identically to enabled, with
            NO accessibilityState.disabled — vision and the tree both see an
            enabled button, but presses are silently dropped.
            Baseline: enabled; pressing updates the timestamp. */}
        {faultActive ? (
          <Pressable
            style={styles.refreshBtn}
            disabled={true}
            onPress={refresh}
            accessibilityRole="button"
            accessibilityLabel="Refresh data"
          >
            <Text style={styles.refreshBtnText}>Refresh data</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.refreshBtn, pressed && styles.refreshBtnPressed]}
            onPress={refresh}
            accessibilityRole="button"
            accessibilityLabel="Refresh data"
          >
            <Text style={styles.refreshBtnText}>Refresh data</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#111' },
  lastUpdated: { fontSize: 13, color: '#888', marginTop: 4, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statValue: { fontSize: 26, fontWeight: '700', color: '#111', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#888' },
  refreshBtn: {
    backgroundColor: '#1565c0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  refreshBtnPressed: { opacity: 0.8 },
  refreshBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
