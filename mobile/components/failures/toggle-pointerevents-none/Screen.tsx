import { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

export default function TogglePointerEventsNoneScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [darkMode, setDarkMode] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_TOGGLE_POINTEREVENTS_NONE' : undefined}
    >
      <Stack.Screen options={{ title: 'Preferences' }} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.card}>
          {/* Faulty: the Switch wrapper has pointerEvents="none" so the switch
              renders in its current state and reads as a switch in the tree, but
              taps never reach it and it can never toggle.
              Baseline: it toggles normally. */}
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Dark Mode</Text>
              <Text style={styles.rowHint}>Use a dark color scheme across the app.</Text>
            </View>
            <View pointerEvents={faultActive ? 'none' : 'auto'}>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                accessibilityLabel="Dark Mode"
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>GENERAL</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Auto-update apps</Text>
              <Text style={styles.rowHint}>Download updates over Wi-Fi automatically.</Text>
            </View>
            <Switch
              value={autoUpdate}
              onValueChange={setAutoUpdate}
              accessibilityLabel="Auto-update apps"
            />
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Share analytics</Text>
              <Text style={styles.rowHint}>Help improve the app with usage data.</Text>
            </View>
            <Switch
              value={analytics}
              onValueChange={setAnalytics}
              accessibilityLabel="Share analytics"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f3f7' },
  content: { padding: 20 },
  sectionLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#e5e5e5' },
  rowText: { flex: 1, gap: 3 },
  rowLabel: { fontSize: 16, color: '#111', fontWeight: '600' },
  rowHint: { fontSize: 13, color: '#888', lineHeight: 18 },
});
