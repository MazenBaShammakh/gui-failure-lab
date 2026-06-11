import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Link, Stack } from 'expo-router';
import type { Href } from 'expo-router';

interface AppTile {
  name: string;
  icon: string;
  href: Href;
  tint: string;
}

const APPS: AppTile[] = [
  { name: 'Shop', icon: '🛍️', href: '/shop', tint: '#e8f5e9' },
  { name: 'Careers', icon: '💼', href: '/careers', tint: '#e3f2fd' },
  { name: 'Music', icon: '🎵', href: '/music', tint: '#f3e5f5' },
  { name: 'Social', icon: '💬', href: '/social', tint: '#e1f5fe' },
  { name: 'Mail', icon: '✉️', href: '/mail', tint: '#fff3e0' },
  { name: 'Tasks', icon: '✅', href: '/tasks', tint: '#e0f2f1' },
  { name: 'Clock', icon: '⏰', href: '/clock', tint: '#ede7f6' },
  { name: 'Dashboard', icon: '📊', href: '/dashboard', tint: '#fce4ec' },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.statusBar}>
        <Text style={styles.clock}>9:41</Text>
        <Link href="/settings" asChild>
          <Pressable
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Text style={styles.gear}>⚙︎</Text>
          </Pressable>
        </Link>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Apps</Text>
        <View style={styles.grid}>
          {APPS.map((app) => (
            <Link key={app.name} href={app.href} asChild>
              <Pressable
                style={styles.tile}
                accessibilityRole="link"
                accessibilityLabel={`Open ${app.name}`}
              >
                <View style={[styles.iconBadge, { backgroundColor: app.tint }]}>
                  <Text style={styles.icon}>{app.icon}</Text>
                </View>
                <Text style={styles.tileLabel}>{app.name}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f3f7' },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  clock: { fontSize: 15, fontWeight: '600', color: '#111' },
  gear: { fontSize: 20, color: '#555' },
  content: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 8 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 24,
    columnGap: 0,
    justifyContent: 'space-between',
  },
  tile: { width: '25%', alignItems: 'center', gap: 8 },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icon: { fontSize: 32 },
  tileLabel: { fontSize: 12, color: '#333', fontWeight: '500' },
});
