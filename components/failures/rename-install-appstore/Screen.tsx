import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { Link, Stack } from 'expo-router';
import type { Href } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface AppListing {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  iconTint: string;
}

interface Props {
  faultActive?: boolean;
}

// Baseline keeps the recognizable "Chirp" identity (name + 🐦 icon) so an agent
// grounding on the task word "Chirp" — by name (text-only) or by icon
// (vision-only) — resolves the row and installs it.
const BASELINE_APPS: AppListing[] = [
  { id: 'lumina', name: 'Lumina Photos', subtitle: 'Edit & organize your library', icon: '🌅', iconTint: '#fff3e0' },
  { id: 'chirp', name: 'Chirp', subtitle: 'Social · Share short posts', icon: '🐦', iconTint: '#e3f2fd' },
  { id: 'tempo', name: 'Tempo', subtitle: 'Music & podcasts', icon: '🎧', iconTint: '#f3e5f5' },
  { id: 'ledger', name: 'Ledger', subtitle: 'Budgeting made simple', icon: '💰', iconTint: '#e8f5e9' },
  { id: 'maply', name: 'Maply', subtitle: 'Navigation & local guides', icon: '🧭', iconTint: '#e8eaf6' },
  { id: 'focus', name: 'Focus', subtitle: 'Pomodoro timer & habits', icon: '⏳', iconTint: '#ede7f6' },
  { id: 'notiz', name: 'Notiz', subtitle: 'Simple note-taking', icon: '📝', iconTint: '#e0f2f1' },
];

// Faulty: the same social app is now listed ONLY as "Zap" with a ⚡ icon. The
// string "Chirp" appears nowhere (not in name, subtitle, or a11y label) and the
// icon no longer matches, so a "install Chirp" task cannot ground onto any row.
const FAULTY_APPS: AppListing[] = [
  { id: 'lumina', name: 'Lumina Photos', subtitle: 'Edit & organize your library', icon: '🌅', iconTint: '#fff3e0' },
  { id: 'chirp', name: 'Zap', subtitle: 'Social · Share short posts', icon: '⚡', iconTint: '#fff8e1' },
  { id: 'tempo', name: 'Tempo', subtitle: 'Music & podcasts', icon: '🎧', iconTint: '#f3e5f5' },
  { id: 'ledger', name: 'Ledger', subtitle: 'Budgeting made simple', icon: '💰', iconTint: '#e8f5e9' },
  { id: 'maply', name: 'Maply', subtitle: 'Navigation & local guides', icon: '🧭', iconTint: '#e8eaf6' },
  { id: 'focus', name: 'Focus', subtitle: 'Pomodoro timer & habits', icon: '⏳', iconTint: '#ede7f6' },
  { id: 'notiz', name: 'Notiz', subtitle: 'Simple note-taking', icon: '📝', iconTint: '#e0f2f1' },
];

export default function RenameInstallAppstoreScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const apps = faultActive ? FAULTY_APPS : BASELINE_APPS;

  const [query, setQuery] = useState('');
  const [installed, setInstalled] = useState<Record<string, boolean>>({});

  const visible = apps.filter((a) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return a.name.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q);
  });

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_RENAME_INSTALL_APPSTORE' : undefined}
    >
      <Stack.Screen options={{ title: 'App Store' }} />

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search apps"
          placeholderTextColor="#9e9e9e"
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search apps"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.sectionTitle}>Top Apps</Text>
        {visible.map((app) => {
          const isInstalled = installed[app.id];
          return (
            <View
              key={app.id}
              style={styles.row}
              accessible
              accessibilityLabel={`${app.name}. ${app.subtitle}`}
            >
              <View style={[styles.iconBadge, { backgroundColor: app.iconTint }]}>
                <Text style={styles.icon}>{app.icon}</Text>
              </View>
              {app.id === 'notiz' ? (
                <Link href={'/appstore/listing' as Href} asChild>
                  <Pressable
                    style={styles.info}
                    accessibilityRole="link"
                    accessibilityLabel={`Open ${app.name} listing`}
                  >
                    <Text style={styles.name}>{app.name}</Text>
                    <Text style={styles.subtitle} numberOfLines={1}>
                      {app.subtitle}
                    </Text>
                  </Pressable>
                </Link>
              ) : (
                <View style={styles.info}>
                  <Text style={styles.name}>{app.name}</Text>
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {app.subtitle}
                  </Text>
                </View>
              )}
              <Pressable
                style={[styles.getButton, isInstalled && styles.getButtonDone]}
                onPress={() =>
                  setInstalled((prev) => ({ ...prev, [app.id]: true }))
                }
                disabled={isInstalled}
                accessibilityRole="button"
                accessibilityLabel={
                  isInstalled ? `${app.name} installed` : `Install ${app.name}`
                }
              >
                <Text style={[styles.getText, isInstalled && styles.getTextDone]}>
                  {isInstalled ? 'Open' : 'Get'}
                </Text>
              </Pressable>
            </View>
          );
        })}
        {visible.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔎</Text>
            <Text style={styles.emptyText}>No results for “{query}”</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9e9ee',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 16, color: '#111', padding: 0 },
  list: { paddingHorizontal: 16, paddingBottom: 48 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 30 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '600', color: '#111' },
  subtitle: { fontSize: 13, color: '#888' },
  getButton: {
    backgroundColor: '#e3f0ff',
    paddingHorizontal: 22,
    paddingVertical: 7,
    borderRadius: 16,
  },
  getButtonDone: { backgroundColor: '#eee' },
  getText: { fontSize: 14, fontWeight: '700', color: '#007aff' },
  getTextDone: { color: '#888' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: '#888' },
});
