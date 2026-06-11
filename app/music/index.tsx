import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Link, Stack } from 'expo-router';
import type { Href } from 'expo-router';

const RECENT: { id: string; href: Href; title: string; artist: string; emoji: string }[] = [
  {
    id: 'midnight',
    href: '/music/player/midnight',
    title: 'Midnight Reverie',
    artist: 'The Velvet Orchestra',
    emoji: '🎵',
  },
  {
    id: 'ocean',
    href: '/music/player/ocean',
    title: 'Ocean Breeze',
    artist: 'Solar Winds',
    emoji: '🎶',
  },
];

export default function MusicLibraryScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Music' }} />
      <Text style={styles.heading}>Recently played</Text>
      {RECENT.map((t) => (
        <Link key={t.id} href={t.href} asChild>
          <Pressable
            style={styles.row}
            accessibilityRole="link"
            accessibilityLabel={`Open ${t.title} by ${t.artist}`}
          >
            <View style={styles.art}>
              <Text style={styles.artEmoji}>{t.emoji}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.artist}>{t.artist}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 20 },
  heading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  art: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artEmoji: { fontSize: 28 },
  info: { flex: 1, gap: 3 },
  title: { fontSize: 16, fontWeight: '600', color: '#fff' },
  artist: { fontSize: 13, color: '#999' },
  chevron: { fontSize: 24, color: '#555' },
});
