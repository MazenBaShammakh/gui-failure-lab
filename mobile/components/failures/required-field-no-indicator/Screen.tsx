import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import SystemPhotoPickerCompose from '@/components/failures/system-photo-picker-compose';

interface Props {
  faultActive?: boolean;
}

const AUDIENCES = ['Public', 'Friends', 'Only me'];

export default function RequiredFieldNoIndicatorScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [text, setText] = useState('');
  const [audience, setAudience] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const onPublish = () => {
    if (!text.trim()) return;
    if (!audience) {
      // Baseline: rejection is surfaced via an error banner. Faulty: the
      // publish silently no-ops instead — no indicator up front and no
      // error on submit, so the requiredness is undiscoverable either way.
      if (!faultActive) {
        setError('Please select an audience before posting.');
      }
      return;
    }
    setError(null);
    setPosted(true);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_REQUIRED_FIELD_NO_INDICATOR' : undefined}
    >
      <Stack.Screen options={{ title: 'Create Post' }} />

      {posted && (
        <View style={styles.successBanner} accessibilityLiveRegion="polite">
          <Text style={styles.successText}>✓ Posted</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorBanner} accessibilityLiveRegion="polite">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.label}>What&apos;s on your mind?</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Share an update..."
        placeholderTextColor="#9e9e9e"
        value={text}
        onChangeText={setText}
        accessibilityLabel="Post text"
        multiline
      />

      {/* X12 (F-PRC-04): GATED. The system photo picker is only mounted once
          "Attach a photo" is pressed, so the host's publish task never raises
          it. */}
      <SystemPhotoPickerCompose />

      {/* Baseline: the required marker is visible before any submit attempt.
          Faulty: identical field, no asterisk/"Required" hint — its
          requiredness is only discoverable by getting rejected on submit. */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>Audience</Text>
        {!faultActive && <Text style={styles.requiredMark}> *</Text>}
      </View>
      {!faultActive && <Text style={styles.requiredHint}>Required</Text>}

      <View style={styles.audienceRow}>
        {AUDIENCES.map((a) => (
          <Pressable
            key={a}
            onPress={() => setAudience(a)}
            accessibilityRole="button"
            accessibilityLabel={a}
            style={[styles.audiencePill, audience === a && styles.audiencePillActive]}
          >
            <Text
              style={[
                styles.audiencePillText,
                audience === a && styles.audiencePillTextActive,
              ]}
            >
              {a}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.publishButton}
        onPress={onPublish}
        accessibilityRole="button"
        accessibilityLabel="Publish"
      >
        <Text style={styles.publishButtonText}>Publish</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 48 },
  successBanner: { backgroundColor: '#e8f5e9', borderRadius: 10, padding: 14, marginBottom: 16 },
  successText: { color: '#2e7d32', fontSize: 14, fontWeight: '600' },
  errorBanner: { backgroundColor: '#fdecea', borderRadius: 10, padding: 14, marginBottom: 16 },
  errorText: { color: '#c62828', fontSize: 14, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', color: '#555' },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  requiredMark: { fontSize: 13, fontWeight: '700', color: '#c62828' },
  requiredHint: { fontSize: 11, color: '#c62828', marginTop: 2, marginBottom: 6 },
  textArea: {
    backgroundColor: '#f6f6f8',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#dcdce0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 20,
    marginTop: 6,
  },
  audienceRow: { flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 20 },
  audiencePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  audiencePillActive: { backgroundColor: '#0277bd' },
  audiencePillText: { fontSize: 14, fontWeight: '600', color: '#555' },
  audiencePillTextActive: { color: '#fff' },
  publishButton: {
    backgroundColor: '#0277bd',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  publishButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
