import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const RECIPIENT = 'Alex Johnson';
const ACCOUNT = '••••  4821';
const AMOUNT = '$50.00';
const FEE = '$0.00';

export default function TruncatedA11yNameScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [confirmed, setConfirmed] = useState(false);

  // The button works in BOTH modes. The defect is purely in how the confirm
  // control is *named*: faulty truncates both the visible text and the
  // accessibilityLabel to "Confirm pa…", so grounding on "Confirm payment"
  // matches nothing in the tree even though the control is fully functional.
  const visibleLabel = faultActive ? 'Confirm pa…' : 'Confirm payment';
  const a11yLabel = faultActive ? 'Confirm pa…' : 'Confirm payment';

  const handleConfirm = useCallback(() => {
    setConfirmed(true);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_TRUNCATED_A11Y_NAME' : undefined}
    >
      <Stack.Screen options={{ title: 'Confirm payment' }} />

      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>You&apos;re paying</Text>
        <Text style={styles.amountValue}>{AMOUNT}</Text>
        <Text style={styles.amountTo}>to {RECIPIENT}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Recipient</Text>
          <Text style={styles.summaryVal}>{RECIPIENT}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Account</Text>
          <Text style={styles.summaryVal}>{ACCOUNT}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Amount</Text>
          <Text style={styles.summaryVal}>{AMOUNT}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Fee</Text>
          <Text style={styles.summaryVal}>{FEE}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryKey, styles.totalKey]}>Total</Text>
          <Text style={[styles.summaryVal, styles.totalVal]}>{AMOUNT}</Text>
        </View>
      </View>

      {confirmed ? (
        <View style={styles.successCard} accessibilityLiveRegion="polite">
          <Text style={styles.successText}>✓ Payment confirmed</Text>
          <Text style={styles.successSub}>{AMOUNT} sent to {RECIPIENT}</Text>
        </View>
      ) : (
        <Pressable
          style={styles.confirmButton}
          onPress={handleConfirm}
          accessibilityRole="button"
          accessibilityLabel={a11yLabel}
        >
          <Text style={styles.confirmButtonText} numberOfLines={1}>
            {visibleLabel}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f5f7' },
  content: { padding: 20, paddingBottom: 48 },
  amountCard: {
    backgroundColor: '#0d3b66',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: { color: '#a9c4e0', fontSize: 13, fontWeight: '600' },
  amountValue: { color: '#fff', fontSize: 40, fontWeight: '800', marginTop: 6 },
  amountTo: { color: '#cfe0f0', fontSize: 14, marginTop: 6 },

  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  summaryKey: { fontSize: 14, color: '#777' },
  summaryVal: { fontSize: 14, color: '#111', fontWeight: '600' },
  totalKey: { color: '#111', fontWeight: '700' },
  totalVal: { fontSize: 16, fontWeight: '800' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#e3e3e6' },

  confirmButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  successCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  successText: { color: '#2e7d32', fontSize: 18, fontWeight: '800' },
  successSub: { color: '#41794a', fontSize: 14 },
});
