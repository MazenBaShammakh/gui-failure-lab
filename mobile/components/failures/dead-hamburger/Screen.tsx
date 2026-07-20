import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
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

const MENU_ITEMS = [
  { label: 'Overview', icon: '📊' },
  { label: 'Reports', icon: '📄' },
  { label: 'Team', icon: '👥' },
  { label: 'Billing', icon: '💳' },
  { label: 'Settings', icon: '⚙️' },
];

export default function DeadHamburgerScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Faulty: the hamburger handler is inert — the drawer never opens.
  const openDrawer = () => {
    if (faultActive) return;
    setDrawerOpen(true);
  };

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DEAD_HAMBURGER' : undefined}
    >
      <Stack.Screen options={{ title: 'Dashboard' }} />

      <View style={styles.header}>
        <Pressable
          onPress={openDrawer}
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
          style={styles.hamburgerBtn}
          hitSlop={8}
        >
          <Text style={styles.hamburgerIcon}>☰</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Welcome back, Alex</Text>

        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={drawerOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setDrawerOpen(false)}
      >
        <Pressable style={styles.drawerOverlay} onPress={() => setDrawerOpen(false)}>
          <View style={styles.drawer}>
            <Text style={styles.drawerTitle}>Menu</Text>
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.label}
                style={styles.drawerRow}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Text style={styles.drawerIcon}>{item.icon}</Text>
                <Text style={styles.drawerLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  hamburgerBtn: { padding: 8 },
  hamburgerIcon: { fontSize: 22, color: '#222' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginLeft: 8 },
  headerSpacer: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
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
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    width: 260,
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingHorizontal: 16,
    gap: 4,
  },
  drawerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 8,
  },
  drawerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  drawerIcon: { fontSize: 20 },
  drawerLabel: { fontSize: 16, color: '#222', fontWeight: '500' },
});
