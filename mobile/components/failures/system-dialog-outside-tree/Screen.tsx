import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

type Phase = 'prompting' | 'granted' | 'denied';

/**
 * A3 — System/permission dialog rendered outside the app a11y tree.
 *
 * Opening "Current location" makes Maps request the location permission, so an
 * OS-style runtime prompt comes up immediately and blocks the task: the map only
 * centers once permission is granted ("While using the app").
 *
 * On a real device this prompt is drawn by a separate *system* window/process.
 * Native automation that captures only the foreground app's a11y tree never
 * receives the dialog's nodes, so a text-only agent is stuck behind a blocker it
 * cannot see or dismiss — while a vision-only agent sees the dialog plainly and
 * taps Allow.
 *
 * Baseline (study remediation: capture the full window stack): the prompt's
 * scrim and buttons are part of the a11y tree, so a text-only agent can grant
 * permission and finish.
 *
 * Faulty (only the app tree is exposed): the whole dialog subtree is flagged out
 * of the a11y tree (`accessibilityElementsHidden` + `no-hide-descendants`). It is
 * still fully drawn and tappable on screen, but absent from the captured tree.
 *
 * Mobile-exclusive: runtime permission prompts and system-owned modal windows
 * are an OS pattern, and app-scoped accessibility capture is the native-automation
 * norm — there is no DOM analogue.
 */
export default function SystemDialogOutsideTreeScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  // The screen requests location on open, so the prompt is already up.
  const [phase, setPhase] = useState<Phase>('prompting');

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_SYSTEM_DIALOG_OUTSIDE_TREE' : undefined}
    >
      <Stack.Screen options={{ title: 'Current Location' }} />

      {/* Faux map canvas. */}
      <View style={styles.map}>
        <View style={[styles.road, styles.roadH, { top: '32%' }]} />
        <View style={[styles.road, styles.roadH, { top: '68%' }]} />
        <View style={[styles.road, styles.roadV, { left: '40%' }]} />
        <View style={[styles.road, styles.roadV, { left: '72%' }]} />

        {phase === 'granted' ? (
          <View style={styles.locationPin}>
            <View style={styles.pinDot} />
            <View style={styles.pinPulse} />
            <Text style={styles.pinLabel}>You are here</Text>
          </View>
        ) : (
          <Text style={styles.mapHint}>Map of your area</Text>
        )}
      </View>

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {phase === 'granted'
            ? '✓ Centered on your current location'
            : phase === 'denied'
              ? 'Location access denied — map cannot center on you'
              : 'Waiting for location permission…'}
        </Text>
      </View>

      {/* "Re-center" control. While the prompt is up it does nothing — the only
          way forward is granting permission in the system dialog. */}
      <Pressable
        style={styles.fab}
        onPress={() => phase === 'denied' && setPhase('prompting')}
        accessibilityRole="button"
        accessibilityLabel="Use current location"
      >
        <Text style={styles.fabIcon}>◎</Text>
      </Pressable>

      {/* The runtime permission dialog — a separate system window on a real
          device. In faulty mode it is drawn but removed from the a11y tree. */}
      {phase === 'prompting' && (
        <View
          style={StyleSheet.absoluteFill}
          accessible={faultActive ? false : undefined}
          accessibilityViewIsModal={!faultActive}
          accessibilityElementsHidden={faultActive}
          importantForAccessibility={faultActive ? 'no-hide-descendants' : 'auto'}
        >
          <View style={styles.scrim} />
          <View style={styles.dialogWrap} pointerEvents="box-none">
            <View style={styles.dialog}>
              <Text style={styles.dialogIcon}>📍</Text>
              <Text style={styles.dialogTitle}>
                Allow “Maps” to access this device’s location?
              </Text>
              <Text style={styles.dialogBody}>
                Maps uses your location to show where you are and find places nearby.
              </Text>

              <View style={styles.dialogButtons}>
                <Pressable
                  style={styles.dialogBtn}
                  onPress={() => setPhase('denied')}
                  accessibilityRole="button"
                  accessibilityLabel="Don’t allow"
                >
                  <Text style={styles.dialogBtnText}>DON’T ALLOW</Text>
                </Pressable>
                <Pressable
                  style={styles.dialogBtn}
                  onPress={() => setPhase('granted')}
                  accessibilityRole="button"
                  accessibilityLabel="While using the app"
                >
                  <Text style={[styles.dialogBtnText, styles.dialogBtnPrimary]}>
                    WHILE USING THE APP
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#dfe6e0' },
  map: { flex: 1, backgroundColor: '#e7ede4', overflow: 'hidden' },
  road: { position: 'absolute', backgroundColor: '#fff' },
  roadH: { left: 0, right: 0, height: 14 },
  roadV: { top: 0, bottom: 0, width: 14 },
  mapHint: {
    position: 'absolute',
    alignSelf: 'center',
    top: '46%',
    color: '#9aa79a',
    fontSize: 14,
    fontWeight: '600',
  },
  locationPin: { position: 'absolute', alignSelf: 'center', top: '44%', alignItems: 'center' },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1a73e8',
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 2,
  },
  pinPulse: {
    position: 'absolute',
    top: -14,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(26,115,232,0.18)',
  },
  pinLabel: {
    marginTop: 6,
    backgroundColor: '#1a73e8',
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  statusBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#d0d6cf',
  },
  statusText: { fontSize: 13, color: '#444', fontWeight: '500' },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 84,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  fabIcon: { fontSize: 24, color: '#1a73e8' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  dialogWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    gap: 12,
    alignItems: 'flex-start',
  },
  dialogIcon: { fontSize: 30 },
  dialogTitle: { fontSize: 18, fontWeight: '700', color: '#202124', lineHeight: 24 },
  dialogBody: { fontSize: 14, color: '#5f6368', lineHeight: 20 },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignSelf: 'stretch',
    gap: 8,
    marginTop: 8,
  },
  dialogBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  dialogBtnText: { fontSize: 13, fontWeight: '700', color: '#5f6368', letterSpacing: 0.3 },
  dialogBtnPrimary: { color: '#1a73e8' },
});
