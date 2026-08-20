import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Playlist {
  id: string;
  name: string;
  emoji: string;
  count: number;
}

const PLAYLISTS: Playlist[] = [
  { id: 'chill', name: 'Chill Vibes', emoji: '🎧', count: 12 },
  { id: 'commute', name: 'Commute', emoji: '🚆', count: 24 },
  { id: 'workout', name: 'Workout', emoji: '🏃', count: 31 },
  { id: 'dinner', name: 'Dinner Party', emoji: '🍷', count: 18 },
  { id: 'rainy', name: 'Rainy Day', emoji: '🌧️', count: 9 },
  { id: 'roadtrip', name: 'Road Trip', emoji: '🛣️', count: 42 },
  { id: 'focus', name: 'Focus', emoji: '🎯', count: 15 },
  { id: 'sleep', name: 'Sleep', emoji: '🌙', count: 7 },
];

/** Faulty: only this many tiles exist before the rail is scrolled sideways. */
const INITIAL_MOUNTED = 3;
/** Horizontal offset (px) past which the remaining tiles mount. */
const MOUNT_THRESHOLD = 120;

/**
 * X28 · M_HORIZONTAL_LAZY_RAIL — F-TMP-01 Dynamically Rendered Content Outside
 * Viewport. Second observation of the type; hosted on Playlists
 * (M_LONGPRESS_NO_CUE_MUSIC).
 *
 * Mechanism — the content mounts on a HORIZONTAL axis. M_LAZY_SECTION_OUTSIDE_
 * VIEWPORT (F8.1, /shop/recommended) mounts a section once the page is scrolled
 * DOWN: that is the axis every agent already exercises, so the content is at
 * least on a path the agent routinely walks. Here the rail is already fully
 * visible vertically — nothing about the screen suggests it is truncated — and
 * the missing tiles only mount after the rail itself is dragged sideways.
 *
 * The consequence is that vertical scrolling, however exhaustive, never reveals
 * the target. An agent that has scrolled the whole screen top to bottom has
 * legitimately seen every part of the page and can reasonably conclude the
 * "Focus" playlist does not exist. The failure is a confident negative report
 * rather than an incomplete traversal.
 *
 *   Baseline: all 8 tiles are mounted; the rail scrolls but hides nothing.
 *   Faulty:   3 tiles until the rail is dragged past ~120px, then the rest mount.
 *             "Focus" is 7th, so it cannot appear without a sideways drag.
 *
 *   Fails:    vision-only AND text-only (the nodes do not exist until the drag).
 *
 * Isolation: a rail above the host's track list. The host's defect is that adding
 * a track to a playlist is long-press-only on those rows; this task opens a
 * playlist from the rail and never touches a track.
 */
export default function HorizontalLazyRailFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [railMounted, setRailMounted] = useState(false);
  const [opened, setOpened] = useState<Playlist | null>(null);

  const showAll = !faultActive || railMounted;
  const visible = showAll ? PLAYLISTS : PLAYLISTS.slice(0, INITIAL_MOUNTED);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!faultActive || railMounted) return;
    if (e.nativeEvent.contentOffset.x > MOUNT_THRESHOLD) setRailMounted(true);
  };

  return (
    <View style={styles.wrap} testID={faultActive ? 'defect:M_HORIZONTAL_LAZY_RAIL' : undefined}>
      <Text style={styles.heading}>Your playlists</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.rail}
      >
        {visible.map((p) => (
          <Pressable
            key={p.id}
            style={styles.tile}
            onPress={() => setOpened(p)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${p.name} playlist`}
          >
            <View style={styles.tileArt}>
              <Text style={styles.tileEmoji}>{p.emoji}</Text>
            </View>
            <Text style={styles.tileName} numberOfLines={1}>
              {p.name}
            </Text>
            <Text style={styles.tileCount}>{p.count} songs</Text>
          </Pressable>
        ))}
      </ScrollView>

      {opened && (
        <Text style={styles.opened} accessibilityLiveRegion="polite">
          Opened {opened.name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8, paddingBottom: 14 },
  heading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  rail: { paddingHorizontal: 16, gap: 12 },
  tile: { width: 96 },
  tileArt: {
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileEmoji: { fontSize: 34 },
  tileName: { color: '#fff', fontSize: 12, fontWeight: '700', marginTop: 6 },
  tileCount: { color: '#a7a7a7', fontSize: 11, marginTop: 1 },
  opened: { color: '#1db954', fontSize: 13, fontWeight: '700', paddingHorizontal: 16, marginTop: 10 },
});
