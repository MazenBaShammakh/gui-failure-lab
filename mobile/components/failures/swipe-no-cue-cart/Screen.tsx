import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import CheckoutReservationPopup from '@/components/failures/checkout-reservation-popup';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
}

const INITIAL_ITEMS: CartItem[] = [
  { id: '4', name: 'USB-C Hub 7-in-1', price: 65, qty: 1, emoji: '🔌' },
  { id: '1', name: 'Wireless Headphones', price: 89, qty: 1, emoji: '🎧' },
  { id: '10', name: 'Desk Mat XL', price: 38, qty: 2, emoji: '🟦' },
  { id: '7', name: 'Cable Management Kit', price: 28, qty: 1, emoji: '🗂️' },
];

const REMOVE_THRESHOLD = 96;

interface RowProps {
  item: CartItem;
  faultActive: boolean;
  onRemove: (id: string) => void;
}

function CartRow({ item, faultActive, onRemove }: RowProps) {
  const translateX = useSharedValue(0);

  const doRemove = useCallback(() => {
    onRemove(item.id);
  }, [onRemove, item.id]);

  // Faulty: removal is ONLY possible by swiping the row left. There is no
  // visible Remove button and no visual hint that the row is swipeable.
  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15] as [number, number])
    .failOffsetY([-15, 15] as [number, number])
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX < -REMOVE_THRESHOLD) {
        runOnJS(doRemove)();
      }
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Faulty: each row STILL declares a custom accessibility action so a
  // tree-reading multimodal agent can fire "remove" even though there is no
  // visible control. A vision-only agent has nothing to act on.
  const a11yActionProps = faultActive
    ? {
        accessibilityActions: [{ name: 'remove', label: 'Remove from cart' }],
        onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
          if (event.nativeEvent.actionName === 'remove') {
            doRemove();
          }
        },
      }
    : {};

  const rowInner = (
    <Animated.View
      style={[styles.row, faultActive && rowStyle]}
      accessible
      accessibilityLabel={`${item.name}, $${item.price}, quantity ${item.qty}`}
      {...a11yActionProps}
    >
      <View style={styles.itemImage}>
        <Text style={styles.itemEmoji}>{item.emoji}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemQty}>Qty: {item.qty}</Text>
        <Text style={styles.itemPrice}>${item.price}</Text>
      </View>

      {/* Baseline: a clear, visible Remove button per row. */}
      {!faultActive && (
        <Pressable
          style={({ pressed }) => [styles.removeBtn, pressed && styles.removeBtnPressed]}
          onPress={doRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.name} from cart`}
        >
          <Text style={styles.removeBtnText}>Remove</Text>
        </Pressable>
      )}
    </Animated.View>
  );

  if (!faultActive) {
    return <View style={styles.rowWrapper}>{rowInner}</View>;
  }

  return (
    <View style={styles.rowWrapper}>
      <GestureDetector gesture={panGesture}>{rowInner}</GestureDetector>
    </View>
  );
}

interface Props {
  faultActive?: boolean;
}

export default function SwipeNoCueCartScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
  // X31 (F-TMP-03): "entering checkout" gate. The popup lives in the checkout
  // sub-step, which only exists once this is true, so the swipe-to-remove task
  // (which never checks out) never arms it.
  const [checkingOut, setCheckingOut] = useState(false);

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_SWIPE_NO_CUE_CART' : undefined}
    >
      <Stack.Screen options={{ title: 'Cart' }} />

      <View style={styles.list}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        ) : (
          items.map((item) => (
            <CartRow
              key={item.id}
              item={item}
              faultActive={faultActive}
              onRemove={handleRemove}
            />
          ))
        )}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${total}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.checkoutBtn, pressed && styles.checkoutBtnPressed]}
          onPress={() => setCheckingOut(true)}
          accessibilityRole="button"
          accessibilityLabel="Proceed to checkout"
        >
          <Text style={styles.checkoutText}>Checkout</Text>
        </Pressable>
      </View>

      {/* X31 (F-TMP-03): the checkout sub-step + reservation popup. */}
      <CheckoutReservationPopup visible={checkingOut} onClose={() => setCheckingOut(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { flex: 1, paddingTop: 8 },

  rowWrapper: {
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    backgroundColor: '#fff',
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: { fontSize: 28 },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#111' },
  itemQty: { fontSize: 13, color: '#888' },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },

  removeBtn: {
    borderWidth: 1,
    borderColor: '#e53935',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  removeBtnPressed: { backgroundColor: '#ffebee' },
  removeBtnText: { color: '#e53935', fontSize: 13, fontWeight: '700' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#888' },

  summary: {
    backgroundColor: '#fff',
    padding: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 15, color: '#555' },
  summaryValue: { fontSize: 18, fontWeight: '700', color: '#111' },
  checkoutBtn: {
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutBtnPressed: { opacity: 0.8 },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
