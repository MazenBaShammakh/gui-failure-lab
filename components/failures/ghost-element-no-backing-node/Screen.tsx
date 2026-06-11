import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';

interface Props {
  faultActive?: boolean;
}

const TRACKS = [
  { title: 'Ocean Breeze', artist: 'Solar Winds', duration: '4:12' },
  { title: 'Mountain Echo', artist: 'Terra Nova', duration: '3:47' },
  { title: 'City Lights', artist: 'Neon Pulse', duration: '5:01' },
];

export default function GhostElementNoBackingNodeScreen({ faultActive = false }: Props) {
  const [playing, setPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);

  const track = TRACKS[trackIndex];
  const hasPrev = trackIndex > 0;
  const hasNext = trackIndex < TRACKS.length - 1;

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:B_GHOST_ELEMENT_NO_BACKING_NODE' : undefined}
    >
      <Stack.Screen options={{ title: 'Now Playing' }} />

      <View style={styles.albumArt}>
        <Text style={styles.albumEmoji}>🎶</Text>
      </View>

      <Text style={styles.trackTitle}>{track.title}</Text>
      <Text style={styles.artistName}>{track.artist}</Text>
      <Text style={styles.duration}>{track.duration}</Text>

      <View style={styles.progressContainer}>
        <Text style={styles.timeLabel}>0:00</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '0%' }]} />
        </View>
        <Text style={styles.timeLabel}>{track.duration}</Text>
      </View>

      <View style={styles.controls}>
        {/* Baseline: Previous button is visible and on-screen.
            Faulty: Previous button is shifted off-screen (position absolute, left: -1200)
            so it's absent from the visible layout but still present in the a11y tree. */}
        {!faultActive ? (
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Previous track"
            onPress={() => setTrackIndex((i) => Math.max(0, i - 1))}
            style={[styles.controlBtn, !hasPrev && styles.controlBtnDisabled]}
            disabled={!hasPrev}
          >
            <Text style={[styles.controlText, !hasPrev && styles.controlTextDisabled]}>⏮</Text>
          </Pressable>
        ) : (
          /* Ghost: off-screen but still accessible — absolute positioned far left */
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Previous track"
            onPress={() => setTrackIndex((i) => Math.max(0, i - 1))}
            style={{ position: 'absolute', left: -1200, top: 0, width: 44, height: 44 }}
          >
            <Text>⏮</Text>
          </Pressable>
        )}

        <Pressable
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause' : 'Play'}
          onPress={() => setPlaying((p) => !p)}
          style={[styles.controlBtn, styles.playBtn]}
        >
          <Text style={[styles.controlText, styles.playBtnText]}>
            {playing ? '⏸' : '▶'}
          </Text>
        </Pressable>

        <Pressable
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Next track"
          onPress={() => setTrackIndex((i) => Math.min(TRACKS.length - 1, i + 1))}
          style={[styles.controlBtn, !hasNext && styles.controlBtnDisabled]}
          disabled={!hasNext}
        >
          <Text style={[styles.controlText, !hasNext && styles.controlTextDisabled]}>⏭</Text>
        </Pressable>
      </View>

      <View style={styles.trackList}>
        <Text style={styles.trackListTitle}>Up next</Text>
        {TRACKS.map((t, i) => (
          <Pressable
            key={i}
            onPress={() => setTrackIndex(i)}
            accessibilityRole="button"
            accessibilityLabel={`Play ${t.title} by ${t.artist}`}
            style={[styles.trackRow, i === trackIndex && styles.trackRowActive]}
          >
            <Text style={[styles.trackRowTitle, i === trackIndex && styles.trackRowTitleActive]}>
              {t.title}
            </Text>
            <Text style={styles.trackRowArtist}>{t.artist}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  albumArt: {
    width: 180,
    height: 180,
    borderRadius: 16,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  albumEmoji: { fontSize: 70 },
  trackTitle: { fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'center' },
  artistName: { fontSize: 14, color: '#aaa', textAlign: 'center' },
  duration: { fontSize: 12, color: '#666' },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  timeLabel: { fontSize: 11, color: '#666', width: 32 },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  progressFill: { height: 3, backgroundColor: '#1db954', borderRadius: 2 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    width: '100%',
  },
  controlBtn: { padding: 10 },
  controlBtnDisabled: { opacity: 0.3 },
  controlText: { fontSize: 30, color: '#fff' },
  controlTextDisabled: { color: '#555' },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1db954',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  playBtnText: { fontSize: 28, color: '#fff' },
  trackList: { width: '100%', marginTop: 8 },
  trackListTitle: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  trackRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#222',
    gap: 2,
  },
  trackRowActive: { opacity: 1 },
  trackRowTitle: { fontSize: 14, color: '#ccc' },
  trackRowTitleActive: { color: '#1db954', fontWeight: '700' },
  trackRowArtist: { fontSize: 12, color: '#666' },
});
