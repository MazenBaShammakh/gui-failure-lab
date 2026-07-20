import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

interface Song {
  id: string;
  title: string;
  artist: string;
  emoji: string;
}

const INITIAL_QUEUE: Song[] = [
  { id: 's1', title: 'Midnight Reverie', artist: 'The Velvet Orchestra', emoji: '🎵' },
  { id: 's2', title: 'Neon Skyline', artist: 'Pulse Theory', emoji: '🎧' },
  { id: 's3', title: 'Paper Boats', artist: 'Hollow Pines', emoji: '🎼' },
  { id: 's4', title: 'Ocean Breeze', artist: 'Solar Winds', emoji: '🎶' },
  { id: 's5', title: 'Static Bloom', artist: 'Marigold', emoji: '🎙️' },
];

const ROW_HEIGHT = 68;

interface RowProps {
  song: Song;
  index: number;
  total: number;
  faultActive: boolean;
  onMove: (from: number, to: number) => void;
}

function QueueRow({ song, index, total, faultActive, onMove }: RowProps) {
  const translateY = useSharedValue(0);
  const lifted = useSharedValue(0);

  const reorder = useCallback(
    (delta: number) => onMove(index, index + delta),
    [onMove, index],
  );

  // Faulty: the only reorder path is long-press + sustained vertical drag. The
  // release endpoint determines how many positions the item moves — a continuous
  // gesture the vision agent must synthesize and hold without dropping.
  const panGesture = Gesture.Pan()
    .activateAfterLongPress(220)
    .onStart(() => {
      lifted.value = 1;
    })
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const delta = Math.round(e.translationY / ROW_HEIGHT);
      if (delta !== 0) runOnJS(reorder)(delta);
      translateY.value = 0;
      lifted.value = 0;
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    zIndex: lifted.value ? 10 : 0,
    shadowOpacity: lifted.value ? 0.2 : 0,
    backgroundColor: lifted.value ? '#2a2a2a' : '#181818',
  }));

  // Faulty: discrete move actions are exposed in the a11y tree so a text agent can
  // reorder one settled step at a time, without synthesizing any drag.
  const moveActions = [
    ...(index > 0
      ? [
          { name: 'move_up', label: 'Move up' },
          { name: 'move_to_top', label: 'Move to top' },
        ]
      : []),
    ...(index < total - 1 ? [{ name: 'move_down', label: 'Move down' }] : []),
  ];
  const a11yActionProps = faultActive
    ? {
        accessibilityActions: moveActions,
        onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
          const a = event.nativeEvent.actionName;
          if (a === 'move_up') reorder(-1);
          else if (a === 'move_down') reorder(1);
          else if (a === 'move_to_top') reorder(-index);
        },
      }
    : {};

  const rowInner = (
    <Animated.View
      style={[styles.row, faultActive && animStyle]}
      accessible
      accessibilityLabel={`${song.title} by ${song.artist}, position ${index + 1} of ${total}`}
      {...a11yActionProps}
    >
      <View style={styles.dragHandle} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={styles.dragHandleText}>≡</Text>
      </View>
      <View style={styles.art}>
        <Text style={styles.artEmoji}>{song.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>

      {/* Baseline: visible, tappable move controls — a vision agent can reorder by
          tapping. Faulty: no buttons at all; reorder is long-press-drag only. */}
      {!faultActive && (
        <View style={styles.controls}>
          <Pressable
            style={({ pressed }) => [styles.ctrlBtn, pressed && styles.ctrlBtnPressed]}
            onPress={() => reorder(-1)}
            disabled={index === 0}
            accessibilityRole="button"
            accessibilityLabel={`Move ${song.title} up`}
            hitSlop={6}
          >
            <Text style={[styles.ctrlText, index === 0 && styles.ctrlDisabled]}>▲</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.ctrlBtn, pressed && styles.ctrlBtnPressed]}
            onPress={() => reorder(1)}
            disabled={index === total - 1}
            accessibilityRole="button"
            accessibilityLabel={`Move ${song.title} down`}
            hitSlop={6}
          >
            <Text style={[styles.ctrlText, index === total - 1 && styles.ctrlDisabled]}>▼</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );

  if (!faultActive) return rowInner;
  return <GestureDetector gesture={panGesture}>{rowInner}</GestureDetector>;
}

interface Props {
  faultActive?: boolean;
}

/**
 * B14 — Drag-and-drop reorder: continuous drag vs. discrete a11y move actions
 * (Interaction Scope).
 *
 * Reordering the queue is, in faulty mode, only possible by long-press + a
 * sustained vertical drag whose release endpoint sets the number of positions
 * moved. A vision agent must compute a source→target path and synthesize/hold that
 * continuous gesture — fragile and easy to drop mid-drag. The rows ALSO expose
 * discrete move actions in the a11y tree ("Move up" / "Move down" / "Move to top"),
 * so a text agent reorders one settled step at a time, no drag required.
 *
 *   Baseline: visible tappable Move up / Move down buttons — vision can reorder.
 *   Faulty: no visible move controls; drag-only + discrete move custom actions.
 *
 *   Fails: vision-only (continuous drag synthesis).
 *   Succeeds: text-only (discrete move actions).
 *
 * This is the inverse of E13 (drag-reorder-only), where the faulty arm exposes NO
 * discrete actions, so text fails too. Here the move actions ARE present — the
 * standard accessible-reorder affordance — which is exactly what makes the text
 * channel succeed.
 *
 * Caveat (B4 family): HTML5 drag-and-drop exists on web, so drag-reorder is not
 * native-only — long-press-drag with custom a11y move actions is merely the native
 * idiom. Remediation: expose discrete move actions (done here).
 *
 * NOTE: the text-success path depends on the custom AccessibilityActions being read
 * and invoked from the native device tree. React Native Web does not surface
 * accessibilityActions, so the discrete-move arm is faithful on the native build;
 * on web only the visual arm (no tappable controls in faulty) is reproduced.
 */
export default function ReorderMoveActionsScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [queue, setQueue] = useState<Song[]>(INITIAL_QUEUE);

  const move = useCallback((from: number, to: number) => {
    setQueue((prev) => {
      const clampedTo = Math.max(0, Math.min(prev.length - 1, to));
      if (clampedTo === from) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(clampedTo, 0, item);
      return next;
    });
  }, []);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_REORDER_MOVE_ACTIONS' : undefined}
    >
      <Stack.Screen options={{ title: 'Up Next' }} />

      <Text style={styles.heading}>Up Next</Text>
      <Text style={styles.subheading}>Reorder your queue</Text>

      <ScrollView contentContainerStyle={styles.list}>
        {queue.map((song, index) => (
          <QueueRow
            key={song.id}
            song={song}
            index={index}
            total={queue.length}
            faultActive={faultActive}
            onMove={move}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  heading: { fontSize: 22, fontWeight: '700', color: '#fff', paddingHorizontal: 20, paddingTop: 16 },
  subheading: { fontSize: 14, color: '#888', paddingHorizontal: 20, marginTop: 2, marginBottom: 8 },
  list: { paddingVertical: 8 },

  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  dragHandle: { width: 22, alignItems: 'center', justifyContent: 'center' },
  dragHandleText: { fontSize: 20, color: '#666' },
  art: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artEmoji: { fontSize: 22 },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: '#fff' },
  artist: { fontSize: 13, color: '#999', marginTop: 2 },

  controls: { flexDirection: 'row', gap: 6 },
  ctrlBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctrlBtnPressed: { backgroundColor: '#333' },
  ctrlText: { fontSize: 15, color: '#1db954', fontWeight: '700' },
  ctrlDisabled: { color: '#555' },
});
