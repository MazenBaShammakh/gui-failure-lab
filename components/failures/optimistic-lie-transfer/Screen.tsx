import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Activity {
  id: string;
  label: string;
  amount: string;
}

const INITIAL_BALANCE = 6482.13;

const INITIAL_ACTIVITY: Activity[] = [
  { id: 'a1', label: 'Stripe', amount: '-$249.00' },
  { id: 'a2', label: 'Payroll', amount: '+$4,200.00' },
];

interface Props {
  faultActive?: boolean;
}

function formatUSD(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function OptimisticLieTransferScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const router = useRouter();

  // The displayed balance/activity live in this screen's state so the "lie" is
  // observable: faulty mode shows success WITHOUT mutating them.
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [activity, setActivity] = useState<Activity[]>(INITIAL_ACTIVITY);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSend = useCallback(() => {
    const parsed = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!recipient.trim() || isNaN(parsed) || parsed <= 0) {
      setStatus('Please enter a recipient and a valid amount.');
      return;
    }

    if (faultActive) {
      // Faulty: claim success and navigate back, but the balance/activity are
      // never actually mutated — the optimistic UI silently reverts.
      setStatus('✓ Transfer complete');
      setTimeout(() => router.back(), 600);
      return;
    }

    // Baseline: actually record the transaction and decrease the balance.
    setBalance((prev) => prev - parsed);
    setActivity((prev) => [
      { id: `tx-${Date.now()}`, label: recipient.trim(), amount: `-$${formatUSD(parsed)}` },
      ...prev,
    ]);
    setStatus('✓ Transfer complete');
    setTimeout(() => router.back(), 600);
  }, [amount, recipient, faultActive, router]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_OPTIMISTIC_LIE_TRANSFER' : undefined}
    >
      <Stack.Screen options={{ title: 'Transfer' }} />

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available balance</Text>
        <Text style={styles.balanceValue}>${formatUSD(balance)}</Text>
      </View>

      <Text style={styles.label}>Recipient</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#9e9e9e"
        value={recipient}
        onChangeText={setRecipient}
        accessibilityLabel="Recipient"
        autoCorrect={false}
      />

      <Text style={styles.label}>Amount (USD)</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor="#9e9e9e"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        accessibilityLabel="Amount"
      />

      <Pressable
        style={styles.sendButton}
        onPress={handleSend}
        accessibilityRole="button"
        accessibilityLabel="Send"
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </Pressable>

      {status && (
        <Text
          style={[styles.status, status.startsWith('✓') && styles.statusOk]}
          accessibilityLiveRegion="polite"
        >
          {status}
        </Text>
      )}

      <Text style={styles.sectionTitle}>Recent activity</Text>
      {activity.map((a) => (
        <View key={a.id} style={styles.activityRow}>
          <Text style={styles.activityLabel}>{a.label}</Text>
          <Text
            style={[styles.activityAmount, a.amount.startsWith('+') && styles.activityPos]}
          >
            {a.amount}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f5f7' },
  content: { padding: 20, paddingBottom: 48 },
  balanceCard: {
    backgroundColor: '#0d3b66',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: { color: '#a9c4e0', fontSize: 13, fontWeight: '600' },
  balanceValue: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 4 },

  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d0d3da',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  status: { fontSize: 15, textAlign: 'center', marginTop: 14, color: '#c62828' },
  statusOk: { color: '#2e7d32', fontWeight: '700' },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 8,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  activityLabel: { fontSize: 15, color: '#111', fontWeight: '600' },
  activityAmount: { fontSize: 15, color: '#222', fontWeight: '700' },
  activityPos: { color: '#2e7d32' },
});
