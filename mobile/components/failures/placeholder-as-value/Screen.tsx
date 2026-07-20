import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const PLACEHOLDER = 'name@example.com';

export default function PlaceholderAsValueScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('Quarterly sync');
  const [body, setBody] = useState(
    'Hi Alex,\n\nCan we lock in a time for the quarterly sync next week?\n\nThanks,\nJordan',
  );
  const [result, setResult] = useState<'sent' | 'no-recipient' | null>(null);

  const trimmed = to.trim();

  const handleSend = useCallback(() => {
    if (trimmed.length === 0) {
      // Sending with an empty To goes nowhere. In faulty mode the field LOOKS
      // pre-filled (dark placeholder + placeholder surfaced as a11y value), so
      // an agent skips entering an address and lands here without realizing it.
      setResult('no-recipient');
      return;
    }
    setResult('sent');
  }, [trimmed]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_PLACEHOLDER_AS_VALUE' : undefined}
    >
      <Stack.Screen options={{ title: 'New message' }} />

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>To</Text>
        <TextInput
          style={[
            styles.fieldInput,
            // Faulty: the empty field's placeholder is styled dark, so an
            // empty input visually reads as a filled value.
            faultActive ? styles.fieldInputFaulty : null,
          ]}
          value={to}
          onChangeText={setTo}
          placeholder={PLACEHOLDER}
          // Baseline: an obviously grey placeholder. Faulty: a dark, value-like
          // placeholder colour.
          placeholderTextColor={faultActive ? '#1a1a1a' : '#b8b8b8'}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          accessibilityLabel="To"
          // Faulty: the placeholder string is also surfaced as the field's
          // accessibility value, so a tree-reading agent believes To is filled.
          accessibilityValue={faultActive ? { text: PLACEHOLDER } : undefined}
        />
      </View>
      <View style={styles.divider} />

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Subject</Text>
        <TextInput
          style={styles.fieldInput}
          value={subject}
          onChangeText={setSubject}
          placeholder="Subject"
          placeholderTextColor="#b8b8b8"
          accessibilityLabel="Subject"
        />
      </View>
      <View style={styles.divider} />

      <TextInput
        style={styles.bodyInput}
        value={body}
        onChangeText={setBody}
        multiline
        textAlignVertical="top"
        accessibilityLabel="Message body"
        placeholder="Write your message…"
        placeholderTextColor="#b8b8b8"
      />

      <Pressable
        onPress={handleSend}
        accessibilityRole="button"
        accessibilityLabel="Send"
        style={styles.sendBtn}
      >
        <Text style={styles.sendBtnText}>Send</Text>
      </Pressable>

      {result === 'sent' && (
        <Text style={[styles.banner, styles.bannerOk]} accessibilityLiveRegion="polite">
          ✓ Sent to {trimmed}
        </Text>
      )}
      {result === 'no-recipient' && (
        <Text style={[styles.banner, styles.bannerErr]} accessibilityLiveRegion="polite">
          Message not delivered — no recipient address.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 48 },
  field: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 12 },
  fieldLabel: { fontSize: 14, color: '#888', width: 64 },
  fieldInput: { flex: 1, fontSize: 15, color: '#111', paddingVertical: 8 },
  // Dark placeholder text colour cannot be set via style alone; the value-like
  // appearance comes from placeholderTextColor. This keeps the input itself
  // looking like a normal, settled value rather than an empty draft.
  fieldInputFaulty: { color: '#111' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#e0e0e0' },
  bodyInput: {
    minHeight: 180,
    fontSize: 15,
    lineHeight: 22,
    color: '#111',
    paddingVertical: 14,
  },
  sendBtn: {
    backgroundColor: '#1565c0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  banner: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bannerOk: { color: '#2e7d32', backgroundColor: '#e8f5e9' },
  bannerErr: { color: '#c62828', backgroundColor: '#fdecea' },
});
