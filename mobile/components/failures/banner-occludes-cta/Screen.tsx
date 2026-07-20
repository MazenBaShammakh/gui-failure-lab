import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const REPORTS = [
  { name: 'Q2 Summary', period: 'Apr – Jun 2026', size: '2.4 MB', icon: '📄' },
  { name: 'Revenue Breakdown', period: 'Jun 2026', size: '1.1 MB', icon: '📈' },
  { name: 'User Retention', period: 'H1 2026', size: '860 KB', icon: '👥' },
  { name: 'Support Tickets', period: 'Jun 2026', size: '540 KB', icon: '🎫' },
];

export default function BannerOccludesCtaScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [exported, setExported] = useState(false);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_BANNER_OCCLUDES_CTA' : undefined}
    >
      <Stack.Screen options={{ title: 'Reports' }} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Reports</Text>
        <Text style={styles.pageSubtitle}>Generate and export analytics reports.</Text>

        <View style={styles.reportCard}>
          <Text style={styles.reportCardTitle}>Q2 Summary</Text>
          <Text style={styles.reportCardMeta}>Apr – Jun 2026 · 2.4 MB · PDF</Text>
          <Text style={styles.reportCardBody}>
            Consolidated quarterly performance across revenue, active users, uptime
            and open tickets. Ready to share with stakeholders.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>All reports</Text>
        {REPORTS.map((r) => (
          <View key={r.name} style={styles.reportRow}>
            <Text style={styles.reportIcon}>{r.icon}</Text>
            <View style={styles.reportInfo}>
              <Text style={styles.reportName}>{r.name}</Text>
              <Text style={styles.reportPeriod}>
                {r.period} · {r.size}
              </Text>
            </View>
          </View>
        ))}

        {exported && (
          <Text style={styles.confirmation} accessibilityLiveRegion="polite">
            ✓ Q2 Summary report exported
          </Text>
        )}

        <Pressable
          style={({ pressed }) => [styles.exportBtn, pressed && styles.exportBtnPressed]}
          onPress={() => setExported(true)}
          accessibilityRole="button"
          accessibilityLabel="Export report"
        >
          <Text style={styles.exportBtnText}>Export report</Text>
        </Pressable>
      </ScrollView>

      {/* Faulty: a sticky promo banner is absolutely pinned over the bottom of the
          screen, physically covering the Export button. The button is still
          rendered and in the tree, but taps land on the banner instead. */}
      {faultActive && (
        <View style={styles.stickyBanner} pointerEvents="box-only">
          <Text style={styles.bannerIcon}>⭐</Text>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Upgrade to Pro</Text>
            <Text style={styles.bannerBody}>Unlimited exports & scheduled reports.</Text>
          </View>
          <Pressable
            style={styles.bannerCta}
            accessibilityRole="button"
            accessibilityLabel="Upgrade to Pro"
          >
            <Text style={styles.bannerCtaText}>Upgrade</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#111' },
  pageSubtitle: { fontSize: 14, color: '#888', marginTop: 4, marginBottom: 20 },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  reportCardTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  reportCardMeta: { fontSize: 12, color: '#999', marginTop: 4, marginBottom: 10 },
  reportCardBody: { fontSize: 14, color: '#555', lineHeight: 21 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  reportIcon: { fontSize: 22 },
  reportInfo: { flex: 1 },
  reportName: { fontSize: 14, fontWeight: '600', color: '#222' },
  reportPeriod: { fontSize: 12, color: '#999', marginTop: 2 },
  confirmation: { fontSize: 14, color: '#2e7d32', fontWeight: '600', marginTop: 12 },
  exportBtn: {
    backgroundColor: '#1565c0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  exportBtnPressed: { opacity: 0.8 },
  exportBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  stickyBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
  },
  bannerIcon: { fontSize: 26 },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  bannerBody: { fontSize: 12, color: '#c7c7d9', marginTop: 2 },
  bannerCta: {
    backgroundColor: '#f5b301',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  bannerCtaText: { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
});
