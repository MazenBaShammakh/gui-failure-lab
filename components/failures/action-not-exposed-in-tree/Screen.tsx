import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';

interface Props {
  faultActive?: boolean;
}

export default function ActionNotExposedInTreeScreen({ faultActive = false }: Props) {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_ACTION_NOT_EXPOSED_IN_TREE' : undefined}
    >
      <Stack.Screen options={{ title: 'Now Playing' }} />

      <View style={styles.albumArt}>
        <Text style={styles.albumEmoji}>🎵</Text>
      </View>

      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>Midnight Reverie</Text>
        <Text style={styles.artistName}>The Velvet Orchestra</Text>
        <Text style={styles.albumName}>After Hours · 2024</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.timeLabel}>1:23</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
          <View style={styles.progressThumb} />
        </View>
        <Text style={styles.timeLabel}>3:52</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous track"
          onPress={() => {}}
          style={styles.sideBtn}
        >
          <Text style={styles.sideBtnText}>⏮</Text>
        </Pressable>

        {/* Play/Pause — hidden from a11y tree in faulty mode */}
        <View
          accessible={!faultActive}
          accessibilityElementsHidden={faultActive}
          importantForAccessibility={faultActive ? 'no-hide-descendants' : 'auto'}
        >
          <Pressable
            accessible={!faultActive}
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Pause' : 'Play'}
            onPress={() => setPlaying((p) => !p)}
            style={styles.playBtn}
          >
            <Text style={styles.playBtnText}>{playing ? '⏸' : '▶'}</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next track"
          onPress={() => {}}
          style={styles.sideBtn}
        >
          <Text style={styles.sideBtnText}>⏭</Text>
        </Pressable>
      </View>

      <View style={styles.secondaryControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Unlike' : 'Like track'}
          onPress={() => setLiked((l) => !l)}
          style={styles.secondaryBtn}
        >
          <Text style={[styles.secondaryBtnText, liked && styles.liked]}>
            {liked ? '♥' : '♡'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add to playlist"
          onPress={() => {}}
          style={styles.secondaryBtn}
        >
          <Text style={styles.secondaryBtnText}>＋</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share track"
          onPress={() => {}}
          style={styles.secondaryBtn}
        >
          <Text style={styles.secondaryBtnText}>↗</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', padding: 24, gap: 28 },
  albumArt: {
    width: 220,
    height: 220,
    borderRadius: 20,
    backgroundColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  albumEmoji: { fontSize: 80 },
  trackInfo: { alignItems: 'center', gap: 4 },
  trackTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  artistName: { fontSize: 15, color: '#aaa' },
  albumName: { fontSize: 13, color: '#666' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  timeLabel: { fontSize: 12, color: '#888', width: 36 },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressFill: { width: '35%', height: 4, backgroundColor: '#7c4dff', borderRadius: 2 },
  progressThumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginLeft: -2,
  },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  sideBtn: { padding: 8 },
  sideBtnText: { fontSize: 28, color: '#ccc' },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7c4dff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnText: { fontSize: 30, color: '#fff' },
  secondaryControls: { flexDirection: 'row', gap: 40 },
  secondaryBtn: { padding: 8 },
  secondaryBtnText: { fontSize: 24, color: '#888' },
  liked: { color: '#e91e63' },
});
