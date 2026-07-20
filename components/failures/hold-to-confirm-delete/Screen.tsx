import { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

// How long the press must be sustained before the delete fires.
const HOLD_MS = 1500;

/**
 * B16 — Timed press-and-hold required (push-to-talk, hold-to-confirm)
 * (Interaction Scope).
 *
 * The destructive action fires only after a sustained press. A tap no-ops, so a
 * vision agent's natural tap does nothing, and synthesizing a correctly-timed held
 * press is unreliable. The differential only holds because the underlying action is
 * ALSO exposed as an ordinary activatable node — a custom "Confirm account deletion"
 * AccessibilityAction — which a text agent invokes directly, bypassing the timing.
 *
 *   Baseline (remediation): a plain tap-to-delete button (a tap-with-confirm
 *   alternative to the hold) — a vision agent taps it and it fires.
 *
 *   Faulty: the button looks identical to the baseline delete button (same label
 *   and styling) with no painted hint that a hold is required, but a tap no-ops —
 *   only a press sustained for HOLD_MS fires. The delete action is exposed in the
 *   tree as a custom action, so a text agent fires it directly.
 *
 *   Fails: vision-only (timed-hold synthesis).
 *   Succeeds: text-only (direct action invocation).
 *
 * Caveat (B4 family): pointer press-hold exists on web, so press-and-hold is not
 * native-only — push-to-talk / hold-to-confirm is merely the native touch idiom.
 * The differential also depends on the held gesture mapping to an exposed action
 * rather than being purely gesture-detected (it is, here, via the custom action).
 * Remediation: expose the action as an activatable node and offer a tap-with-confirm
 * alternative.
 *
 * NOTE: the text-success path depends on the custom AccessibilityAction being read
 * and invoked from the native device tree. React Native Web does not surface
 * accessibilityActions, so the direct-invocation arm is faithful on the native
 * build; on web only the inert-tap / hold visual arm is reproduced.
 */
export default function HoldToConfirmDeleteScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [deleted, setDeleted] = useState(false);
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doDelete = useCallback(() => {
    setHolding(false);
    setDeleted(true);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Faulty: a tap merely starts then cancels the hold timer → no-op. Only a press
  // sustained for HOLD_MS fires the delete.
  const startHold = useCallback(() => {
    if (deleted) return;
    setHolding(true);
    clearTimer();
    timerRef.current = setTimeout(doDelete, HOLD_MS);
  }, [deleted, doDelete, clearTimer]);

  const endHold = useCallback(() => {
    setHolding(false);
    clearTimer();
  }, [clearTimer]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Delete Account' }} />

      <View
        style={styles.card}
        testID={faultActive ? 'defect:M_HOLD_TO_CONFIRM_DELETE' : undefined}
      >
        <Text style={styles.warnIcon}>⚠️</Text>
        <Text style={styles.title}>Delete your account</Text>
        <Text style={styles.body}>
          This permanently removes your Aurora account, all saved data, and cannot
          be undone.
        </Text>

        {deleted ? (
          <Text style={styles.confirmation} accessibilityLiveRegion="polite">
            ✓ Your account has been deleted
          </Text>
        ) : faultActive ? (
          // Faulty: the button is visually identical to the baseline delete button
          // — same label, same styling — but a tap no-ops. Only a press sustained
          // for HOLD_MS fires. There is no painted hint that a hold is required, so
          // a vision agent taps it and nothing happens. The delete is exposed as a
          // direct custom action for the tree, which a text agent invokes.
          <Pressable
            style={[styles.deleteBtn, holding && styles.deleteBtnPressed]}
            onPressIn={startHold}
            onPressOut={endHold}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
            accessibilityActions={[
              { name: 'confirm_delete', label: 'Confirm account deletion' },
            ]}
            onAccessibilityAction={(event) => {
              if (event.nativeEvent.actionName === 'confirm_delete') doDelete();
            }}
          >
            <Text style={styles.deleteBtnText}>Delete account</Text>
          </Pressable>
        ) : (
          // Baseline: an ordinary tap-to-delete button — a tap fires it.
          <Pressable
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
            onPress={doDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
          >
            <Text style={styles.deleteBtnText}>Delete account</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f3f7' },
  content: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  warnIcon: { fontSize: 44 },
  title: { fontSize: 20, fontWeight: '700', color: '#111', textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 21, color: '#666', textAlign: 'center', marginBottom: 8 },

  confirmation: { fontSize: 15, color: '#2e7d32', fontWeight: '700', marginTop: 8 },

  deleteBtn: {
    alignSelf: 'stretch',
    backgroundColor: '#d32f2f',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteBtnPressed: { opacity: 0.85 },
  deleteBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
