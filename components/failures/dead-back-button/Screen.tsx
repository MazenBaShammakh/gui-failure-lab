import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

export default function DeadBackButtonScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const router = useRouter();

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DEAD_BACK_BUTTON' : undefined}
    >
      {/* Hide the native header so the custom header row owns the back affordance. */}
      <Stack.Screen options={{ title: 'Product', headerShown: false }} />

      {/* Custom header row with a back chevron. */}
      <View style={styles.header}>
        {faultActive ? (
          // Faulty: greyed, disabled, no-op onPress, and crucially NO
          // accessibilityState.disabled — it looks fully operable to vision and
          // reads as an enabled button in the tree, but tapping does nothing.
          <Pressable
            style={styles.backBtn}
            disabled
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Text style={[styles.backChevron, styles.backChevronDead]}>‹</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Text style={styles.backChevron}>‹</Text>
          </Pressable>
        )}
        <Text style={styles.headerTitle} numberOfLines={1}>
          Mechanical Keyboard
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageEmoji}>⌨️</Text>
        </View>

        <Text style={styles.brand}>KeyForge</Text>
        <Text style={styles.productName}>Mechanical Keyboard</Text>

        <View style={styles.ratingRow}>
          <Text style={styles.stars}>★★★★★</Text>
          <Text style={styles.reviews}>(842 reviews)</Text>
        </View>

        <Text style={styles.price}>$220.00</Text>

        <Text style={styles.description}>
          Hot-swappable mechanical keyboard with tactile brown switches, full RGB
          backlighting, and an aluminium frame. USB-C and 2.4GHz wireless. Comes
          with a braided cable and keycap puller.
        </Text>

        <View style={styles.specs}>
          <Text style={styles.specsTitle}>Highlights</Text>
          <Text style={styles.specLine}>• Hot-swappable switches</Text>
          <Text style={styles.specLine}>• Per-key RGB lighting</Text>
          <Text style={styles.specLine}>• Aluminium top plate</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnPressed: { opacity: 0.5 },
  backChevron: { fontSize: 34, color: '#111', marginTop: -4 },
  backChevronDead: { color: '#c4c4c4' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#111' },
  headerSpacer: { width: 44 },

  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48, gap: 10 },
  imagePlaceholder: {
    height: 220,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  imageEmoji: { fontSize: 80 },
  brand: { fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
  productName: { fontSize: 24, fontWeight: '700', color: '#111' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stars: { fontSize: 14, color: '#f59e0b' },
  reviews: { fontSize: 13, color: '#666' },
  price: { fontSize: 26, fontWeight: '700', color: '#1a1a1a' },
  description: { fontSize: 14, lineHeight: 22, color: '#555' },
  specs: { marginTop: 12, gap: 6 },
  specsTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  specLine: { fontSize: 14, color: '#555', lineHeight: 20 },
});
