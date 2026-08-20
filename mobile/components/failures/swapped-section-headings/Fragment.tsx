import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Rail {
  id: string;
  /** The heading this rail's contents actually belong under. */
  trueHeading: string;
  tracks: { title: string; artist: string; emoji: string }[];
}

const RAILS: Rail[] = [
  {
    id: 'new-releases',
    trueHeading: 'New Releases',
    tracks: [
      { title: 'Vantage', artist: 'Kite Parade', emoji: '🆕' },
      { title: 'Slow Arc', artist: 'Halden', emoji: '🌀' },
      { title: 'Nightbus', artist: 'Ivory Cove', emoji: '🚌' },
    ],
  },
  {
    id: 'made-for-you',
    trueHeading: 'Made for You',
    tracks: [
      { title: 'Ocean Breeze', artist: 'Solar Winds', emoji: '🌊' },
      { title: 'Midnight Reverie', artist: 'Midnight Collective', emoji: '🌙' },
      { title: 'Low Tide', artist: 'Midnight Collective', emoji: '🏖️' },
    ],
  },
];

/**
 * X20 · M_SWAPPED_SECTION_HEADINGS — F-CNT-01 Heading/Label Mismatch Breaks
 * Grounding. Second observation of the type; hosted on Discover
 * (M_DEAD_SEEALL_LINK).
 *
 * Mechanism — two SECTION headings exchanged with each other, while the screen
 * title stays correct. The three observations differ in scope and in which
 * channel is wrong:
 *   · M_HEADING_LABEL_MISMATCH (F6.1, /shop/track): the SCREEN title and heading
 *     are both replaced by an unrelated label. Nothing on the screen matches the
 *     entry point, so the mismatch is loud — the agent can tell it is somewhere
 *     unexpected.
 *   · X20 (here): the screen is correctly titled "Discover" and both headings are
 *     real, plausible, in-domain section names. Only their ASSIGNMENT is swapped.
 *     Every individual element is defensible; the error exists purely in the
 *     mapping, so there is no local signal of it anywhere.
 *   · X21 (/careers/reapply): the pixels are right and only the a11y header node
 *     is wrong — a cross-channel disagreement.
 *
 * Grounding "the top track under New Releases" therefore resolves cleanly and
 * confidently to the wrong track. The agent has no reason to doubt the heading it
 * just matched on.
 *
 *   Baseline: each rail sits under its own heading.
 *   Faulty:   the two headings are exchanged.
 *
 *   Fails:    vision-only AND text-only (both read the same swapped heading).
 *
 * Isolation: its own two rails below the host's sections. The host's defect is
 * the dead "See all ›" link on the Recently Played header; this fragment's rails
 * carry no See-all control, and this task never uses one.
 */
export default function SwappedSectionHeadingsFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [playing, setPlaying] = useState<string | null>(null);

  // Faulty: rail A is rendered beneath rail B's heading and vice versa.
  const headingFor = (index: number) =>
    faultActive ? RAILS[(index + 1) % RAILS.length].trueHeading : RAILS[index].trueHeading;

  return (
    <View testID={faultActive ? 'defect:M_SWAPPED_SECTION_HEADINGS' : undefined}>
      {RAILS.map((rail, i) => (
        <View key={rail.id} style={styles.section}>
          <Text style={styles.sectionHeading} accessibilityRole="header">
            {headingFor(i)}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {rail.tracks.map((t) => (
              <Pressable
                key={t.title}
                style={styles.card}
                onPress={() => setPlaying(`${t.title} — ${t.artist}`)}
                accessibilityRole="button"
                accessibilityLabel={`Play ${t.title} by ${t.artist}`}
              >
                <View style={styles.cardArt}>
                  <Text style={styles.cardArtEmoji}>{t.emoji}</Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {t.title}
                </Text>
                <Text style={styles.cardArtist} numberOfLines={1}>
                  {t.artist}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ))}

      {playing && (
        <Text style={styles.nowPlaying} accessibilityLiveRegion="polite">
          Now playing: {playing}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 18 },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  rail: { paddingHorizontal: 16, gap: 12 },
  card: { width: 110 },
  cardArt: {
    width: 110,
    height: 110,
    borderRadius: 8,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardArtEmoji: { fontSize: 40 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 6 },
  cardArtist: { color: '#a7a7a7', fontSize: 12, marginTop: 2 },
  nowPlaying: {
    color: '#1db954',
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginTop: 16,
  },
});
