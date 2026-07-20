import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Track {
  id: string;
  no: number;
  title: string;
  artist: string;
  duration: string;
}

// Two DIFFERENT tracks both titled "Intro" (different artists).
const TRACKS: Track[] = [
  { id: 't1', no: 1, title: 'Intro', artist: 'Midnight Collective', duration: '1:12' },
  { id: 't2', no: 2, title: 'Glass Towers', artist: 'Midnight Collective', duration: '3:58' },
  { id: 't3', no: 3, title: 'Intro', artist: 'Solar Winds', duration: '0:48' },
  { id: 't4', no: 4, title: 'Afterglow', artist: 'Solar Winds', duration: '4:21' },
  { id: 't5', no: 5, title: 'Low Tide', artist: 'Midnight Collective', duration: '3:33' },
];

export default function DuplicateAccessibleNameScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [nowPlayingId, setNowPlayingId] = useState<string | null>(null);

  const nowPlaying = TRACKS.find((t) => t.id === nowPlayingId) ?? null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_DUPLICATE_ACCESSIBLE_NAME' : undefined}
    >
      <Stack.Screen options={{ title: 'Album' }} />

      <View style={styles.albumHeader}>
        <View style={styles.albumCover}>
          <Text style={styles.albumCoverEmoji}>💿</Text>
        </View>
        <Text style={styles.albumTitle}>Night Sessions</Text>
        <Text style={styles.albumSub}>Various Artists · 2024</Text>
      </View>

      {nowPlaying && (
        <View style={styles.statusBar} accessibilityLiveRegion="polite">
          <Text style={styles.statusText}>
            Now playing: {nowPlaying.title} — {nowPlaying.artist}
          </Text>
        </View>
      )}

      <View style={styles.list}>
        {TRACKS.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setNowPlayingId(t.id)}
            style={({ pressed }) => [styles.trackRow, pressed && styles.trackRowPressed]}
            accessibilityRole="button"
            // Faulty: every "Intro" row exposes the identical label "Intro" with no
            // artist/position — indistinguishable in the a11y tree.
            // Baseline: label always includes the artist so each row is unique.
            accessibilityLabel={faultActive ? t.title : `${t.title} by ${t.artist}`}
          >
            <Text style={styles.trackNo}>{t.no}</Text>
            <View style={styles.trackBody}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {t.title}
              </Text>
              <Text style={styles.trackArtist} numberOfLines={1}>
                {t.artist}
              </Text>
            </View>
            <Text style={styles.trackDuration}>{t.duration}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { paddingBottom: 32 },

  albumHeader: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  albumCover: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumCoverEmoji: { fontSize: 64 },
  albumTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 8 },
  albumSub: { fontSize: 13, color: '#999' },

  statusBar: {
    backgroundColor: '#173a26',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statusText: { color: '#5ee08a', fontSize: 13, fontWeight: '600' },

  list: { paddingTop: 8 },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 16,
  },
  trackRowPressed: { backgroundColor: '#1a1a1a' },
  trackNo: { width: 20, fontSize: 14, color: '#666', textAlign: 'center' },
  trackBody: { flex: 1, gap: 2 },
  trackTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },
  trackArtist: { fontSize: 13, color: '#999' },
  trackDuration: { fontSize: 12, color: '#666' },
});
