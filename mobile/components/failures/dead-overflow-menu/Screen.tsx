import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const MENU_ITEMS = [
  { label: 'Save post', icon: '🔖' },
  { label: 'Turn on notifications', icon: '🔔' },
  { label: 'Copy link', icon: '🔗' },
  { label: 'Report post', icon: '🚩' },
  { label: 'Hide post', icon: '🚫' },
];

export default function DeadOverflowMenuScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [menuOpen, setMenuOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  // Faulty: the overflow handler is inert — the options menu never opens.
  // Baseline: tapping ⋯ opens an options bottom sheet.
  const openMenu = () => {
    if (faultActive) return;
    setMenuOpen(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Post' }} />

      <View
        testID={faultActive ? 'defect:M_DEAD_OVERFLOW_MENU' : undefined}
        style={styles.post}
      >
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>LP</Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.username}>Leo Park</Text>
            <Text style={styles.timestamp}>1 hour ago · Public</Text>
          </View>
          <Pressable
            onPress={openMenu}
            accessibilityRole="button"
            accessibilityLabel="Post options"
            style={styles.moreBtn}
            hitSlop={8}
          >
            <Text style={styles.moreBtnText}>⋯</Text>
          </Pressable>
        </View>

        <Text style={styles.postText}>
          Spent the weekend rebuilding the balcony garden. New herbs, new pots, and
          way too much soil under my fingernails. Worth it. 🌿
        </Text>

        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoEmoji}>🪴</Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statsText}>96 likes · 21 comments</Text>
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
          <Pressable accessibilityRole="button" accessibilityLabel="Comment" style={styles.actionBtn}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionLabel}>Comment</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Share post" style={styles.actionBtn}>
            <Text style={styles.actionIcon}>↗</Text>
            <Text style={styles.actionLabel}>Share</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setMenuOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.label}
                style={styles.sheetRow}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => setMenuOpen(false)}
              >
                <Text style={styles.sheetIcon}>{item.icon}</Text>
                <Text style={styles.sheetLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  content: { padding: 0, paddingBottom: 48 },
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
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  authorInfo: { flex: 1 },
  username: { fontSize: 15, fontWeight: '700', color: '#111' },
  timestamp: { fontSize: 12, color: '#888', marginTop: 1 },
  moreBtn: { padding: 8 },
  moreBtnText: { fontSize: 22, color: '#555' },
  postText: { fontSize: 15, color: '#111', lineHeight: 22, paddingHorizontal: 14, paddingBottom: 12 },
  photoPlaceholder: {
    height: 200,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoEmoji: { fontSize: 64 },
  statsRow: { paddingHorizontal: 14, paddingVertical: 10 },
  statsText: { fontSize: 13, color: '#666' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#e0e0e0', marginHorizontal: 14 },
  actions: { flexDirection: 'row', paddingVertical: 4 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, gap: 4 },
  actionIcon: { fontSize: 20, color: '#555' },
  actionLabel: { fontSize: 12, color: '#555' },
  likedIcon: { color: '#e91e63' },
  likedLabel: { color: '#e91e63' },

  sheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 8,
    paddingBottom: 28,
    paddingHorizontal: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  sheetIcon: { fontSize: 20 },
  sheetLabel: { fontSize: 16, color: '#222' },
});
