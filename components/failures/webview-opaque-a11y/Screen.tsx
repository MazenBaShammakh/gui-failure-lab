import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

/**
 * A1 — WebView/hybrid content opaque in the native a11y tree.
 *
 * The Banking app embeds a web-based card-application form inside a native shell
 * (header chrome + a "secure.aurorabank.com" address chip frame the embedded
 * WebView). The form itself — name/email fields and the Submit button — is web
 * content rendered by the WebView.
 *
 * Baseline: the WebView accessibility bridge is enabled, so the virtual view
 * hierarchy is projected into the native a11y tree — every field and the submit
 * button appear as their own nodes (a text-only agent can read and operate them).
 *
 * Faulty: the bridge is disabled. The entire web subtree is collapsed into a
 * single opaque node (`accessibilityElementsHidden` + `no-hide-descendants`),
 * with the WebView container exposed as one black-box node. The form is still
 * fully *visible* (vision-only renders and operates it normally), but a
 * text-only agent sees one node with no buttons or links inside it.
 *
 * This native↔web a11y boundary only exists inside a native host; in a plain
 * browser the DOM is fully available, so there is no opaque container.
 */
export default function WebViewOpaqueA11yScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0;

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_WEBVIEW_OPAQUE_A11Y_TREE' : undefined}
    >
      <Stack.Screen options={{ title: 'Card Application' }} />

      {/* Native shell chrome — this part lives in the native a11y tree either way. */}
      <View style={styles.browserBar} accessible accessibilityRole="header">
        <Text style={styles.lock}>🔒</Text>
        <View style={styles.addressChip}>
          <Text style={styles.addressText} numberOfLines={1}>
            secure.aurorabank.com
          </Text>
        </View>
        <Text style={styles.reload}>⟳</Text>
      </View>

      {/*
        Embedded WebView. In faulty mode the whole web subtree is hidden from the
        native a11y tree and the container is exposed as a single opaque node —
        mimicking a WebView whose accessibility bridge was never wired up.
      */}
      <View
        style={styles.webview}
        accessible={faultActive}
        accessibilityRole={faultActive ? 'image' : undefined}
        accessibilityLabel={faultActive ? 'Web content' : undefined}
        accessibilityElementsHidden={faultActive}
        importantForAccessibility={faultActive ? 'no-hide-descendants' : 'auto'}
      >
        <ScrollView contentContainerStyle={styles.webContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>Apply for the Aurora Cashback Card</Text>
          <Text style={styles.subheading}>
            3% back on groceries · no annual fee. Complete the form below to apply.
          </Text>

          {submitted ? (
            <View style={styles.successCard} accessible accessibilityRole="text">
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>Application submitted</Text>
              <Text style={styles.successBody}>
                Thanks, {name.trim()}. We'll email a decision to {email.trim()} within 2 business
                days.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Full name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Jane Appleseed"
                  placeholderTextColor="#aaa"
                  accessibilityLabel="Full name"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Email address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="jane@example.com"
                  placeholderTextColor="#aaa"
                  accessibilityLabel="Email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Pressable
                onPress={() => canSubmit && setSubmitted(true)}
                disabled={!canSubmit}
                accessibilityRole="button"
                accessibilityLabel="Submit application"
                accessibilityState={{ disabled: !canSubmit }}
                style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              >
                <Text style={styles.submitText}>Submit application</Text>
              </Pressable>

              <Text style={styles.legal}>
                By submitting you agree to the cardholder terms and a soft credit check.
              </Text>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eceff1' },
  browserBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d0d0d0',
  },
  lock: { fontSize: 12 },
  addressChip: {
    flex: 1,
    backgroundColor: '#e4e6ea',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addressText: { fontSize: 13, color: '#444', textAlign: 'center' },
  reload: { fontSize: 16, color: '#666' },
  webview: { flex: 1, backgroundColor: '#fff' },
  webContent: { padding: 20, gap: 16 },
  heading: { fontSize: 22, fontWeight: '700', color: '#1a237e' },
  subheading: { fontSize: 14, color: '#555', lineHeight: 20 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#cfd2d6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#fafbfc',
  },
  submitBtn: {
    backgroundColor: '#1a237e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: { backgroundColor: '#b0b6cc' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  legal: { fontSize: 12, color: '#999', lineHeight: 17 },
  successCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  successIcon: { fontSize: 40 },
  successTitle: { fontSize: 18, fontWeight: '700', color: '#1b5e20' },
  successBody: { fontSize: 14, color: '#33691e', textAlign: 'center', lineHeight: 20 },
});
