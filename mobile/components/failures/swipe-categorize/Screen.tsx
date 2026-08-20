import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal } from 'react-native';
import { Link, Stack } from 'expo-router';
import type { Href } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import StaleNamesAfterFilter from '@/components/failures/stale-names-after-filter';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface Txn {
  id: string;
  merchant: string;
  detail: string;
  amount: string;
  emoji: string;
}

const CATEGORIES = ['Personal', 'Business', 'Travel', 'Groceries'];

const TXNS: Txn[] = [
  { id: 't1', merchant: 'Stripe', detail: 'Subscription · Jun 22', amount: '-$249.00', emoji: '💳' },
  { id: 't2', merchant: 'Whole Foods', detail: 'Groceries · Jun 21', amount: '-$83.40', emoji: '🛒' },
  { id: 't3', merchant: 'Lufthansa', detail: 'Flight · Jun 20', amount: '-$612.00', emoji: '✈️' },
  { id: 't4', merchant: 'Spotify', detail: 'Subscription · Jun 19', amount: '-$10.99', emoji: '🎧' },
  { id: 't5', merchant: 'Payroll', detail: 'Deposit · Jun 18', amount: '+$4,200.00', emoji: '💰' },
];

interface RowProps {
  txn: Txn;
  faultActive: boolean;
  category?: string;
  onCategorize: (id: string) => void;
}

function TxnRow({ txn, faultActive, category, onCategorize }: RowProps) {
  const translateX = useSharedValue(0);

  const trigger = useCallback(() => onCategorize(txn.id), [onCategorize, txn.id]);

  // Faulty: the ONLY way to categorize is a left swipe revealing the action.
  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15] as [number, number])
    .failOffsetY([-15, 15] as [number, number])
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX < -80) {
        runOnJS(trigger)();
      }
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const card = (
    <View style={styles.txnInner}>
      <View style={styles.txnIcon}>
        <Text style={styles.txnEmoji}>{txn.emoji}</Text>
      </View>
      <View style={styles.txnInfo}>
        <Text style={styles.txnMerchant}>{txn.merchant}</Text>
        <Text style={styles.txnDetail}>{txn.detail}</Text>
        {category && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{category}</Text>
          </View>
        )}
      </View>
      <View style={styles.txnRight}>
        <Text
          style={[styles.txnAmount, txn.amount.startsWith('+') && styles.txnAmountPos]}
        >
          {txn.amount}
        </Text>
        {/* Baseline: a visible, tappable category control on every row. */}
        {!faultActive && (
          <Pressable
            style={styles.categoryButton}
            onPress={trigger}
            accessibilityRole="button"
            accessibilityLabel={`Categorize ${txn.merchant}`}
          >
            <Text style={styles.categoryButtonText}>
              {category ? 'Edit category' : 'Categorize'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  if (!faultActive) {
    return <View style={styles.txnRow}>{card}</View>;
  }

  // Faulty: swipe-only. No visible control, and the row exposes no a11y action.
  return (
    <View style={styles.txnRow}>
      <View style={styles.swipeReveal}>
        <Text style={styles.swipeRevealText}>Categorize</Text>
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.txnSwipeable, rowStyle]}>{card}</Animated.View>
      </GestureDetector>
    </View>
  );
}

interface Props {
  faultActive?: boolean;
}

export default function SwipeCategorizeScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [categories, setCategories] = useState<Record<string, string>>({});
  const [picker, setPicker] = useState<string | null>(null);

  const openPicker = useCallback((id: string) => setPicker(id), []);
  const choose = (cat: string) => {
    if (picker) setCategories((prev) => ({ ...prev, [picker]: cat }));
    setPicker(null);
  };

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_SWIPE_CATEGORIZE' : undefined}
    >
      <Stack.Screen options={{ title: 'Banking' }} />

      <View style={styles.accountHeader}>
        <Text style={styles.accountLabel}>Checking · ••4821</Text>
        <Text style={styles.balance}>$6,482.13</Text>
        <Link href={'/banking/transfer' as Href} asChild>
          <Pressable
            style={styles.transferButton}
            accessibilityRole="button"
            accessibilityLabel="Transfer"
          >
            <Text style={styles.transferButtonText}>Transfer</Text>
          </Pressable>
        </Link>
      </View>

      <Text style={styles.sectionTitle}>Recent activity</Text>

      <FlatList
        data={TXNS}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <TxnRow
            txn={item}
            faultActive={faultActive}
            category={categories[item.id]}
            onCategorize={openPicker}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={styles.list}
        // X17 (F-STR-01): a separate Statement section appended as the footer.
        // It deliberately does NOT recycle the Recent activity list above, which
        // already carries this screen's own region-scoped defect.
        ListFooterComponent={<StaleNamesAfterFilter />}
      />

      <Modal visible={picker !== null} transparent animationType="slide">
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Choose category</Text>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={styles.catOption}
                onPress={() => choose(cat)}
                accessibilityRole="button"
                accessibilityLabel={cat}
              >
                <Text style={styles.catOptionText}>{cat}</Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.catCancel}
              onPress={() => setPicker(null)}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.catCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f5f7' },
  accountHeader: {
    backgroundColor: '#0d3b66',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    gap: 4,
  },
  accountLabel: { color: '#a9c4e0', fontSize: 13, fontWeight: '600' },
  balance: { color: '#fff', fontSize: 34, fontWeight: '800' },
  transferButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#1a73e8',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 22,
  },
  transferButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },

  list: { flex: 1 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#e3e3e6', marginLeft: 68 },

  txnRow: { position: 'relative', overflow: 'hidden', backgroundColor: '#fff' },
  swipeReveal: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 130,
    backgroundColor: '#5b6bc0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeRevealText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  txnSwipeable: { backgroundColor: '#fff' },

  txnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef1f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txnEmoji: { fontSize: 20 },
  txnInfo: { flex: 1, gap: 3 },
  txnMerchant: { fontSize: 15, fontWeight: '600', color: '#111' },
  txnDetail: { fontSize: 13, color: '#999' },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  tagText: { fontSize: 11, fontWeight: '700', color: '#1a73e8' },
  txnRight: { alignItems: 'flex-end', gap: 6 },
  txnAmount: { fontSize: 15, fontWeight: '700', color: '#222' },
  txnAmountPos: { color: '#2e7d32' },
  categoryButton: {
    backgroundColor: '#eef1f6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  categoryButtonText: { fontSize: 12, fontWeight: '700', color: '#5b6bc0' },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 8,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 6 },
  catOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f4f5f7',
  },
  catOptionText: { fontSize: 16, color: '#111', fontWeight: '600' },
  catCancel: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  catCancelText: { fontSize: 15, color: '#888', fontWeight: '600' },
});
