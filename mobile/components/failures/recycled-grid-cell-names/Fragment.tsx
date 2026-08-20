import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Cell {
  id: string;
  caption: string;
  emoji: string;
  tint: string;
}

// 24 cells = 8 rows of 3. The caption is the ONLY per-cell identifier: no date,
// no secondary line, nothing else to cross-check a name against.
const CELLS: Cell[] = [
  { id: 'a01', caption: 'Cliff path', emoji: '🧗', tint: '#cfd8dc' },
  { id: 'a02', caption: 'Market stall', emoji: '🥬', tint: '#dcedc8' },
  { id: 'a03', caption: 'Ferry deck', emoji: '⛴️', tint: '#b3e5fc' },
  { id: 'a04', caption: 'Night market', emoji: '🏮', tint: '#ffccbc' },
  { id: 'a05', caption: 'Snow fence', emoji: '🌨️', tint: '#e1f5fe' },
  { id: 'a06', caption: 'Olive grove', emoji: '🫒', tint: '#dcedc8' },
  { id: 'a07', caption: 'Tram stop', emoji: '🚊', tint: '#ffe0b2' },
  { id: 'a08', caption: 'Bakery window', emoji: '🥐', tint: '#ffe082' },
  { id: 'a09', caption: 'Church steps', emoji: '⛪', tint: '#d7ccc8' },
  { id: 'a10', caption: 'Vineyard row', emoji: '🍇', tint: '#e1bee7' },
  { id: 'a11', caption: 'Fishing nets', emoji: '🎣', tint: '#b2dfdb' },
  { id: 'a12', caption: 'Roof terrace', emoji: '🏙️', tint: '#c5cae9' },
  { id: 'a13', caption: 'Stone bridge', emoji: '🌉', tint: '#bcaaa4' },
  { id: 'a14', caption: 'Lantern alley', emoji: '🏮', tint: '#ffcdd2' },
  { id: 'a15', caption: 'Salt flats', emoji: '🧂', tint: '#eceff1' },
  { id: 'a16', caption: 'Harbour cranes', emoji: '🏗️', tint: '#ffe0b2' },
  { id: 'a17', caption: 'Cable car', emoji: '🚡', tint: '#b39ddb' },
  { id: 'a18', caption: 'Dune grass', emoji: '🌾', tint: '#f0f4c3' },
  { id: 'a19', caption: 'Ice rink', emoji: '⛸️', tint: '#e3f2fd' },
  { id: 'a20', caption: 'Spice sacks', emoji: '🧡', tint: '#ffe0b2' },
  { id: 'a21', caption: 'Boat yard', emoji: '⛵', tint: '#b2ebf2' },
  { id: 'a22', caption: 'Clock tower', emoji: '🕰️', tint: '#d1c4e9' },
  { id: 'a23', caption: 'Reed beds', emoji: '🌿', tint: '#c8e6c9' },
  { id: 'a24', caption: 'Quarry pool', emoji: '🪨', tint: '#cfd8dc' },
];

// A grid keeps roughly one screenful of cell objects alive: 3 columns x 3 rows.
const RECYCLE_POOL = 9;

const TARGET_ID = 'a16';

/**
 * X16 · M_RECYCLED_GRID_CELL_NAMES — F-STR-01 Recycled-View Stale Accessible
 * Name. Second observation of the type; hosted on the Photos library
 * (M_PULL_TO_REFRESH_ONLY).
 *
 * Mechanism — recycling in a 2-D GRID, which camouflages the corruption in a way
 * the 1-D case cannot. M_RECYCLED_NODE_IDENTITY (A5, /tasks/longlist) recycles
 * list rows through a pool of 7: the stale names appear in a 7-long cycle down a
 * single column of text, where an unexpected repeat reads as obviously wrong.
 * Here the pool is one screenful of grid cells (9 = 3x3), so a stale name recurs
 * at the SAME COLUMN POSITION every third row. In a photo grid that pattern is
 * indistinguishable from a legitimate one — several shots of the same subject,
 * imported together and laid out near each other.
 *
 * So the artefact does not read as corruption; it reads as a plausible library.
 * A text-only agent looking for "Harbour cranes" finds a node with that name (the
 * pool slot's original tenant, several rows above the real cell), acts on it, and
 * opens the wrong photo — with a confident, well-formed result.
 *
 *   Baseline: each cell's accessible name is its own caption.
 *   Faulty:   name = CELLS[index % 9].caption — the slot's first tenant. The
 *             visible caption is rebound correctly, so the pixels stay truthful.
 *
 *   Fails:    text-only (no node is named for the real target cell).
 *   Succeeds: vision-only (captions are drawn correctly under each tile).
 *
 * Isolation: its own "All photos" section, rendered as the host list's footer.
 * It deliberately does NOT recycle the host's Recents grid — that grid carries
 * the host's own region-scoped defect, and a second region defect on the same
 * list would confound attribution (plan §4 Rule C) and would break the host's
 * task, which grounds on the caption "Sunset at the pier".
 */
export default function RecycledGridCellNamesFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [opened, setOpened] = useState<Cell | null>(null);

  return (
    <View style={styles.wrap} testID={faultActive ? 'defect:M_RECYCLED_GRID_CELL_NAMES' : undefined}>
      <Text style={styles.heading}>All photos</Text>

      {opened && (
        <Text
          style={[styles.opened, opened.id !== TARGET_ID && styles.openedWrong]}
          accessibilityLiveRegion="polite"
        >
          Opened: {opened.caption}
        </Text>
      )}

      <View style={styles.grid}>
        {CELLS.map((cell, index) => {
          const slot = index % RECYCLE_POOL;
          // Stable per-item identity vs. recycled pool-slot identity.
          const cellId = faultActive ? `rv_cell_${slot}` : `photo_${cell.id}`;
          // Faulty: the recycled cell's accessible name was never rebound.
          const a11yName = faultActive ? CELLS[slot].caption : cell.caption;

          return (
            <Pressable
              key={cell.id}
              nativeID={cellId}
              style={[styles.tile, { backgroundColor: cell.tint }]}
              onPress={() => setOpened(cell)}
              accessibilityRole="imagebutton"
              accessibilityLabel={`Photo: ${a11yName}`}
            >
              {/* Decorative for accessibility: the tile is a single collapsed
                  node whose only name is the (possibly stale) label above, while
                  these pixels show the real, current photo. */}
              <Text
                style={styles.tileEmoji}
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
              >
                {cell.emoji}
              </Text>
              <Text
                style={styles.tileCaption}
                numberOfLines={1}
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
              >
                {cell.caption}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 8, paddingTop: 18, paddingBottom: 24 },
  heading: { fontSize: 15, fontWeight: '800', color: '#111', paddingHorizontal: 8, marginBottom: 8 },
  opened: {
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: '700',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  openedWrong: { color: '#555' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: {
    width: '31.5%',
    aspectRatio: 1,
    margin: '0.9%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  tileEmoji: { fontSize: 26 },
  tileCaption: { fontSize: 10, color: '#37474f', fontWeight: '700', textAlign: 'center' },
});
