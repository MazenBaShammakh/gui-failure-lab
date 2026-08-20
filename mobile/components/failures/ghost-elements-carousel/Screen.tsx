import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import PageScopedSort from '@/components/failures/page-scoped-sort';

interface Item {
  id: string;
  name: string;
  price: number;
  emoji: string;
}

interface Category {
  title: string;
  items: Item[];
}

// "Garden Hose" lives far to the right of the "Outdoor" carousel — off-screen.
const CATEGORIES: Category[] = [
  {
    title: 'Deals',
    items: [
      { id: 'd1', name: 'Wireless Earbuds', price: 39, emoji: '🎧' },
      { id: 'd2', name: 'Phone Stand', price: 14, emoji: '📱' },
      { id: 'd3', name: 'Power Bank', price: 29, emoji: '🔋' },
      { id: 'd4', name: 'LED Strip', price: 19, emoji: '💡' },
      { id: 'd5', name: 'Travel Mug', price: 22, emoji: '☕' },
      { id: 'd6', name: 'Desk Lamp', price: 34, emoji: '🪔' },
    ],
  },
  {
    title: 'New Arrivals',
    items: [
      { id: 'n1', name: 'Smart Watch', price: 199, emoji: '⌚' },
      { id: 'n2', name: 'Bluetooth Speaker', price: 59, emoji: '🔊' },
      { id: 'n3', name: 'E-Reader', price: 129, emoji: '📖' },
      { id: 'n4', name: 'Action Camera', price: 249, emoji: '📷' },
      { id: 'n5', name: 'Drone Mini', price: 299, emoji: '🚁' },
    ],
  },
  {
    title: 'Outdoor & Garden',
    items: [
      { id: 'o1', name: 'Camping Tent', price: 89, emoji: '⛺' },
      { id: 'o2', name: 'Folding Chair', price: 32, emoji: '🪑' },
      { id: 'o3', name: 'Cooler Box', price: 54, emoji: '🧊' },
      { id: 'o4', name: 'Charcoal Grill', price: 119, emoji: '🍖' },
      { id: 'o5', name: 'Lantern', price: 24, emoji: '🏮' },
      { id: 'o6', name: 'Hammock', price: 45, emoji: '🛏️' },
      { id: 'o7', name: 'Garden Hose', price: 27, emoji: '🚿' },
      { id: 'o8', name: 'Sprinkler', price: 18, emoji: '💦' },
    ],
  },
  {
    title: 'Popular',
    items: [
      { id: 'p1', name: 'Yoga Mat', price: 28, emoji: '🧘' },
      { id: 'p2', name: 'Water Bottle', price: 16, emoji: '🍶' },
      { id: 'p3', name: 'Backpack', price: 64, emoji: '🎒' },
      { id: 'p4', name: 'Running Shoes', price: 95, emoji: '👟' },
    ],
  },
];

interface CarouselProps {
  category: Category;
  faultActive: boolean;
  onOpen: (item: Item) => void;
}

function CategoryCarousel({ category, faultActive, onOpen }: CarouselProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{category.title}</Text>
      <FlatList
        data={category.items}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
        // Baseline: healthy virtualization — off-screen cards are clipped and
        // pulled from the a11y tree. Faulty: every card stays mounted and in the
        // tree even when scrolled far out of view.
        removeClippedSubviews={!faultActive}
        initialNumToRender={faultActive ? category.items.length : 3}
        windowSize={faultActive ? 21 : 3}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => onOpen(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, $${item.price}`}
          >
            <View style={styles.cardImage}>
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cardPrice}>${item.price}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

interface Props {
  faultActive?: boolean;
}

export default function GhostElementsCarouselScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const router = useRouter();

  const handleOpen = (item: Item) => {
    // Mock product detail navigation — every card routes by its name.
    router.push(`/shop/product/${encodeURIComponent(item.id)}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_GHOST_ELEMENTS_CAROUSEL' : undefined}
    >
      <Stack.Screen options={{ title: 'Browse' }} />

      {CATEGORIES.map((category) => (
        <CategoryCarousel
          key={category.title}
          category={category}
          faultActive={faultActive}
          onOpen={handleOpen}
        />
      ))}

      {/* X25 (F-CNT-03): a paged vertical grid with a page-scoped price sort. It
          has no carousel and no ghost cards, so the host's defect is not on this
          task's path. */}
      <PageScopedSort />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { paddingVertical: 16, gap: 20 },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    paddingHorizontal: 16,
  },
  carouselContent: { paddingHorizontal: 16, gap: 12 },
  card: {
    width: 130,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardImage: {
    height: 90,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: { fontSize: 40 },
  cardName: { fontSize: 13, fontWeight: '600', color: '#111' },
  cardPrice: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
});
