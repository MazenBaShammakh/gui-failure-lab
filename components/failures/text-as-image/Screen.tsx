import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Item {
  id: string;
  name: string;
  emoji: string;
  price: string;
  salePrice?: string;
  onSale?: boolean;
}

const ITEMS: Item[] = [
  { id: '1', name: 'Ceramic Pour-Over Set', emoji: '☕', price: '$42.00' },
  { id: '2', name: 'Wool Throw Blanket', emoji: '🧶', price: '$58.00' },
  {
    id: '3',
    name: 'Cast Iron Skillet 12"',
    emoji: '🍳',
    price: '$36.00',
    salePrice: '$24.00',
    onSale: true,
  },
  { id: '4', name: 'Bamboo Cutting Board', emoji: '🪵', price: '$29.00' },
  { id: '5', name: 'Glass Storage Jars (4)', emoji: '🫙', price: '$33.00' },
];

export default function TextAsImageScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [openedId, setOpenedId] = useState<string | null>(null);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_TEXT_AS_IMAGE' : undefined}
    >
      <Stack.Screen options={{ title: 'Kitchen & Home' }} />

      <Text style={styles.heading}>Featured items</Text>

      {ITEMS.map((item) => {
        const opened = openedId === item.id;
        return (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.card,
              opened && styles.cardOpened,
              pressed && styles.cardPressed,
            ]}
            onPress={() => setOpenedId(item.id)}
            accessibilityRole="button"
            accessibilityLabel={item.name}
          >
            <View style={styles.thumb}>
              <Text style={styles.thumbEmoji}>{item.emoji}</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.itemName}>{item.name}</Text>

              {item.onSale ? (
                faultActive ? (
                  // FAULTY: the price + SALE badge for the on-sale item are rendered
                  // as a baked-in graphic block — a View styled to look like a
                  // rasterized price tag, with NO real text node and NO
                  // accessibilityLabel conveying the price or "SALE".
                  // The subtree is hidden from the a11y tree, so text/tree agents
                  // see only the item name (identical to every other card) and
                  // cannot tell this item is on sale. A vision agent can read it.
                  <View
                    style={styles.priceRow}
                    importantForAccessibility="no-hide-descendants"
                    accessibilityElementsHidden
                  >
                    <View style={styles.bakedTag}>
                      <View style={styles.bakedSaleStripe} />
                      <View style={styles.bakedPriceLine} />
                      <View style={styles.bakedWasLine} />
                    </View>
                  </View>
                ) : (
                  // BASELINE: real <Text> nodes — readable by all modalities.
                  <View style={styles.priceRow}>
                    <View style={styles.saleBadge}>
                      <Text style={styles.saleBadgeText}>SALE</Text>
                    </View>
                    <Text style={styles.salePrice}>{item.salePrice}</Text>
                    <Text style={styles.wasPrice}>{item.price}</Text>
                  </View>
                )
              ) : (
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{item.price}</Text>
                </View>
              )}
            </View>

            {opened && <Text style={styles.openedTick}>✓</Text>}
          </Pressable>
        );
      })}

      {openedId && (
        <Text style={styles.openedNote} accessibilityLiveRegion="polite">
          Opened: {ITEMS.find((i) => i.id === openedId)?.name}
        </Text>
      )}
    </ScrollView>
  );
}

const SALE_GREEN = '#2e7d32';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 48, gap: 12 },
  heading: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 2 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardOpened: { borderWidth: 2, borderColor: '#1565c0' },
  cardPressed: { opacity: 0.9 },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbEmoji: { fontSize: 32 },
  cardBody: { flex: 1, gap: 6 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#111' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { fontSize: 15, fontWeight: '700', color: '#111' },

  // Baseline sale (real text)
  saleBadge: {
    backgroundColor: SALE_GREEN,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saleBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  salePrice: { fontSize: 15, fontWeight: '700', color: SALE_GREEN },
  wasPrice: { fontSize: 13, color: '#999', textDecorationLine: 'line-through' },

  // Faulty sale (baked-in graphic — pure Views, no text)
  bakedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bakedSaleStripe: {
    width: 38,
    height: 16,
    borderRadius: 4,
    backgroundColor: SALE_GREEN,
  },
  bakedPriceLine: {
    width: 44,
    height: 14,
    borderRadius: 3,
    backgroundColor: SALE_GREEN,
    opacity: 0.85,
  },
  bakedWasLine: {
    width: 34,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#c4c4c4',
  },

  openedTick: { fontSize: 18, color: '#1565c0', fontWeight: '700' },
  openedNote: { fontSize: 14, color: '#1565c0', fontWeight: '600', marginTop: 4 },
});
