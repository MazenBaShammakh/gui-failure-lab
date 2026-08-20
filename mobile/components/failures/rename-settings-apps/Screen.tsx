import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import CollapsedUnmountedSection from '@/components/failures/collapsed-unmounted-section';

interface Props {
  faultActive?: boolean;
}

interface AppRow {
  id: string;
  name: string;
  icon: string;
  tint: string;
}

// Baseline keeps the recognizable "Chirp" identity (name + 🐦) so a task that
// says "Chirp" — grounded by name or icon — resolves the row.
const BASELINE_APPS: AppRow[] = [
  { id: 'lumina', name: 'Lumina Photos', icon: '🌅', tint: '#fff3e0' },
  { id: 'chirp', name: 'Chirp', icon: '🐦', tint: '#e3f2fd' },
  { id: 'tempo', name: 'Tempo', icon: '🎧', tint: '#f3e5f5' },
  { id: 'ledger', name: 'Ledger', icon: '💰', tint: '#e8f5e9' },
  { id: 'maply', name: 'Maply', icon: '🧭', tint: '#e8eaf6' },
  { id: 'focus', name: 'Focus', icon: '⏳', tint: '#ede7f6' },
];

// Faulty: the same social app is now labeled ONLY "Zap" with a ⚡ icon. The
// string "Chirp" appears nowhere (name or a11y label), so an "open Chirp
// settings" task cannot ground onto any row.
const FAULTY_APPS: AppRow[] = [
  { id: 'lumina', name: 'Lumina Photos', icon: '🌅', tint: '#fff3e0' },
  { id: 'chirp', name: 'Zap', icon: '⚡', tint: '#fff8e1' },
  { id: 'tempo', name: 'Tempo', icon: '🎧', tint: '#f3e5f5' },
  { id: 'ledger', name: 'Ledger', icon: '💰', tint: '#e8f5e9' },
  { id: 'maply', name: 'Maply', icon: '🧭', tint: '#e8eaf6' },
  { id: 'focus', name: 'Focus', icon: '⏳', tint: '#ede7f6' },
];

export default function RenameSettingsAppsScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const apps = faultActive ? FAULTY_APPS : BASELINE_APPS;
  const [openedId, setOpenedId] = useState<string | null>(null);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_RENAME_SETTINGS_APPS' : undefined}
    >
      <Stack.Screen options={{ title: 'Installed apps' }} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>INSTALLED APPS</Text>
        <View style={styles.card}>
          {apps.map((app, i) => (
            <Pressable
              key={app.id}
              onPress={() => setOpenedId(app.id)}
              accessibilityRole="button"
              accessibilityLabel={`${app.name} settings`}
              style={[styles.row, i > 0 && styles.rowBorder]}
            >
              <View style={[styles.iconBadge, { backgroundColor: app.tint }]}>
                <Text style={styles.icon}>{app.icon}</Text>
              </View>
              <Text style={styles.name}>{app.name}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>

        {openedId && (
          <Text style={styles.openedNote} accessibilityLiveRegion="polite">
            Opened settings for {apps.find((a) => a.id === openedId)?.name}.
          </Text>
        )}

        {/* X29 (F-TMP-01): a collapsed section whose rows are unmounted until
            expanded. Its apps are system apps that exist only here, so the
            host's Chirp -> Zap rebrand is never on this task's path. */}
        <CollapsedUnmountedSection />
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
    marginLeft: 4,
  },
  card: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#e5e5e5' },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 22 },
  name: { flex: 1, fontSize: 16, color: '#111', fontWeight: '500' },
  chevron: { fontSize: 22, color: '#c4c4c6' },
  openedNote: { fontSize: 13, color: '#2e7d32', marginTop: 16, marginLeft: 4 },
});
