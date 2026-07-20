import { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Payee {
  id: string;
  name: string;
  account: string;
}

const EXISTING_PAYEES: Payee[] = [
  { id: 'p1', name: 'City Power & Light', account: '••••  3092' },
  { id: 'p2', name: 'Maria Gomez', account: '••••  7741' },
];

export default function TransientConfirmationScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [payees, setPayees] = useState<Payee[]>(EXISTING_PAYEES);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const handleAdd = useCallback(() => {
    const trimmedName = name.trim();
    const trimmedAccount = account.trim();
    if (!trimmedName || !trimmedAccount) {
      setToast('Enter a name and account number.');
      return;
    }

    // The add genuinely works in BOTH modes — a real payee is appended every
    // submit. The hazard is only in how success is *confirmed*: faulty shows a
    // toast that auto-dismisses before the next observation, so a re-submit
    // creates a DUPLICATE.
    setPayees((prev) => [
      ...prev,
      { id: `p-${Date.now()}`, name: trimmedName, account: trimmedAccount },
    ]);
    setName('');
    setAccount('');

    if (faultActive) {
      // Faulty: transient snackbar — gone in ~400ms.
      setToast('✓ Payee added');
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 400);
    } else {
      // Baseline: a persistent confirmation that stays on screen.
      setToast('✓ Payee added');
    }
  }, [name, account, faultActive]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_TRANSIENT_CONFIRMATION' : undefined}
    >
      <Stack.Screen options={{ title: 'Add payee' }} />

      <Text style={styles.label}>Payee name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Full name"
        placeholderTextColor="#9e9e9e"
        autoCorrect={false}
        accessibilityLabel="Payee name"
      />

      <Text style={styles.label}>Account number</Text>
      <TextInput
        style={styles.input}
        value={account}
        onChangeText={setAccount}
        placeholder="Account number"
        placeholderTextColor="#9e9e9e"
        keyboardType="number-pad"
        accessibilityLabel="Account number"
      />

      <Pressable
        style={styles.addButton}
        onPress={handleAdd}
        accessibilityRole="button"
        accessibilityLabel="Add payee"
      >
        <Text style={styles.addButtonText}>Add payee</Text>
      </Pressable>

      {/* Baseline: this confirmation persists. Faulty: it is wiped after ~400ms,
          so an agent observing later sees nothing and may re-submit. */}
      {toast && (
        <Text
          style={[styles.toast, toast.startsWith('✓') && styles.toastOk]}
          accessibilityLiveRegion="polite"
        >
          {toast}
        </Text>
      )}

      <Text style={styles.sectionTitle}>Your payees</Text>
      {payees.map((p) => (
        <View key={p.id} style={styles.payeeRow}>
          <View style={styles.payeeAvatar}>
            <Text style={styles.payeeAvatarText}>{p.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.payeeInfo}>
            <Text style={styles.payeeName}>{p.name}</Text>
            <Text style={styles.payeeAccount}>{p.account}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f5f7' },
  content: { padding: 20, paddingBottom: 48 },
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
  addButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  toast: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 14,
    color: '#c62828',
    fontWeight: '600',
  },
  toastOk: { color: '#2e7d32', fontWeight: '700' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 8,
  },
  payeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  payeeAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payeeAvatarText: { fontSize: 16, fontWeight: '800', color: '#1a73e8' },
  payeeInfo: { flex: 1, gap: 2 },
  payeeName: { fontSize: 15, fontWeight: '600', color: '#111' },
  payeeAccount: { fontSize: 13, color: '#999' },
});
