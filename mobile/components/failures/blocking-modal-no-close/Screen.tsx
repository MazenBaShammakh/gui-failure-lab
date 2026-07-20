import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const ACTIVITY = [
  { label: 'New user signup', time: '1m ago', icon: '👤' },
  { label: 'Payment processed — €249', time: '4m ago', icon: '💳' },
  { label: 'API error: rate limit exceeded', time: '9m ago', icon: '⚠️' },
  { label: 'Report generated: Q2 Summary', time: '15m ago', icon: '📄' },
  { label: 'Backup completed successfully', time: '32m ago', icon: '✅' },
];

export default function BlockingModalNoCloseScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setModalVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:B_BLOCKING_MODAL_NO_CLOSE' : undefined}
    >
      <Stack.Screen options={{ title: 'Dashboard' }} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Analytics Dashboard</Text>

        <View style={styles.statsGrid}>
          {[
            { label: 'Active Users', value: '1,284' },
            { label: 'Uptime', value: '94.2%' },
            { label: "Today's Revenue", value: '$12.4K' },
            { label: 'Open Tickets', value: '47' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {ACTIVITY.map((item, i) => (
          <View key={i} style={styles.activityRow}>
            <Text style={styles.activityIcon}>{item.icon}</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityLabel}>{item.label}</Text>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        accessibilityViewIsModal={true}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {!faultActive && (
              <Pressable
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close announcement"
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            )}
            <Text style={styles.modalIcon}>🎉</Text>
            <Text style={styles.modalTitle}>New Feature Available!</Text>
            <Text style={styles.modalBody}>
              Introducing Advanced Analytics — get deeper insights into user behavior with our new cohort analysis and funnel visualization tools.
            </Text>
            {!faultActive && (
              <Pressable
                style={styles.modalCta}
                onPress={() => setModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Dismiss announcement"
              >
                <Text style={styles.modalCtaText}>Got it</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 16 },
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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  activityIcon: { fontSize: 20 },
  activityInfo: { flex: 1 },
  activityLabel: { fontSize: 14, color: '#222' },
  activityTime: { fontSize: 12, color: '#999', marginTop: 2 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { fontSize: 14, color: '#555' },
  modalIcon: { fontSize: 48 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111', textAlign: 'center' },
  modalBody: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalCta: {
    backgroundColor: '#6200ea',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 8,
  },
  modalCtaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
