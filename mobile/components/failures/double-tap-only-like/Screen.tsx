import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const DOUBLE_TAP_MS = 280;

export default function DoubleTapOnlyLikeScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [liked, setLiked] = useState(false);
  const [burst, setBurst] = useState(false);
  const lastTap = useRef(0);

  const showBurst = () => {
    setLiked(true);
    setBurst(true);
    setTimeout(() => setBurst(false), 600);
  };

  // Faulty: the photo only responds to a double-tap; single taps are inert and
  // there is no visible heart/like button anywhere. Baseline: single taps fall
  // through to the photo (no effect) but a visible heart button likes the photo.
  const onPhotoTap = () => {
    if (!faultActive) return; // baseline: photo tap is inert, the button likes
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      showBurst();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  };

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DOUBLE_TAP_ONLY_LIKE' : undefined}
    >
      <Stack.Screen options={{ title: 'Story' }} />

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JL</Text>
        </View>
        <Text style={styles.headerName}>jenna.lane</Text>
        <Text style={styles.headerTime}>4h</Text>
      </View>

      <Pressable style={styles.photo} onPress={onPhotoTap}>
        <Text style={styles.photoEmoji}>🌅</Text>
        <Text style={styles.photoCaption}>Sunrise over the bay</Text>
        {burst && <Text style={styles.heartBurst}>♥</Text>}
      </Pressable>

      <View style={styles.actionBar}>
        {/* Baseline: a visible, tappable heart button likes the photo.
            Faulty: no heart button at all — liking is double-tap only. */}
        {!faultActive && (
          <Pressable
            onPress={() => (liked ? setLiked(false) : showBurst())}
            accessibilityRole="button"
            accessibilityLabel={liked ? 'Unlike' : 'Like'}
            style={styles.likeBtn}
            hitSlop={8}
          >
            <Text style={[styles.likeIcon, liked && styles.likedIcon]}>
              {liked ? '♥' : '♡'}
            </Text>
          </Pressable>
        )}
        <Text style={styles.likeCount}>{liked ? '1,429' : '1,428'} likes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e1306c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  headerName: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' },
  headerTime: { color: '#bbb', fontSize: 13 },
  photo: {
    flex: 1,
    backgroundColor: '#15202b',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  photoEmoji: { fontSize: 96 },
  photoCaption: { color: '#cfd9e0', fontSize: 15 },
  heartBurst: {
    position: 'absolute',
    fontSize: 120,
    color: 'rgba(255,255,255,0.92)',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  likeBtn: { padding: 2 },
  likeIcon: { fontSize: 30, color: '#fff' },
  likedIcon: { color: '#e1306c' },
  likeCount: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
