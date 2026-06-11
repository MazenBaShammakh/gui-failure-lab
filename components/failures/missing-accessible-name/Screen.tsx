import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';

interface Props {
  faultActive?: boolean;
}

export default function MissingAccessibleNameScreen({ faultActive = false }: Props) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Post' }} />

      <View
        testID={faultActive ? 'defect:M_MISSING_ACCESSIBLE_NAME' : undefined}
        style={styles.post}
      >
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AK</Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.username}>Anna Kovacs</Text>
            <Text style={styles.timestamp}>2 hours ago · Public</Text>
          </View>
          {/* "More options" button — missing label in faulty mode */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={faultActive ? undefined : 'More options'}
            style={styles.moreBtn}
          >
            <Text style={styles.moreBtnText}>···</Text>
          </Pressable>
        </View>

        <Text style={styles.postText}>
          Just finished hiking the Karwendel Trail. The views were absolutely breathtaking — highly recommend for anyone visiting Bavaria this summer! 🏔️
        </Text>

        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoEmoji}>🏔️</Text>
          <Text style={styles.photoCaption}>Karwendel Trail, Bavaria</Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statsText}>128 likes · 34 comments · 12 shares</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.actions}>
          <Pressable
            onPress={() => setLiked((l) => !l)}
            accessibilityRole="button"
            accessibilityLabel={liked ? 'Unlike' : 'Like'}
            style={styles.actionBtn}
          >
            <Text style={[styles.actionIcon, liked && styles.likedIcon]}>{liked ? '♥' : '♡'}</Text>
            <Text style={[styles.actionLabel, liked && styles.likedLabel]}>Like</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Comment"
            style={styles.actionBtn}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionLabel}>Comment</Text>
          </Pressable>

          {/* Share — missing accessibilityLabel in faulty mode */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={faultActive ? undefined : 'Share post'}
            style={styles.actionBtn}
          >
            <Text style={styles.actionIcon}>↗</Text>
            <Text style={styles.actionLabel}>Share</Text>
          </Pressable>

          <Pressable
            onPress={() => setBookmarked((b) => !b)}
            accessibilityRole="button"
            accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark post'}
            style={styles.actionBtn}
          >
            <Text style={[styles.actionIcon, bookmarked && styles.bookmarkedIcon]}>
              {bookmarked ? '🔖' : '🏷'}
            </Text>
            <Text style={styles.actionLabel}>Save</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  content: { padding: 0, paddingBottom: 48 },
  post: { backgroundColor: '#fff', marginBottom: 8 },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  authorInfo: { flex: 1 },
  username: { fontSize: 15, fontWeight: '700', color: '#111' },
  timestamp: { fontSize: 12, color: '#888', marginTop: 1 },
  moreBtn: { padding: 8 },
  moreBtnText: { fontSize: 18, color: '#555', letterSpacing: 2 },
  postText: { fontSize: 15, color: '#111', lineHeight: 22, paddingHorizontal: 14, paddingBottom: 12 },
  photoPlaceholder: {
    height: 220,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  photoEmoji: { fontSize: 60 },
  photoCaption: { fontSize: 13, color: '#555' },
  statsRow: { paddingHorizontal: 14, paddingVertical: 10 },
  statsText: { fontSize: 13, color: '#666' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#e0e0e0', marginHorizontal: 14 },
  actions: { flexDirection: 'row', paddingVertical: 4 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, gap: 4 },
  actionIcon: { fontSize: 20, color: '#555' },
  actionLabel: { fontSize: 12, color: '#555' },
  likedIcon: { color: '#e91e63' },
  likedLabel: { color: '#e91e63' },
  bookmarkedIcon: { color: '#1877f2' },
});
