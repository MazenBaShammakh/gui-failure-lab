import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  type AccessibilityActionEvent,
} from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
}

const TRACKS: Track[] = [
  { id: '1', title: 'Ocean Breeze', artist: 'Solar Winds', duration: '4:12' },
  { id: '2', title: 'Mountain Echo', artist: 'Terra Nova', duration: '3:47' },
  { id: '3', title: 'City Lights', artist: 'Neon Pulse', duration: '5:01' },
  { id: '4', title: 'Desert Mirage', artist: 'Dune Walkers', duration: '4:33' },
  { id: '5', title: 'Northern Lights', artist: 'Aurora Field', duration: '6:08' },
  { id: '6', title: 'Quiet Harbor', artist: 'Sail & Stone', duration: '3:21' },
];

// ─── TrackRow ─────────────────────────────────────────────────────────────────

interface RowProps {
  track: Track;
  faultActive: boolean;
  onOpenMenu: () => void;
}

function TrackRow({ track, faultActive, onOpenMenu }: RowProps) {
  const handleA11yAction = useCallback(
    (e: AccessibilityActionEvent) => {
      if (e.nativeEvent.actionName === 'more') onOpenMenu();
    },
    [onOpenMenu],
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.trackRow, pressed && styles.trackRowPressed]}
      // Faulty: the ONLY pointer affordance is long-press (no ⋯ button, no hint).
      // Baseline keeps long-press too but ALSO renders the visible ⋯ button below.
      onLongPress={onOpenMenu}
      delayLongPress={500}
      accessibilityRole="button"
      accessibilityLabel={`${track.title} by ${track.artist}`}
      // Custom a11y action is ALWAYS present so a tree-reading multimodal agent can
      // fire "More actions" even in faulty mode where no visible affordance exists.
      accessibilityActions={[{ name: 'more', label: 'More actions' }]}
      onAccessibilityAction={handleA11yAction}
    >
      <View style={styles.art}>
        <Text style={styles.artEmoji}>🎵</Text>
      </View>
      <View style={styles.trackBody}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
      <Text style={styles.trackDuration}>{track.duration}</Text>

      {/* Baseline only: a discoverable ⋯ button that opens the same sheet.
          Faulty: removed entirely — only long-press / custom a11y action remain. */}
      {!faultActive && (
        <Pressable
          onPress={onOpenMenu}
          style={styles.moreBtn}
          accessibilityRole="button"
          accessibilityLabel={`More actions for ${track.title}`}
          hitSlop={12}
        >
          <Text style={styles.moreBtnText}>⋯</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LongPressNoCueMusicScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [menuTrackId, setMenuTrackId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const menuTrack = TRACKS.find((t) => t.id === menuTrackId) ?? null;
  const openMenu = useCallback((id: string) => setMenuTrackId(id), []);
  const closeMenu = useCallback(() => setMenuTrackId(null), []);

  const handleAddToPlaylist = useCallback(() => {
    if (menuTrack) setStatus(`Added "${menuTrack.title}" to a playlist`);
    closeMenu();
  }, [menuTrack, closeMenu]);

  const handleGoToAlbum = useCallback(() => {
    if (menuTrack) setStatus(`Opened album for "${menuTrack.title}"`);
    closeMenu();
  }, [menuTrack, closeMenu]);

  const handleDownload = useCallback(() => {
    if (menuTrack) setStatus(`Downloading "${menuTrack.title}"`);
    closeMenu();
  }, [menuTrack, closeMenu]);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_LONGPRESS_NO_CUE_MUSIC' : undefined}
    >
      <Stack.Screen options={{ title: 'Chill Vibes' }} />

      <View style={styles.playlistHeader}>
        <View style={styles.playlistCover}>
          <Text style={styles.playlistCoverEmoji}>🎧</Text>
        </View>
        <View style={styles.playlistMeta}>
          <Text style={styles.playlistName}>Chill Vibes</Text>
          <Text style={styles.playlistSub}>{TRACKS.length} songs · 27 min</Text>
        </View>
      </View>

      {status && (
        <View style={styles.statusBar} accessibilityLiveRegion="polite">
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}

      <FlatList
        data={TRACKS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrackRow
            track={item}
            faultActive={faultActive}
            onOpenMenu={() => openMenu(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={menuTrackId !== null}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
        accessibilityViewIsModal
      >
        <Pressable
          style={styles.overlay}
          onPress={closeMenu}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        >
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {menuTrack?.title}
            </Text>
            <View style={styles.sheetDivider} />

            <Pressable
              style={styles.sheetOption}
              onPress={handleAddToPlaylist}
              accessibilityRole="button"
              accessibilityLabel="Add to playlist"
            >
              <Text style={styles.sheetOptionIcon}>➕</Text>
              <Text style={styles.sheetOptionText}>Add to playlist</Text>
            </Pressable>

            <Pressable
              style={styles.sheetOption}
              onPress={handleGoToAlbum}
              accessibilityRole="button"
              accessibilityLabel="Go to album"
            >
              <Text style={styles.sheetOptionIcon}>💿</Text>
              <Text style={styles.sheetOptionText}>Go to album</Text>
            </Pressable>

            <Pressable
              style={styles.sheetOption}
              onPress={handleDownload}
              accessibilityRole="button"
              accessibilityLabel="Download"
            >
              <Text style={styles.sheetOptionIcon}>⬇️</Text>
              <Text style={styles.sheetOptionText}>Download</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },

  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  playlistCover: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistCoverEmoji: { fontSize: 44 },
  playlistMeta: { flex: 1, gap: 4 },
  playlistName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  playlistSub: { fontSize: 13, color: '#999' },

  statusBar: {
    backgroundColor: '#173a26',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statusText: { color: '#5ee08a', fontSize: 13, fontWeight: '600' },

  listContent: { paddingVertical: 4 },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#222',
    marginLeft: 76,
  },

  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 14,
  },
  trackRowPressed: { backgroundColor: '#1a1a1a' },
  art: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artEmoji: { fontSize: 22 },
  trackBody: { flex: 1, gap: 3 },
  trackTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },
  trackArtist: { fontSize: 13, color: '#999' },
  trackDuration: { fontSize: 12, color: '#666' },
  moreBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreBtnText: { fontSize: 22, color: '#aaa', lineHeight: 24 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  sheetTitle: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#333' },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  sheetOptionIcon: { fontSize: 18, width: 26, textAlign: 'center' },
  sheetOptionText: { fontSize: 16, color: '#fff' },
});
