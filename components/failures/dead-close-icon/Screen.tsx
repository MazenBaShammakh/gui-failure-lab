import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

export default function DeadCloseIconScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  // The help dialog is shown on entry; the task is to close it.
  const [dialogOpen, setDialogOpen] = useState(true);

  // Faulty: the ✕ close handler is inert — the dialog can never be dismissed
  // (a trap). Baseline: ✕ closes the dialog.
  const closeDialog = () => {
    if (faultActive) return;
    setDialogOpen(false);
  };

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DEAD_CLOSE_ICON' : undefined}
    >
      <Stack.Screen options={{ title: 'Help' }} />

      <View style={styles.content}>
        <Text style={styles.pageTitle}>Help & Support</Text>
        <Text style={styles.pageBody}>
          Browse common questions or contact our team. You can reopen tips any time
          from the menu.
        </Text>

        {dialogOpen ? (
          <Text style={styles.hint}>A welcome dialog is open.</Text>
        ) : (
          <Text style={styles.hint} accessibilityLiveRegion="polite">
            Dialog closed. You&apos;re all set.
          </Text>
        )}
      </View>

      <Modal
        visible={dialogOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDialog}
      >
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>What&apos;s new</Text>
              {/* Faulty: ✕ is inert (handler no-ops) — dialog can't be dismissed.
                  Baseline: ✕ closes the dialog. */}
              <Pressable
                onPress={closeDialog}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
                style={styles.closeBtn}
                hitSlop={10}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>
            <Text style={styles.dialogBody}>
              Quick tips were updated for this release. Tap the ✕ to dismiss this
              message and continue to Help & Support.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f3f7' },
  content: { padding: 24, gap: 12 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#111' },
  pageBody: { fontSize: 15, color: '#444', lineHeight: 22 },
  hint: { fontSize: 13, color: '#888', marginTop: 8 },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  dialogHeader: { flexDirection: 'row', alignItems: 'center' },
  dialogTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#111' },
  closeBtn: { padding: 4 },
  closeIcon: { fontSize: 20, color: '#888', fontWeight: '600' },
  dialogBody: { fontSize: 14, color: '#555', lineHeight: 20 },
});
