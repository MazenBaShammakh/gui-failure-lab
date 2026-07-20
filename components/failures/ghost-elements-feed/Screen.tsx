import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Post {
  id: string;
  author: string;
  initials: string;
  time: string;
  text: string;
}

function makeFeed(): Post[] {
  const base: Omit<Post, 'id'>[] = [
    { author: 'Mia Chen', initials: 'MC', time: '2m', text: 'Coffee then code. The usual ☕' },
    { author: 'Leo Park', initials: 'LP', time: '8m', text: 'New plants for the balcony 🌿' },
    { author: 'Priya Nair', initials: 'PN', time: '15m', text: 'Sunset over the river tonight.' },
    { author: 'Tom Becker', initials: 'TB', time: '22m', text: 'Finally fixed that bug. 🎉' },
    { author: 'Sara Lund', initials: 'SL', time: '31m', text: 'Weekend baking experiments.' },
    { author: 'Omar Reyes', initials: 'OR', time: '40m', text: 'Caught the early train.' },
    { author: 'Hana Sato', initials: 'HS', time: '52m', text: 'Reading in the park ☀️' },
    { author: 'Ben Idris', initials: 'BI', time: '1h', text: 'Trying a new ramen spot.' },
    { author: 'Nora Vance', initials: 'NV', time: '1h', text: 'Gallery opening was incredible.' },
    { author: 'Karl Weiss', initials: 'KW', time: '2h', text: 'Cycling the coast road today.' },
    { author: 'Ivy Cole', initials: 'IC', time: '2h', text: 'Repotting succulents again 🪴' },
    { author: 'Sam Okafor', initials: 'SO', time: '3h', text: 'Late night studio session.' },
    // Target — deep in the feed, off-screen at initial render.
    { author: 'Daniel', initials: 'DA', time: '3h', text: 'Just finished the city marathon — 42km done, legs destroyed but so worth it! 🏃‍♂️🏅' },
    { author: 'Lena Frost', initials: 'LF', time: '4h', text: 'Snow finally melting up here.' },
    { author: 'Raj Mehta', initials: 'RM', time: '4h', text: 'New album on repeat all day.' },
    { author: 'Eve Marsh', initials: 'EM', time: '5h', text: 'Farmers market haul 🍅' },
    { author: 'Cody Lin', initials: 'CL', time: '5h', text: 'Soldered my first PCB!' },
    { author: 'Anya Roth', initials: 'AR', time: '6h', text: 'Repainting the kitchen.' },
    { author: 'Theo Blum', initials: 'TB', time: '7h', text: 'Camping trip planning.' },
    { author: 'Gina Ruiz', initials: 'GR', time: '8h', text: 'Adopted a rescue pup 🐶' },
  ];
  return base.map((p, i) => ({ ...p, id: `p${i}` }));
}

const FEED = makeFeed();

interface RowProps {
  post: Post;
  liked: boolean;
  onLike: () => void;
}

function PostCard({ post, liked, onLike }: RowProps) {
  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.initials}</Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.username}>{post.author}</Text>
          <Text style={styles.timestamp}>{post.time} · Public</Text>
        </View>
      </View>
      <Text style={styles.postText}>{post.text}</Text>
      <View style={styles.divider} />
      <View style={styles.actions}>
        <Pressable
          onPress={onLike}
          accessibilityRole="button"
          accessibilityLabel={`${liked ? 'Unlike' : 'Like'} ${post.author}'s post`}
          style={styles.actionBtn}
        >
          <Text style={[styles.actionIcon, liked && styles.likedIcon]}>{liked ? '♥' : '♡'}</Text>
          <Text style={[styles.actionLabel, liked && styles.likedLabel]}>Like</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Comment on ${post.author}'s post`} style={styles.actionBtn}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionLabel}>Comment</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Share ${post.author}'s post`} style={styles.actionBtn}>
          <Text style={styles.actionIcon}>↗</Text>
          <Text style={styles.actionLabel}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function GhostElementsFeedScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  const toggleLike = useCallback((id: string) => {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_GHOST_ELEMENTS_FEED' : undefined}
    >
      <Stack.Screen options={{ title: 'Feed' }} />

      <FlatList
        data={FEED}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} liked={!!likes[item.id]} onLike={() => toggleLike(item.id)} />
        )}
        // Faulty: defeat virtualization so every row (incl. off-screen Daniel's
        // post and its Like button) stays mounted and in the a11y tree.
        // Baseline: healthy virtualization — only nearby rows are mounted.
        removeClippedSubviews={!faultActive}
        windowSize={faultActive ? 41 : 3}
        initialNumToRender={faultActive ? FEED.length : 4}
        maxToRenderPerBatch={faultActive ? FEED.length : 4}
      />

      {/* Faulty extra: a hard off-screen Like widget for a post the user can never
          see — present in the tree at left:-1200, absent from the visible layout. */}
      {faultActive && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Like Daniel's post about the marathon"
          onPress={() => toggleLike('p12')}
          style={styles.ghostWidget}
        >
          <Text style={styles.ghostText}>♡ Like</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },

  post: { backgroundColor: '#fff', marginBottom: 8 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  authorInfo: { flex: 1 },
  username: { fontSize: 15, fontWeight: '700', color: '#111' },
  timestamp: { fontSize: 12, color: '#888', marginTop: 1 },
  postText: { fontSize: 15, color: '#111', lineHeight: 22, paddingHorizontal: 14, paddingBottom: 12 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#e0e0e0', marginHorizontal: 14 },
  actions: { flexDirection: 'row', paddingVertical: 4 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, gap: 4 },
  actionIcon: { fontSize: 20, color: '#555' },
  actionLabel: { fontSize: 12, color: '#555' },
  likedIcon: { color: '#e91e63' },
  likedLabel: { color: '#e91e63' },

  ghostWidget: { position: 'absolute', left: -1200, top: 0, width: 80, height: 40 },
  ghostText: { fontSize: 14, color: '#555' },
});
