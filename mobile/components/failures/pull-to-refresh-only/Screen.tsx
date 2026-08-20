import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import RecycledGridCellNames from '@/components/failures/recycled-grid-cell-names';

interface Photo {
  id: string;
  label: string;
  emoji: string;
  tint: string;
  takenAt: string;
}

// The newest photo (top-left in a real gallery). In faulty mode it is withheld
// until the user pull-to-refreshes; in baseline it is already present.
const NEWEST: Photo = {
  id: 'p-new',
  label: 'Sunset at the pier',
  emoji: '🌇',
  tint: '#ffe0b2',
  takenAt: 'Just now',
};

const EXISTING_PHOTOS: Photo[] = [
  { id: 'p1', label: 'Mountain hike', emoji: '⛰️', tint: '#c8e6c9', takenAt: 'Yesterday' },
  { id: 'p2', label: 'Coffee art', emoji: '☕', tint: '#d7ccc8', takenAt: 'Yesterday' },
  { id: 'p3', label: 'City lights', emoji: '🌃', tint: '#b39ddb', takenAt: '2 days ago' },
  { id: 'p4', label: 'Beach day', emoji: '🏖️', tint: '#b3e5fc', takenAt: '3 days ago' },
  { id: 'p5', label: 'Garden bloom', emoji: '🌸', tint: '#f8bbd0', takenAt: '3 days ago' },
  { id: 'p6', label: 'Pasta night', emoji: '🍝', tint: '#ffe082', takenAt: '4 days ago' },
  { id: 'p7', label: 'Forest trail', emoji: '🌲', tint: '#a5d6a7', takenAt: '5 days ago' },
  { id: 'p8', label: 'Rainy window', emoji: '🌧️', tint: '#90caf9', takenAt: '6 days ago' },
  { id: 'p9', label: 'Old bookshelf', emoji: '📚', tint: '#bcaaa4', takenAt: '1 week ago' },
];

interface Props {
  faultActive?: boolean;
}

export default function PullToRefreshOnlyScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  // Baseline: newest photo is already loaded at the front of the grid.
  // Faulty:   newest photo is missing until a pull-to-refresh fetches it, and
  //           there is no button or hint that it exists.
  const [hasNewest, setHasNewest] = useState(!faultActive);
  const [refreshing, setRefreshing] = useState(false);
  const [openPhoto, setOpenPhoto] = useState<Photo | null>(null);

  const photos = hasNewest ? [NEWEST, ...EXISTING_PHOTOS] : EXISTING_PHOTOS;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setHasNewest(true);
      setRefreshing(false);
    }, 700);
  }, []);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_PULL_TO_REFRESH_ONLY' : undefined}
    >
      <Stack.Screen options={{ title: 'Photos' }} />

      <View style={styles.header}>
        <Text style={styles.title}>Recents</Text>
        <Text style={styles.count}>{photos.length} photos</Text>
      </View>

      {/* Baseline provides an explicit Refresh button so fetching the newest
          photo never depends on a hidden gesture. Faulty mode omits it. */}
      {!faultActive && (
        <Pressable
          style={styles.refreshButton}
          onPress={onRefresh}
          accessibilityRole="button"
          accessibilityLabel="Refresh photos"
        >
          <Text style={styles.refreshButtonText}>↻ Refresh</Text>
        </Pressable>
      )}

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#555" />
        }
        // X16 (F-STR-01): a separate "All photos" grid appended as the footer.
        // It deliberately does NOT recycle the Recents grid above — that grid
        // carries this screen's own defect, and stale names there would also
        // break the host task, which grounds on "Sunset at the pier".
        ListFooterComponent={<RecycledGridCellNames />}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.tile, { backgroundColor: item.tint }]}
            onPress={() => setOpenPhoto(item)}
            accessibilityRole="imagebutton"
            accessibilityLabel={`Photo: ${item.label}, taken ${item.takenAt}`}
          >
            <Text style={styles.tileEmoji}>{item.emoji}</Text>
            {item.id === NEWEST.id && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </Pressable>
        )}
      />

      <Modal visible={openPhoto !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={[styles.modalImage, { backgroundColor: openPhoto?.tint }]}>
              <Text style={styles.modalEmoji}>{openPhoto?.emoji}</Text>
            </View>
            <Text style={styles.modalLabel}>{openPhoto?.label}</Text>
            <Text style={styles.modalMeta}>{openPhoto?.takenAt}</Text>
            <Pressable
              style={styles.modalClose}
              onPress={() => setOpenPhoto(null)}
              accessibilityRole="button"
              accessibilityLabel="Close photo"
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#111' },
  count: { fontSize: 13, color: '#999' },
  refreshButton: {
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  refreshButtonText: { fontSize: 14, fontWeight: '600', color: '#3949ab' },
  grid: { padding: 6 },
  gridRow: { gap: 6 },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    margin: 3,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tileEmoji: { fontSize: 36 },
  newBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#e53935',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  modalImage: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalEmoji: { fontSize: 80 },
  modalLabel: { fontSize: 18, fontWeight: '700', color: '#111' },
  modalMeta: { fontSize: 13, color: '#999' },
  modalClose: {
    marginTop: 6,
    backgroundColor: '#111',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalCloseText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
