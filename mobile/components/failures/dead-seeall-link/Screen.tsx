import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import SwappedSectionHeadings from '@/components/failures/swapped-section-headings';

interface Props {
  faultActive?: boolean;
}

interface Card {
  id: string;
  title: string;
  artist: string;
  emoji: string;
}

interface Section {
  key: string;
  heading: string;
  preview: Card[];
  all: Card[];
}

const SECTIONS: Section[] = [
  {
    key: 'recent',
    heading: 'Recently played',
    preview: [
      { id: 'r1', title: 'Ocean Breeze', artist: 'Solar Winds', emoji: '🎶' },
      { id: 'r2', title: 'Midnight Reverie', artist: 'The Velvet Orchestra', emoji: '🎵' },
      { id: 'r3', title: 'City Lights', artist: 'Neon Pulse', emoji: '🎸' },
    ],
    all: [
      { id: 'r1', title: 'Ocean Breeze', artist: 'Solar Winds', emoji: '🎶' },
      { id: 'r2', title: 'Midnight Reverie', artist: 'The Velvet Orchestra', emoji: '🎵' },
      { id: 'r3', title: 'City Lights', artist: 'Neon Pulse', emoji: '🎸' },
      { id: 'r4', title: 'Mountain Echo', artist: 'Terra Nova', emoji: '🥁' },
      { id: 'r5', title: 'Quiet Harbor', artist: 'Sail & Stone', emoji: '🎹' },
      { id: 'r6', title: 'Afterglow', artist: 'Solar Winds', emoji: '🎺' },
    ],
  },
  {
    key: 'new',
    heading: 'New releases',
    preview: [
      { id: 'n1', title: 'Glass Towers', artist: 'Midnight Collective', emoji: '🎼' },
      { id: 'n2', title: 'Low Tide', artist: 'Dune Walkers', emoji: '🎤' },
      { id: 'n3', title: 'Northern Lights', artist: 'Aurora Field', emoji: '🎷' },
    ],
    all: [
      { id: 'n1', title: 'Glass Towers', artist: 'Midnight Collective', emoji: '🎼' },
      { id: 'n2', title: 'Low Tide', artist: 'Dune Walkers', emoji: '🎤' },
      { id: 'n3', title: 'Northern Lights', artist: 'Aurora Field', emoji: '🎷' },
      { id: 'n4', title: 'Desert Mirage', artist: 'Dune Walkers', emoji: '🪕' },
    ],
  },
];

function CardItem({ card }: { card: Card }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardArt}>
        <Text style={styles.cardArtEmoji}>{card.emoji}</Text>
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {card.title}
      </Text>
      <Text style={styles.cardArtist} numberOfLines={1}>
        {card.artist}
      </Text>
    </View>
  );
}

export default function DeadSeeAllLinkScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handleSeeAll = (key: string) => {
    // Faulty: "See all" is styled like a link but does nothing.
    // Baseline: it expands the section to show every item.
    if (faultActive) return;
    setExpanded((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_DEAD_SEEALL_LINK' : undefined}
    >
      <Stack.Screen options={{ title: 'Discover' }} />

      {SECTIONS.map((section) => {
        const isExpanded = !!expanded[section.key];
        const items = isExpanded ? section.all : section.preview;
        return (
          <View key={section.key} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeading}>{section.heading}</Text>
              {!isExpanded && (
                <Pressable
                  onPress={() => handleSeeAll(section.key)}
                  accessibilityRole="link"
                  accessibilityLabel={`See all ${section.heading.toLowerCase()}`}
                  hitSlop={8}
                >
                  <Text style={styles.seeAll}>See all ›</Text>
                </Pressable>
              )}
            </View>
            <ScrollView
              horizontal={!isExpanded}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={isExpanded ? styles.grid : styles.rowScroll}
            >
              {items.map((card) => (
                <CardItem key={card.id} card={card} />
              ))}
            </ScrollView>
          </View>
        );
      })}

      {/* X20 (F-CNT-01): two further rails whose headings are swapped with each
          other. They carry no "See all" control, so the host's dead-link defect
          is not on this task's path. */}
      <SwappedSectionHeadings />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { paddingVertical: 16 },

  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionHeading: { fontSize: 18, fontWeight: '800', color: '#fff' },
  seeAll: { fontSize: 13, fontWeight: '600', color: '#1db954' },

  rowScroll: { paddingHorizontal: 20, gap: 14 },
  grid: {
    paddingHorizontal: 20,
    gap: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  card: { width: 120, gap: 6 },
  cardArt: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardArtEmoji: { fontSize: 44 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#fff' },
  cardArtist: { fontSize: 12, color: '#999' },
});
