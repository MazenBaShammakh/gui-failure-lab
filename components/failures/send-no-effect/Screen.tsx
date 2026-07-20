import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

export default function SendNoEffectScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [to] = useState('Sarah Chen <sarah.chen@example.com>');
  const [subject] = useState('Re: Project kickoff — Tuesday 3pm');
  const [body, setBody] = useState(
    "Hi Sarah,\n\nThanks for confirming — Tuesday at 3pm works for me. I'll prepare the kickoff agenda and share it beforehand.\n\nBest,\nMarcus",
  );
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!faultActive) {
      // Baseline: confirm sent and clear the editable field.
      setSent(true);
      setBody('');
    }
    // Faulty: the press fires but state never updates — no nav, no toast,
    // no sent confirmation (mirrors B_CLICK_NO_VISIBLE_EFFECT).
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_SEND_NO_EFFECT' : undefined}
    >
      <Stack.Screen options={{ title: 'Reply' }} />

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>To</Text>
        <Text style={styles.fieldValue}>{to}</Text>
      </View>
      <View style={styles.divider} />

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Subject</Text>
        <Text style={styles.fieldValue}>{subject}</Text>
      </View>
      <View style={styles.divider} />

      <TextInput
        style={styles.bodyInput}
        value={body}
        onChangeText={setBody}
        multiline
        textAlignVertical="top"
        accessibilityLabel="Message body"
        placeholder="Write your reply…"
        placeholderTextColor="#aaa"
      />

      <Pressable
        onPress={handleSend}
        accessibilityRole="button"
        accessibilityLabel="Send reply"
        style={styles.sendBtn}
      >
        <Text style={styles.sendBtnText}>Send</Text>
      </Pressable>

      {sent && (
        <Text style={styles.sentConfirm} accessibilityLiveRegion="polite">
          Sent ✓
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 48 },
  field: { paddingVertical: 10, flexDirection: 'row', gap: 12 },
  fieldLabel: { fontSize: 14, color: '#888', width: 64 },
  fieldValue: { fontSize: 14, color: '#111', flex: 1 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#e0e0e0' },
  bodyInput: {
    minHeight: 200,
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
  sentConfirm: {
    fontSize: 15,
    color: '#2e7d32',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
});
