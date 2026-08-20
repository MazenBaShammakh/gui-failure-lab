import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import A11yHeaderTextMismatch from '@/components/failures/a11y-header-text-mismatch';

interface Props {
  faultActive?: boolean;
}

export default function SilentFailedSubmissionScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = () => {
    if (!name.trim() || !email.trim()) return;
    // Both branches reject the same way server-side (duplicate application on
    // file for this role) — the entered data is never cleared either way.
    // Baseline: the rejection is surfaced with an error banner.
    // Faulty: the rejection happens silently — no banner, no toast, no
    // field-level change. The screen looks identical to pre-submit, giving
    // no signal that the action didn't go through.
    if (!faultActive) {
      setError("You've already applied to this role. Contact recruiting to reapply.");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_SILENT_FAILED_SUBMISSION' : undefined}
    >
      <Stack.Screen options={{ title: 'Reapply' }} />

      {/* X21 (F-CNT-01): the header block is owned by this fragment. It must
          replace the plain title/meta rather than sit beside them — a second,
          correctly-named "DevOps Engineer" node would let a text-only agent
          ground the role and the mismatch would not bite. */}
      <A11yHeaderTextMismatch />

      {error && (
        <View style={styles.errorBanner} accessibilityLiveRegion="polite">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.label}>Full name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        placeholderTextColor="#9e9e9e"
        value={name}
        onChangeText={setName}
        accessibilityLabel="Full name"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        placeholderTextColor="#9e9e9e"
        value={email}
        onChangeText={setEmail}
        accessibilityLabel="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Pressable
        style={styles.submitButton}
        onPress={onSubmit}
        accessibilityRole="button"
        accessibilityLabel="Submit application"
      >
        <Text style={styles.submitButtonText}>Submit application</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 48 },
  errorBanner: {
    backgroundColor: '#fdecea',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  errorText: { color: '#c62828', fontSize: 14, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: '#f6f6f8',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#dcdce0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#1565c0',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
