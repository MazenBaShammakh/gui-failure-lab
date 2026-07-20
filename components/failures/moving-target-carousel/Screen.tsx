import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Story {
  id: string;
  name: string;
  initials: string;
  tint: string;
}

const STORIES: Story[] = [
  { id: 's1', name: 'Mia', initials: 'MC', tint: '#f06292' },
  { id: 's2', name: 'Leo', initials: 'LP', tint: '#4fc3f7' },
  { id: 's3', name: 'Priya', initials: 'PN', tint: '#9575cd' },
  { id: 's4', name: 'Tom', initials: 'TB', tint: '#4db6ac' },
  { id: 's5', name: 'Sara', initials: 'SL', tint: '#ffb74d' },
  { id: 's6', name: 'Omar', initials: 'OR', tint: '#7986cb' },
  { id: 's7', name: 'Hana', initials: 'HS', tint: '#a1887f' },
];

const ADVANCE_MS = 1200;

export default function MovingTargetCarouselScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [opened, setOpened] = useState<Story | null>(null);
  const offsetRef = useRef(0);
  const scrollRef = useRef<ScrollView>(null);

  // Faulty: the strip auto-advances on a ~1.2s timer, scrolling stories out of
  // position. The "3rd story" node persists at its stale index but slides under
  // the agent before it can act, so a tap aimed at the original position lands
  // on whatever story has rotated into view. Baseline: static until tapped.
  useEffect(() => {
    if (!faultActive || opened) return;
    const t = setInterval(() => {
      const next = offsetRef.current + 1 >= STORIES.length ? 0 : offsetRef.current + 1;
      offsetRef.current = next;
      scrollRef.current?.scrollTo({ x: next * 92, animated: true });
    }, ADVANCE_MS);
    return () => clearInterval(t);
  }, [faultActive, opened]);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_MOVING_TARGET_CAROUSEL' : undefined}
    >
      <Stack.Screen options={{ title: 'Stories' }} />

      <Text style={styles.heading}>Stories</Text>
      <View style={styles.stripWrap}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.strip}
        >
          {STORIES.map((s, i) => (
            <Pressable
              key={s.id}
              onPress={() => setOpened(s)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${s.name}'s story`}
              style={styles.storyItem}
            >
              <View style={[styles.ring, { borderColor: s.tint }]}>
                <View style={[styles.storyAvatar, { backgroundColor: s.tint }]}>
                  <Text style={styles.storyInitials}>{s.initials}</Text>
                </View>
              </View>
              <Text style={styles.storyName} numberOfLines={1}>
                {s.name}
              </Text>
              <Text style={styles.storyIndex}>{i + 1}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.feedNote}>
        <Text style={styles.feedNoteText}>
          {opened
            ? `Opened ${opened.name}'s story (#${STORIES.findIndex((s) => s.id === opened.id) + 1}).`
            : 'Tap a story to open it.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  heading: { fontSize: 18, fontWeight: '700', color: '#111', padding: 16, paddingBottom: 8 },
  stripWrap: { backgroundColor: '#fff', paddingVertical: 12 },
  strip: { paddingHorizontal: 12, gap: 8 },
  storyItem: { width: 84, alignItems: 'center', gap: 4 },
  ring: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyInitials: { color: '#fff', fontWeight: '700', fontSize: 18 },
  storyName: { fontSize: 12, color: '#333', maxWidth: 80 },
  storyIndex: { fontSize: 11, color: '#aaa' },
  feedNote: { padding: 20 },
  feedNoteText: { fontSize: 14, color: '#555' },
});
