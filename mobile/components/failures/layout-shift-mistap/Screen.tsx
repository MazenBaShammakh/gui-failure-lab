import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
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

const FEED: Post[] = [
  { id: 'p0', author: 'Mia Chen', initials: 'MC', time: '2m', text: 'Coffee then code. The usual ☕' },
  { id: 'p1', author: 'Leo Park', initials: 'LP', time: '8m', text: 'New plants for the balcony 🌿' },
  { id: 'p2', author: 'Priya Nair', initials: 'PN', time: '15m', text: 'Sunset over the river tonight.' },
  { id: 'p3', author: 'Tom Becker', initials: 'TB', time: '22m', text: 'Finally fixed that bug. 🎉' },
  { id: 'p4', author: 'Sara Lund', initials: 'SL', time: '31m', text: 'Weekend baking experiments.' },
  { id: 'p5', author: 'Omar Reyes', initials: 'OR', time: '40m', text: 'Caught the early train.' },
  { id: 'p6', author: 'Hana Sato', initials: 'HS', time: '52m', text: 'Reading in the park ☀️' },
];

// Faulty: the promo banner appears ~1.2s after first paint, pushing every post
// down. A like aimed at where the first post was (before the shift) now lands on
// a different post.
const SHIFT_MS = 1200;

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

export default function LayoutShiftMistapScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  // Faulty: banner inserts late. Baseline: banner is present from first render
  // so there is no reflow.
  const [showBanner, setShowBanner] = useState(!faultActive);

  useEffect(() => {
    if (!faultActive) {
      setShowBanner(true);
      return;
    }
    setShowBanner(false);
    const t = setTimeout(() => setShowBanner(true), SHIFT_MS);
    return () => clearTimeout(t);
  }, [faultActive]);

  const toggleLike = useCallback((id: string) => {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const firstPost = FEED[0];
  const likedFirst = !!likes[firstPost.id];

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_LAYOUT_SHIFT_MISTAP' : undefined}
    >
      <Stack.Screen options={{ title: 'Timeline' }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {showBanner && (
          <View style={styles.banner} accessibilityRole="image" accessibilityLabel="Promoted: Summer Sale, up to 50% off">
            <Text style={styles.bannerTitle}>☀️ Summer Sale</Text>
            <Text style={styles.bannerBody}>Up to 50% off — limited time only.</Text>
            <Text style={styles.bannerCta}>Shop now →</Text>
          </View>
        )}

        {FEED.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            liked={!!likes[post.id]}
            onLike={() => toggleLike(post.id)}
          />
        ))}
      </ScrollView>

      {/* Observability: which post actually got liked vs. the intended first post. */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {likedFirst
            ? `Liked the first post (${firstPost.author}). ✓`
            : (() => {
                const wrong = FEED.find((p) => likes[p.id]);
                return wrong
                  ? `Liked ${wrong.author}'s post — not the first post.`
                  : 'Like the first post.';
              })()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { paddingBottom: 8 },

  banner: {
    backgroundColor: '#fff3e0',
    borderColor: '#ffb74d',
    borderWidth: 1,
    margin: 8,
    borderRadius: 12,
    padding: 18,
    gap: 6,
    minHeight: 120,
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#e65100' },
  bannerBody: { fontSize: 14, color: '#bf5b00' },
  bannerCta: { fontSize: 14, fontWeight: '700', color: '#e65100', marginTop: 4 },

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

  statusBar: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusText: { fontSize: 13, color: '#555' },
});
