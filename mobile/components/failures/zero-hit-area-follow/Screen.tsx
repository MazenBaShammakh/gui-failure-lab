import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import ActionHiddenAmongSiblings from '@/components/failures/action-hidden-among-siblings';

interface Props {
  faultActive?: boolean;
}

export default function ZeroHitAreaFollowScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [following, setFollowing] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Profile' }} />

      <View
        testID={faultActive ? 'defect:M_ZERO_HIT_AREA_FOLLOW' : undefined}
        style={styles.card}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AK</Text>
        </View>
        <Text style={styles.name}>Anna Kovacs</Text>
        <Text style={styles.handle}>@annak</Text>
        <Text style={styles.bio}>
          Landscape photographer · Munich. Sharing the mountains one frame at a time. 🏔️
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>842</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>12.4k</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>318</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* X10 (F-PRC-03): profile action row. The host's defect is the 0x0 hit
            area on the Follow button below, which this task never presses. */}
        <ActionHiddenAmongSiblings />

        {/*
          Baseline: a normal full-width, tappable Follow button.
          Faulty: the Pressable is sized 0×0 (width:0,height:0) while the label
          text overflows visibly outside it (overflow:'visible'). The word
          "Follow" is fully readable, but the actual touch target has no area,
          so taps on the visible text never land on the button.
        */}
        {faultActive ? (
          <View style={styles.followSlotFaulty}>
            <Pressable
              onPress={() => setFollowing((f) => !f)}
              accessibilityRole="button"
              accessibilityLabel={following ? 'Following Anna Kovacs' : 'Follow Anna Kovacs'}
              style={styles.followBtnZero}
            >
              <Text style={styles.followLabelOverflow}>
                {following ? 'Following' : 'Follow'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setFollowing((f) => !f)}
            accessibilityRole="button"
            accessibilityLabel={following ? 'Following Anna Kovacs' : 'Follow Anna Kovacs'}
            style={({ pressed }) => [
              styles.followBtn,
              following && styles.followBtnDone,
              pressed && styles.followBtnPressed,
            ]}
          >
            <Text style={[styles.followText, following && styles.followTextDone]}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 28 },
  name: { fontSize: 20, fontWeight: '700', color: '#111' },
  handle: { fontSize: 14, color: '#888', marginTop: 2 },
  bio: { fontSize: 14, color: '#444', lineHeight: 20, textAlign: 'center', marginTop: 12 },
  statsRow: { flexDirection: 'row', gap: 32, marginTop: 18, marginBottom: 20 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 17, fontWeight: '700', color: '#111' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },

  followBtn: {
    alignSelf: 'stretch',
    backgroundColor: '#1877f2',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  followBtnPressed: { opacity: 0.85 },
  followBtnDone: { backgroundColor: '#e4e6eb' },
  followText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  followTextDone: { color: '#111' },

  // Faulty: a centered slot whose button collapses to 0 area; the label text
  // overflows so it stays visible and looks like a real Follow chip.
  followSlotFaulty: {
    alignSelf: 'stretch',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtnZero: {
    width: 0,
    height: 0,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followLabelOverflow: {
    width: 120,
    textAlign: 'center',
    color: '#1877f2',
    fontSize: 16,
    fontWeight: '700',
  },
});
