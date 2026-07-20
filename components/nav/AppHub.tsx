import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Link, Stack } from 'expo-router';
import type { Href } from 'expo-router';

/**
 * A plain in-app navigation hub.
 *
 * Several apps land on a screen that is itself a failure example (e.g. the Shop
 * store with the broken price slider). Those screens must not be edited to add
 * navigation chrome — that would pollute the very a11y tree / layout the failure
 * is meant to expose. So each such app's home tile points here instead: a
 * fault-free directory that lets an agent reach every screen in the app by
 * normal tap-through navigation. The original landing screen is just one entry.
 *
 * This component itself carries NO defect and does not read the fault mode.
 */

export interface HubItem {
  label: string;
  sublabel?: string;
  emoji: string;
  href: string;
}

interface Props {
  title: string;
  items: HubItem[];
  tint?: string;
}

export default function AppHub({ title, items, tint = '#1565c0' }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title }} />
      {items.map((item) => (
        <Link key={item.href} href={item.href as Href} asChild>
          <Pressable accessibilityRole="link" accessibilityLabel={`Open ${item.label}`}>
            {({ pressed }) => (
              // Layout lives on this inner View, not on the Pressable: under
              // <Link asChild> expo-router clones the child and drops a
              // function-form `style`, which would otherwise lose `styles.row`
              // (flexDirection: 'row') and stack the tile vertically.
              <View style={[styles.row, pressed && styles.rowPressed]}>
                <View style={[styles.iconBadge, { backgroundColor: `${tint}1a` }]}>
                  <Text style={styles.icon}>{item.emoji}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.label}>{item.label}</Text>
                  {item.sublabel ? <Text style={styles.sublabel}>{item.sublabel}</Text> : null}
                </View>
                <Text style={[styles.chevron, { color: tint }]}>›</Text>
              </View>
            )}
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f3f7' },
  content: { padding: 16, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
  },
  rowPressed: { opacity: 0.7 },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 22 },
  info: { flex: 1, gap: 2 },
  label: { fontSize: 16, fontWeight: '600', color: '#111' },
  sublabel: { fontSize: 13, color: '#888', lineHeight: 17 },
  chevron: { fontSize: 24, fontWeight: '400' },
});
