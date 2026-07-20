import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const UNIT_PRICE = 24.0;

export default function DeadStepperScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [qty, setQty] = useState(1);

  // Faulty: the + / − buttons render and look interactive, but their handlers
  // are no-ops, so the quantity never changes. Baseline: they increment/decrement.
  const inc = () => {
    if (faultActive) return;
    setQty((q) => Math.min(10, q + 1));
  };
  const dec = () => {
    if (faultActive) return;
    setQty((q) => Math.max(1, q - 1));
  };

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DEAD_STEPPER' : undefined}
    >
      <Stack.Screen options={{ title: 'Ceramic Mug' }} />

      <View style={styles.imageStage}>
        <Text style={styles.imageEmoji}>☕</Text>
      </View>

      <Text style={styles.brand}>Hearth & Home</Text>
      <Text style={styles.productName}>Ceramic Mug — 12oz</Text>
      <Text style={styles.price}>${UNIT_PRICE.toFixed(2)}</Text>

      <Text style={styles.description}>
        Stoneware mug with a matte glaze finish. Microwave and dishwasher safe.
      </Text>

      <View style={styles.qtyRow}>
        <Text style={styles.qtyLabel}>Quantity</Text>
        <View style={styles.stepper}>
          <Pressable
            style={({ pressed }) => [styles.stepBtn, pressed && !faultActive && styles.stepBtnPressed]}
            onPress={dec}
            accessibilityRole="button"
            accessibilityLabel="Decrease quantity"
            hitSlop={6}
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>

          <View style={styles.qtyValueBox}>
            <Text style={styles.qtyValue}>{qty}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.stepBtn, pressed && !faultActive && styles.stepBtnPressed]}
            onPress={inc}
            accessibilityRole="button"
            accessibilityLabel="Increase quantity"
            hitSlop={6}
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${(UNIT_PRICE * qty).toFixed(2)}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.cartBtn, pressed && styles.cartBtnPressed]}
        accessibilityRole="button"
        accessibilityLabel="Add to cart"
        onPress={() => {}}
      >
        <Text style={styles.cartBtnText}>Add {qty} to Cart</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, gap: 10 },
  imageStage: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  imageEmoji: { fontSize: 88 },
  brand: { fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
  productName: { fontSize: 22, fontWeight: '700', color: '#111' },
  price: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  description: { fontSize: 14, lineHeight: 22, color: '#555' },

  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  qtyLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  stepBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa' },
  stepBtnPressed: { backgroundColor: '#ececec' },
  stepText: { fontSize: 24, color: '#111', fontWeight: '600', lineHeight: 26 },
  qtyValueBox: {
    minWidth: 48,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#eee',
  },
  qtyValue: { fontSize: 17, fontWeight: '700', color: '#111', fontVariant: ['tabular-nums'] },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  totalLabel: { fontSize: 15, color: '#555' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#111' },

  cartBtn: {
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  cartBtnPressed: { opacity: 0.8 },
  cartBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
