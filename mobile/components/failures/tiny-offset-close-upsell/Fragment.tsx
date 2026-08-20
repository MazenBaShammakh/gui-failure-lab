import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

/**
 * X32 · M_TINY_OFFSET_CLOSE_UPSELL — F-INS-01 Blocking Modal, Tiny or No Close
 * Affordance. Second observation of the type; hosted on Compose
 * (M_SEND_NO_EFFECT).
 *
 * Mechanism — the close affordance EXISTS but is ~6x6px and sits outside the
 * modal's own frame. Together with X33 this completes the channel matrix for the
 * type:
 *   · B_BLOCKING_MODAL_NO_CLOSE (F9.1, /dashboard): no close control of any kind.
 *     Both channels are trapped; neither has anything to act on.
 *   · X32 (here): the control is fully present and correctly named in the a11y
 *     tree, so a text-only agent activates it by node and escapes immediately. A
 *     vision-only agent must land a tap inside 36 square pixels, offset beyond
 *     the dialog's visual boundary where nothing suggests a control lives.
 *   · X33 (/music/browse): the mirror — drawn and obvious, absent from the tree.
 *
 * The type's name says "tiny OR no close affordance"; these three separate those
 * into distinct, individually attributable observations, which the single
 * existing example could not do.
 *
 *   Baseline: a 32x32 ✕ inside the top-right corner, plus a "Not now" text button.
 *   Faulty:   a 6x6 hit target nudged outside the frame; "Not now" removed.
 *
 *   Fails:    vision-only.
 *   Succeeds: text-only (role=button, label "Close", ordinary activation).
 *
 * Isolation: GATED. The modal is only mounted once "Attach" is pressed, so the
 * host's task (sending the reply) never raises it — the arming check must confirm
 * the defect node is absent before the gate is opened.
 */
export default function TinyOffsetCloseUpsellFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [modalVisible, setModalVisible] = useState(false);
  const [attached, setAttached] = useState(false);

  return (
    <View
      style={styles.wrap}
      testID={faultActive && modalVisible ? 'defect:M_TINY_OFFSET_CLOSE_UPSELL' : undefined}
    >
      <Pressable
        style={styles.attachBtn}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Attach a file"
      >
        <Text style={styles.attachText}>📎 Attach</Text>
      </Pressable>

      {attached && (
        <Text style={styles.attachedNote} accessibilityLiveRegion="polite">
          ✓ quarterly-report.pdf attached
        </Text>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        accessibilityViewIsModal={true}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Pressable
              // Same node, same name, in both modes — only its geometry changes.
              style={faultActive ? styles.closeBtnFaulty : styles.closeBtn}
              onPress={() => setModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={faultActive ? styles.closeGlyphFaulty : styles.closeGlyph}>✕</Text>
            </Pressable>

            <Text style={styles.modalIcon}>📦</Text>
            <Text style={styles.modalTitle}>Attachments over 25 MB</Text>
            <Text style={styles.modalBody}>
              Upgrade to Mail Pro to attach large files, schedule sends, and use custom domains.
            </Text>

            <Pressable
              style={styles.modalCta}
              onPress={() => {
                setAttached(true);
                setModalVisible(false);
              }}
              accessibilityRole="button"
              accessibilityLabel="Attach anyway at reduced quality"
            >
              <Text style={styles.modalCtaText}>Attach anyway</Text>
            </Pressable>

            {!faultActive && (
              <Pressable
                style={styles.notNow}
                onPress={() => setModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Not now"
              >
                <Text style={styles.notNowText}>Not now</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10 },
  attachBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#eceff1',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  attachText: { fontSize: 13, color: '#37474f', fontWeight: '700' },
  attachedNote: { fontSize: 13, color: '#2e7d32', fontWeight: '700', marginTop: 10 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  // Baseline: comfortably inside the dialog, comfortably tappable.
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eceff1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeGlyph: { fontSize: 15, color: '#546e7a', fontWeight: '700' },
  // Faulty: 6x6, and pushed beyond the modal's own corner onto the scrim, where
  // no visual boundary implies a control.
  closeBtnFaulty: {
    position: 'absolute',
    top: -9,
    right: -9,
    width: 6,
    height: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeGlyphFaulty: { fontSize: 5, color: 'rgba(255,255,255,0.55)', lineHeight: 6 },

  modalIcon: { fontSize: 34 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#111', textAlign: 'center' },
  modalBody: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20 },
  modalCta: {
    backgroundColor: '#1565c0',
    borderRadius: 22,
    paddingHorizontal: 26,
    paddingVertical: 12,
    marginTop: 6,
  },
  modalCtaText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  notNow: { paddingVertical: 8 },
  notNowText: { color: '#78909c', fontSize: 13, fontWeight: '700' },
});
