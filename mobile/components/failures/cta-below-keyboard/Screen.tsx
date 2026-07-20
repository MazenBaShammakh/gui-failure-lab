import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

export default function CtaBelowKeyboardScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cover, setCover] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const form = (
    <>
      <Text style={styles.heading}>Apply — Senior Frontend Engineer</Text>
      <Text style={styles.subheading}>Acme Corp · Berlin, Germany · Remote</Text>

      <Text style={styles.label}>Full name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Jane Doe"
        placeholderTextColor="#aaa"
        accessibilityLabel="Full name"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="jane@example.com"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        accessibilityLabel="Email"
      />

      <Text style={styles.label}>Cover letter</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={cover}
        onChangeText={setCover}
        placeholder="Tell us why you're a great fit…"
        placeholderTextColor="#aaa"
        multiline
        textAlignVertical="top"
        accessibilityLabel="Cover letter"
      />

      <Pressable
        style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed]}
        onPress={() => setSubmitted(true)}
        accessibilityRole="button"
        accessibilityLabel="Submit application"
      >
        <Text style={styles.submitBtnText}>Submit application</Text>
      </Pressable>

      {submitted && (
        <Text style={styles.confirmation} accessibilityLiveRegion="polite">
          ✓ Application submitted
        </Text>
      )}
    </>
  );

  // Faulty: no KeyboardAvoidingView, no ScrollView. The form lives in a
  // fixed-height container clipped to a height that pushes the Submit button
  // below the fold. When the cover-letter field is focused (native) the
  // on-screen keyboard also covers it. On web there is no scroll path either,
  // so Submit is simply clipped out of reach. Nothing hints it is hidden.
  if (faultActive) {
    return (
      <View
        style={styles.container}
        testID="defect:M_CTA_BELOW_KEYBOARD"
      >
        <Stack.Screen options={{ title: 'Job Application' }} />
        <View style={styles.faultyClip}>
          <View style={styles.content}>{form}</View>
        </View>
      </View>
    );
  }

  // Baseline: KeyboardAvoidingView + ScrollView keep Submit reachable.
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ title: 'Job Application' }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {form}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  // Faulty: clip the form to a fixed height shorter than its content so the
  // Submit button at the bottom is rendered below the fold with no way to scroll.
  faultyClip: { height: 380, overflow: 'hidden' },
  content: { padding: 20, paddingBottom: 48, gap: 8 },
  heading: { fontSize: 20, fontWeight: '700', color: '#111' },
  subheading: { fontSize: 13, color: '#777', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#fff',
  },
  textArea: { height: 120 },
  submitBtn: {
    backgroundColor: '#1565c0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnPressed: { opacity: 0.8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  confirmation: { fontSize: 14, color: '#2e7d32', fontWeight: '600', marginTop: 12 },
});
