import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

export default function SwappedDialogButtonsScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [placed, setPlaced] = useState(false);

  const confirmButton = (
    <Pressable
      style={({ pressed }) => [styles.confirmBtn, pressed && styles.btnPressed]}
      onPress={() => {
        setDialogOpen(false);
        setPlaced(true);
      }}
      accessibilityRole="button"
      accessibilityLabel="Confirm"
    >
      <Text style={styles.confirmText}>Confirm</Text>
    </Pressable>
  );

  const cancelButton = (
    <Pressable
      style={({ pressed }) => [styles.cancelBtn, pressed && styles.btnPressed]}
      onPress={() => setDialogOpen(false)}
      accessibilityRole="button"
      accessibilityLabel="Cancel"
    >
      <Text style={styles.cancelText}>Cancel</Text>
    </Pressable>
  );

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_SWAPPED_DIALOG_BUTTONS' : undefined}
    >
      <Stack.Screen options={{ title: 'Checkout' }} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Order Summary</Text>

        <View style={styles.card}>
          <View style={styles.lineItem}>
            <Text style={styles.itemEmoji}>🎧</Text>
            <Text style={styles.itemName}>Wireless Headphones</Text>
            <Text style={styles.itemPrice}>$89.00</Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={styles.itemEmoji}>🔌</Text>
            <Text style={styles.itemName}>USB-C Hub 7-in-1</Text>
            <Text style={styles.itemPrice}>$65.00</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Shipping</Text>
        <View style={styles.card}>
          <Text style={styles.addrName}>Mazen B.</Text>
          <Text style={styles.addrLine}>Arcisstraße 21</Text>
          <Text style={styles.addrLine}>80333 München, Germany</Text>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>$154.00</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={styles.totalValue}>$4.99</Text>
          </View>
          <View style={[styles.totalRow, styles.grandRow]}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>$158.99</Text>
          </View>
        </View>

        {placed && (
          <Text style={styles.placedText} accessibilityLiveRegion="polite">
            ✓ Order placed — thank you!
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.placeOrderBtn, pressed && styles.btnPressed]}
          onPress={() => setDialogOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Place order"
        >
          <Text style={styles.placeOrderText}>Place Order</Text>
        </Pressable>
      </View>

      <Modal visible={dialogOpen} transparent animationType="fade" onRequestClose={() => setDialogOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Place order?</Text>
            <Text style={styles.dialogBody}>
              Your card will be charged $158.99. This action cannot be undone.
            </Text>

            {/*
              Baseline: conventional order — Cancel on the LEFT, Confirm on the RIGHT.
              Faulty:   positionally swapped — Confirm on the LEFT (where Cancel
                        usually sits) and Cancel on the RIGHT. Agents relying on
                        positional convention pick the wrong button.
            */}
            <View style={styles.dialogButtons}>
              {faultActive ? (
                <>
                  {confirmButton}
                  {cancelButton}
                </>
              ) : (
                <>
                  {cancelButton}
                  {confirmButton}
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 10, paddingBottom: 24 },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#555', marginTop: 6 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  lineItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemEmoji: { fontSize: 24 },
  itemName: { flex: 1, fontSize: 15, color: '#111' },
  itemPrice: { fontSize: 15, fontWeight: '600', color: '#111' },

  addrName: { fontSize: 15, fontWeight: '600', color: '#111' },
  addrLine: { fontSize: 14, color: '#555' },

  totals: { backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 8, marginTop: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 14, color: '#666' },
  totalValue: { fontSize: 14, color: '#111' },
  grandRow: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#e0e0e0', paddingTop: 8, marginTop: 2 },
  grandLabel: { fontSize: 16, fontWeight: '700', color: '#111' },
  grandValue: { fontSize: 16, fontWeight: '700', color: '#111' },

  placedText: { fontSize: 15, color: '#2e7d32', fontWeight: '600', marginTop: 8 },

  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  placeOrderBtn: {
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeOrderText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  dialogTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  dialogBody: { fontSize: 14, color: '#555', lineHeight: 20 },
  dialogButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },

  confirmBtn: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelText: { color: '#333', fontSize: 15, fontWeight: '700' },
  btnPressed: { opacity: 0.8 },
});
