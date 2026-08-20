import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

/**
 * X03 · M_OVERLOADED_ICON_ALBUM_MORE — F-IDT-03 Overloaded Icon (Multiple
 * Purposes). Second observation of the type; hosted on the Album screen
 * (M_DUPLICATE_ACCESSIBLE_NAME).
 *
 * Mechanism (distinct from M_OVERLOADED_ICON_SEARCH_COMPOSE · F2.3,
 * /mail/toolbar): there, one icon fires two DIFFERENT features depending on where
 * you tap it. Here a single "⋯ More" button changes what it does based on state
 * the UI never surfaces:
 *
 *   queue empty     -> pressing it queues the whole album
 *   queue non-empty -> pressing it opens the options menu
 *
 * Both behaviours ship under one glyph and one accessible name ("More"), so
 * nothing in either channel says the control can queue anything. An agent asked
 * to add the album to the queue finds no affordance matching the goal; the only
 * route to success is pressing a generically-named button and hoping.
 *
 *   Baseline: the two purposes are split into two controls — "Add album to queue"
 *             (＋) and "More options" (⋯) — each named for exactly what it does.
 *   Faulty:   one ⋯ labelled "More", dispatching on hidden state.
 *
 *   Fails:    vision-only AND text-only (the name is uninformative in both).
 *
 * Isolation: lives in the album header. The host's defect is on the track rows
 * below (every "Intro" row sharing one accessible name); this task never taps a
 * track, and the host's task never uses the header.
 */
export default function OverloadedIconAlbumMoreFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [queued, setQueued] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const queueAlbum = () => {
    setQueued(true);
    setMenuOpen(false);
  };

  // The overloaded handler: same button, two jobs, switched by invisible state.
  const onMorePress = () => {
    if (!queued) {
      queueAlbum();
      return;
    }
    setMenuOpen((prev) => !prev);
  };

  return (
    <View
      style={styles.wrap}
      testID={faultActive ? 'defect:M_OVERLOADED_ICON_ALBUM_MORE' : undefined}
    >
      <View style={styles.actionRow}>
        {faultActive ? (
          <Pressable
            onPress={onMorePress}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="More"
          >
            <Text style={styles.iconGlyph}>⋯</Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={queueAlbum}
              style={styles.labelledBtn}
              accessibilityRole="button"
              accessibilityLabel="Add album to queue"
            >
              <Text style={styles.labelledBtnText}>＋ Add to queue</Text>
            </Pressable>
            <Pressable
              onPress={() => setMenuOpen((prev) => !prev)}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="More options"
            >
              <Text style={styles.iconGlyph}>⋯</Text>
            </Pressable>
          </>
        )}
      </View>

      {queued && (
        <Text style={styles.queuedNote} accessibilityLiveRegion="polite">
          ✓ Night Sessions added to your queue
        </Text>
      )}

      {menuOpen && (
        <View style={styles.menu}>
          <Text style={styles.menuItem}>Go to artist</Text>
          <Text style={styles.menuItem}>Share album</Text>
          <Text style={styles.menuItem}>Download</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginBottom: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#242424',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGlyph: { color: '#e8e8e8', fontSize: 20, fontWeight: '700', marginTop: -6 },
  labelledBtn: {
    backgroundColor: '#1db954',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  labelledBtnText: { color: '#04170b', fontSize: 14, fontWeight: '800' },
  queuedNote: { color: '#1db954', fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 10 },
  menu: {
    marginTop: 10,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    paddingVertical: 6,
  },
  menuItem: { color: '#ddd', fontSize: 14, paddingHorizontal: 14, paddingVertical: 9 },
});
