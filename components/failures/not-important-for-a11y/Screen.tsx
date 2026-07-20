import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const PHOTO = {
  label: 'Karwendel summit',
  emoji: '🏔️',
  tint: '#90caf9',
  takenAt: 'Yesterday · 7:18 AM',
};

/**
 * A2 — Required nodes removed via importantForAccessibility / accessibilityElementsHidden.
 *
 * The photo's top-right toolbar holds three icon-only buttons (Share, Favorite,
 * More). A developer trying to declutter TalkBack/VoiceOver wraps the whole
 * toolbar cluster — which *looks* like decorative chrome — in a group marked not
 * important for accessibility. That removes the entire subtree from the native
 * a11y tree, including the genuinely interactive Favorite button the task needs.
 *
 * Baseline: the cluster stays important-for-accessibility, so every icon button
 * is its own node with a proper label.
 *
 * Faulty: the cluster is flagged `importantForAccessibility="no-hide-descendants"`
 * + `accessibilityElementsHidden` (the native opt-out APIs, applied to a subtree
 * the dev assumed was decorative). The buttons are still fully *drawn* — a
 * vision-only agent taps the heart normally — but a text-only agent never sees
 * them in the tree at all.
 *
 * Mobile-exclusive: these are native a11y opt-out flags with no DOM equivalent;
 * `aria-hidden` exists on web but is applied far less aggressively than the
 * TalkBack-noise-reduction habit these flags encourage.
 */
export default function NotImportantForA11yScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [favorited, setFavorited] = useState(false);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_NOT_IMPORTANT_FOR_A11Y' : undefined}
    >
      <Stack.Screen
        options={{ title: 'Photo', headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff' }}
      />

      {/* Secondary action toolbar. The right-hand icon cluster is the subtree a
          developer flags as "decorative" to quiet down TalkBack — which strips
          the required Favorite button out of the a11y tree in faulty mode. */}
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle} numberOfLines={1}>
          {PHOTO.label}
        </Text>

        <View
          style={styles.toolbarActions}
          accessible={faultActive ? false : undefined}
          accessibilityElementsHidden={faultActive}
          importantForAccessibility={faultActive ? 'no-hide-descendants' : 'auto'}
        >
          <Pressable
            style={styles.iconBtn}
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Share photo"
          >
            <Text style={styles.icon}>↗</Text>
          </Pressable>

          <Pressable
            style={styles.iconBtn}
            onPress={() => setFavorited((f) => !f)}
            accessibilityRole="button"
            accessibilityLabel={favorited ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityState={{ selected: favorited }}
          >
            <Text style={[styles.icon, favorited && styles.iconActive]}>
              {favorited ? '♥' : '♡'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.iconBtn}
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Text style={styles.icon}>⋯</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.stage}>
        <View style={[styles.photo, { backgroundColor: PHOTO.tint }]}>
          <Text style={styles.photoEmoji}>{PHOTO.emoji}</Text>
        </View>

        {favorited && (
          <View style={styles.toast} accessibilityLiveRegion="polite">
            <Text style={styles.toastText}>♥ Added to Favorites</Text>
          </View>
        )}
      </View>

      <Text style={styles.caption}>
        {PHOTO.label} · {PHOTO.takenAt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#222',
  },
  toolbarTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' },
  toolbarActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  icon: { color: '#e0e0e0', fontSize: 20 },
  iconActive: { color: '#ff4d6d' },
  stage: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  photo: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoEmoji: { fontSize: 140 },
  toast: {
    position: 'absolute',
    bottom: 24,
    backgroundColor: 'rgba(255,77,109,0.92)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  caption: {
    color: '#bbb',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});
