import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

interface Pin {
  id: string;
  name: string;
  detail: string;
  emoji: string;
  // Position as a percentage of the map area.
  left: number;
  top: number;
  // Pins inside the "downtown" cluster overlap at default zoom.
  clustered: boolean;
}

const PINS: Pin[] = [
  { id: 'central-park', name: 'Central Park', detail: 'Park · Open until 10 PM', emoji: '🌳', left: 46, top: 40, clustered: true },
  { id: 'moma', name: 'Museum of Modern Art', detail: 'Museum · 5★', emoji: '🖼️', left: 50, top: 44, clustered: true },
  { id: 'grand-central', name: 'Grand Central', detail: 'Transit hub', emoji: '🚉', left: 43, top: 46, clustered: true },
  { id: 'liberty', name: 'Liberty Pier', detail: 'Landmark', emoji: '🗽', left: 22, top: 74, clustered: false },
  { id: 'harbor', name: 'Harbor Cafe', detail: 'Cafe · $$', emoji: '☕', left: 76, top: 28, clustered: false },
];

// Above this zoom level the clustered pins separate into individual hit targets.
const REVEAL_ZOOM = 1.6;

interface Props {
  faultActive?: boolean;
}

export default function PinchZoomRevealScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [zoom, setZoom] = useState(1);
  const [openPin, setOpenPin] = useState<Pin | null>(null);

  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);

  const commitZoom = useCallback((z: number) => {
    setZoom(z);
  }, []);

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      const next = Math.min(3, Math.max(1, startScale.value * e.scale));
      scale.value = next;
      runOnJS(commitZoom)(next);
    });

  const mapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Faulty: at default zoom the downtown pins are merged into ONE cluster badge
  // with no individual hit target. Central Park only becomes tappable once a
  // pinch-zoom gesture pushes the zoom past REVEAL_ZOOM. Baseline: the clustered
  // pins are always rendered individually, so Central Park is tappable at any zoom.
  const revealed = !faultActive || zoom >= REVEAL_ZOOM;

  const clusteredPins = PINS.filter((p) => p.clustered);
  const looseLPins = PINS.filter((p) => !p.clustered);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_PINCH_ZOOM_REVEAL' : undefined}
    >
      <Stack.Screen options={{ title: 'Maps' }} />

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search Maps</Text>
      </View>

      <View style={styles.mapClip}>
        <GestureDetector gesture={pinch}>
          <Animated.View style={[styles.map, mapStyle]}>
            {/* faux streets */}
            <View style={[styles.street, styles.streetH, { top: '30%' }]} />
            <View style={[styles.street, styles.streetH, { top: '55%' }]} />
            <View style={[styles.street, styles.streetH, { top: '78%' }]} />
            <View style={[styles.street, styles.streetV, { left: '28%' }]} />
            <View style={[styles.street, styles.streetV, { left: '52%' }]} />
            <View style={[styles.street, styles.streetV, { left: '74%' }]} />

            {/* Loose pins are always individually tappable. */}
            {looseLPins.map((pin) => (
              <Pressable
                key={pin.id}
                style={[styles.pin, { left: `${pin.left}%`, top: `${pin.top}%` }]}
                onPress={() => setOpenPin(pin)}
                accessibilityRole="button"
                accessibilityLabel={`${pin.name} pin`}
              >
                <Text style={styles.pinEmoji}>{pin.emoji}</Text>
              </Pressable>
            ))}

            {revealed ? (
              clusteredPins.map((pin) => (
                <Pressable
                  key={pin.id}
                  style={[styles.pin, { left: `${pin.left}%`, top: `${pin.top}%` }]}
                  onPress={() => setOpenPin(pin)}
                  accessibilityRole="button"
                  accessibilityLabel={`${pin.name} pin`}
                >
                  <Text style={styles.pinEmoji}>{pin.emoji}</Text>
                  <Text style={styles.pinLabel} numberOfLines={1}>
                    {pin.name}
                  </Text>
                </Pressable>
              ))
            ) : (
              // Faulty default-zoom state: a single non-interactive cluster badge
              // covering the downtown pins. There is NO hit target for any
              // individual pin (including Central Park) until the user pinches.
              <View
                style={[styles.cluster, { left: '46%', top: '42%' }]}
                accessible
                accessibilityLabel={`${clusteredPins.length} places`}
              >
                <Text style={styles.clusterText}>{clusteredPins.length}</Text>
              </View>
            )}
          </Animated.View>
        </GestureDetector>

        <View style={styles.zoomReadout} pointerEvents="none">
          <Text style={styles.zoomReadoutText}>{zoom.toFixed(1)}×</Text>
        </View>

        {!revealed && (
          <View style={styles.hint} pointerEvents="none">
            <Text style={styles.hintText}>Pinch to zoom in</Text>
          </View>
        )}
      </View>

      <Modal visible={openPin !== null} transparent animationType="slide">
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetEmoji}>{openPin?.emoji}</Text>
            <Text style={styles.sheetTitle}>{openPin?.name}</Text>
            <Text style={styles.sheetDetail}>{openPin?.detail}</Text>
            <Pressable
              style={styles.sheetClose}
              onPress={() => setOpenPin(null)}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.sheetCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8eef2' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    margin: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: { fontSize: 14 },
  searchPlaceholder: { fontSize: 15, color: '#9aa0a6' },

  mapClip: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#dfe7d8',
  },
  map: { flex: 1, backgroundColor: '#dfe7d8' },

  street: { position: 'absolute', backgroundColor: '#ffffff' },
  streetH: { left: 0, right: 0, height: 8 },
  streetV: { top: 0, bottom: 0, width: 8 },

  pin: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  pinEmoji: { fontSize: 26 },
  pinLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#222',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 4,
    borderRadius: 4,
    maxWidth: 90,
  },

  cluster: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a73e8',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -22 }, { translateY: -22 }],
  },
  clusterText: { color: '#fff', fontSize: 18, fontWeight: '800' },

  zoomReadout: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  zoomReadoutText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  hint: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintText: { color: '#fff', fontSize: 13 },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  sheetEmoji: { fontSize: 44 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  sheetDetail: { fontSize: 14, color: '#888' },
  sheetClose: {
    marginTop: 12,
    backgroundColor: '#1a73e8',
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 24,
  },
  sheetCloseText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
