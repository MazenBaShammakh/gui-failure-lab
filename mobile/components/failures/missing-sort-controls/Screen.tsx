import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Photo {
  id: string;
  date: string; // ISO, for sorting
  dateLabel: string;
  emoji: string;
}

// Baseline order: chronological descending (newest first) is the natural
// reading order. Faulty screen renders the SAME set but deliberately out of
// date order, as if inserted by album/import order rather than taken-date.
const PHOTOS_CHRONOLOGICAL: Photo[] = [
  { id: 'p1', date: '2026-07-12', dateLabel: 'Jul 12', emoji: '🌅' },
  { id: 'p2', date: '2026-07-08', dateLabel: 'Jul 8', emoji: '🐕' },
  { id: 'p3', date: '2026-07-03', dateLabel: 'Jul 3', emoji: '🍕' },
  { id: 'p4', date: '2026-06-27', dateLabel: 'Jun 27', emoji: '🏔️' },
  { id: 'p5', date: '2026-06-21', dateLabel: 'Jun 21', emoji: '🎂' },
  { id: 'p6', date: '2026-06-14', dateLabel: 'Jun 14', emoji: '🌊' },
  { id: 'p7', date: '2026-06-09', dateLabel: 'Jun 9', emoji: '🚲' },
  { id: 'p8', date: '2026-05-30', dateLabel: 'May 30', emoji: '🌻' },
  { id: 'p9', date: '2026-05-22', dateLabel: 'May 22', emoji: '🏙️' },
  { id: 'p10', date: '2026-05-16', dateLabel: 'May 16', emoji: '🍦' },
  { id: 'p11', date: '2026-05-11', dateLabel: 'May 11', emoji: '🌷' },
  { id: 'p12', date: '2026-05-05', dateLabel: 'May 5', emoji: '🎣' },
  { id: 'p13', date: '2026-04-29', dateLabel: 'Apr 29', emoji: '🐣' },
  { id: 'p14', date: '2026-04-23', dateLabel: 'Apr 23', emoji: '🌦️' },
  { id: 'p15', date: '2026-04-18', dateLabel: 'Apr 18', emoji: '🎨' },
  { id: 'p16', date: '2026-04-12', dateLabel: 'Apr 12', emoji: '🏞️' },
  { id: 'p17', date: '2026-04-06', dateLabel: 'Apr 6', emoji: '⛺' },
  { id: 'p18', date: '2026-03-31', dateLabel: 'Mar 31', emoji: '🍰' },
  { id: 'p19', date: '2026-03-25', dateLabel: 'Mar 25', emoji: '🎳' },
  { id: 'p20', date: '2026-03-19', dateLabel: 'Mar 19', emoji: '🌸' },
  { id: 'p21', date: '2026-03-13', dateLabel: 'Mar 13', emoji: '🥾' },
  { id: 'p22', date: '2026-03-07', dateLabel: 'Mar 7', emoji: '🎭' },
  { id: 'p23', date: '2026-03-01', dateLabel: 'Mar 1', emoji: '🍜' },
  { id: 'p24', date: '2026-02-23', dateLabel: 'Feb 23', emoji: '❄️' },
  { id: 'p25', date: '2026-02-17', dateLabel: 'Feb 17', emoji: '🎁' },
  { id: 'p26', date: '2026-02-11', dateLabel: 'Feb 11', emoji: '🧗' },
  { id: 'p27', date: '2026-02-05', dateLabel: 'Feb 5', emoji: '🎿' },
  { id: 'p28', date: '2026-01-30', dateLabel: 'Jan 30', emoji: '🕯️' },
  { id: 'p29', date: '2026-01-24', dateLabel: 'Jan 24', emoji: '🌌' },
];

// Scrambled (import) order for the faulty screen. The most recent photo
// (PHOTOS_CHRONOLOGICAL[0]) is deliberately placed second-to-last, not at
// the very end, so it reads as "buried" rather than trivially last.
const PHOTOS_SCRAMBLED: Photo[] = [
  PHOTOS_CHRONOLOGICAL[15],
  PHOTOS_CHRONOLOGICAL[13],
  PHOTOS_CHRONOLOGICAL[16],
  PHOTOS_CHRONOLOGICAL[1],
  PHOTOS_CHRONOLOGICAL[17],
  PHOTOS_CHRONOLOGICAL[2],
  PHOTOS_CHRONOLOGICAL[18],
  PHOTOS_CHRONOLOGICAL[3],
  PHOTOS_CHRONOLOGICAL[19],
  PHOTOS_CHRONOLOGICAL[4],
  PHOTOS_CHRONOLOGICAL[20],
  PHOTOS_CHRONOLOGICAL[5],
  PHOTOS_CHRONOLOGICAL[21],
  PHOTOS_CHRONOLOGICAL[6],
  PHOTOS_CHRONOLOGICAL[22],
  PHOTOS_CHRONOLOGICAL[7],
  PHOTOS_CHRONOLOGICAL[23],
  PHOTOS_CHRONOLOGICAL[8],
  PHOTOS_CHRONOLOGICAL[24],
  PHOTOS_CHRONOLOGICAL[9],
  PHOTOS_CHRONOLOGICAL[25],
  PHOTOS_CHRONOLOGICAL[10],
  PHOTOS_CHRONOLOGICAL[26],
  PHOTOS_CHRONOLOGICAL[11],
  PHOTOS_CHRONOLOGICAL[27],
  PHOTOS_CHRONOLOGICAL[12],
  PHOTOS_CHRONOLOGICAL[28],
  PHOTOS_CHRONOLOGICAL[0],
  PHOTOS_CHRONOLOGICAL[14],
];

export default function MissingSortControlsScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [opened, setOpened] = useState<Photo | null>(null);

  const photos = faultActive ? PHOTOS_SCRAMBLED : PHOTOS_CHRONOLOGICAL;

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_MISSING_SORT_CONTROLS' : undefined}
    >
      <Stack.Screen options={{ title: 'All Photos' }} />

      {opened && (
        <View style={styles.banner} accessibilityLiveRegion="polite">
          <Text style={styles.bannerText}>Opened photo from {opened.dateLabel}</Text>
        </View>
      )}

      {!faultActive ? (
        // Baseline: an explicit, visible sort indicator confirms the grid's
        // order, letting the agent jump straight to the first cell.
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort: Newest first</Text>
        </View>
      ) : null}

      <FlatList
        data={photos}
        keyExtractor={(p) => p.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setOpened(item)}
            accessibilityRole="button"
            accessibilityLabel={`Photo taken ${item.dateLabel}`}
            style={styles.cell}
          >
            <Text style={styles.cellEmoji}>{item.emoji}</Text>
            <Text style={styles.cellDate}>{item.dateLabel}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  banner: { backgroundColor: '#e3f2fd', padding: 14 },
  bannerText: { color: '#1565c0', fontSize: 14, fontWeight: '600' },
  sortRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  sortLabel: { fontSize: 13, fontWeight: '700', color: '#558b2f' },
  grid: { padding: 8 },
  cell: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 10,
    backgroundColor: '#f2f4f2',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  cellEmoji: { fontSize: 32 },
  cellDate: { fontSize: 11, color: '#777', fontWeight: '600' },
});
