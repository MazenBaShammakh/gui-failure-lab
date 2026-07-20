import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Link, Stack } from 'expo-router';
import type { Href } from 'expo-router';
import { useFaultModeContext, type FaultMode } from '@/lib/fault-mode';

const OPTIONS: { value: FaultMode; label: string; hint: string }[] = [
  { value: 'baseline', label: 'Baseline', hint: 'Screens render their correct, accessible variant.' },
  { value: 'faulty', label: 'Faulty', hint: 'Screens render their defective variant for evaluation.' },
];

const PAGES: { href: Href; label: string; hint: string }[] = [
  { href: '/settings/preferences' as Href, label: 'Preferences', hint: 'Dark mode & display' },
  { href: '/settings/notifications' as Href, label: 'Notifications', hint: 'Push & email alerts' },
  { href: '/settings/apps' as Href, label: 'Installed apps', hint: 'Manage your apps' },
  { href: '/settings/licenses' as Href, label: 'Open-source licenses', hint: 'Third-party notices' },
  { href: '/settings/help' as Href, label: 'Help', hint: "What's new & support" },
  { href: '/settings/account' as Href, label: 'Delete account', hint: 'Permanently remove your account' },
];

export default function SettingsScreen() {
  const { mode, setMode } = useFaultModeContext();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Settings' }} />

      <Text style={styles.sectionLabel}>EVALUATION MODE</Text>
      <View style={styles.card}>
        {OPTIONS.map((opt, i) => {
          const selected = mode === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setMode(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={opt.label}
              style={[styles.row, i > 0 && styles.rowBorder]}
            >
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{opt.label}</Text>
                <Text style={styles.rowHint}>{opt.hint}</Text>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.footnote}>
        Current mode: {mode}. This setting is global and persists across the app.
      </Text>

      <Text style={[styles.sectionLabel, styles.sectionSpaced]}>SETTINGS</Text>
      <View style={styles.card}>
        {PAGES.map((page, i) => (
          <Link key={page.href as string} href={page.href} asChild>
            <Pressable accessibilityRole="link" accessibilityLabel={page.label}>
              {/* Row layout lives on an inner View: <Link asChild> renders an
                  <a> whose flex layout is unreliable, so keep it off the anchor. */}
              <View style={[styles.row, i > 0 && styles.rowBorder]}>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{page.label}</Text>
                  <Text style={styles.rowHint}>{page.hint}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
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
  sectionSpaced: { marginTop: 24 },
  chevron: { fontSize: 22, color: '#bbb' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
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
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: { borderColor: '#1565c0' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#1565c0' },
  footnote: { fontSize: 12, color: '#999', marginTop: 16, marginLeft: 4, lineHeight: 17 },
});
