import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, Stack } from 'expo-router';
import type { Href } from 'expo-router';

const FAILURES: { id: string; defectCode: string; title: string }[] = [
  { id: 'non-clickable-normal-cta', defectCode: 'B_NON_CLICKABLE_NORMAL_CTA', title: 'Non-clickable but visually normal CTA' },
  { id: 'click-no-visible-effect', defectCode: 'B_CLICK_NO_VISIBLE_EFFECT', title: 'Clickable but no visible effect after click' },
  { id: 'action-not-exposed-in-tree', defectCode: 'M_ACTION_NOT_EXPOSED_IN_TREE', title: 'Action not exposed in a11y tree' },
  { id: 'missing-accessible-name', defectCode: 'M_MISSING_ACCESSIBLE_NAME', title: 'Key element missing accessible name' },
  { id: 'blocking-modal-no-close', defectCode: 'B_BLOCKING_MODAL_NO_CLOSE', title: 'Blocking modal with no close control' },
  { id: 'async-content-late-render', defectCode: 'B_ASYNC_CONTENT_LATE_RENDER', title: 'Async content renders after agent snapshots DOM' },
  { id: 'ghost-element-no-backing-node', defectCode: 'B_GHOST_ELEMENT_NO_BACKING_NODE', title: 'Ghost elements with no visible backing' },
  { id: 'dense-touch-targets', defectCode: 'B_DENSE_TOUCH_TARGETS', title: 'Small or densely arranged touch targets' },
  { id: 'swipe-ambiguous-direction', defectCode: 'B_SWIPE_AMBIGUOUS_DIRECTION', title: 'Swipe-to-delete ambiguity (no confirmation)' },
  { id: 'long-press-context-menu', defectCode: 'B_LONG_PRESS_ONLY_CONTEXT_MENU', title: 'Long-press-only context menu (Edit/Delete hidden)' },
  { id: 'custom-slider-missing-a11y', defectCode: 'M_CUSTOM_SLIDER_MISSING_A11Y_SEMANTICS', title: 'Custom slider missing a11y role, value, and bounds' },
];

export default function IndexScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'gui-failure-lab' }} />
      <Text style={styles.heading}>GUI Failure Lab — Mobile</Text>
      <Text style={styles.subheading}>Tap a variant to open a failure scenario</Text>

      {FAILURES.map((failure) => (
        <View key={failure.id} style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.title}>{failure.title}</Text>
            <Text style={styles.code}>{failure.defectCode}</Text>
          </View>
          <View style={styles.links}>
            <Link
              href={`/baseline/failures/${failure.id}` as Href}
              style={[styles.link, styles.baselineLink]}
              accessibilityLabel={`Baseline: ${failure.title}`}
              accessibilityRole="link"
            >
              Baseline
            </Link>
            <Link
              href={`/faulty/failures/${failure.id}` as Href}
              style={[styles.link, styles.faultyLink]}
              accessibilityLabel={`Faulty: ${failure.title}`}
              accessibilityRole="link"
            >
              Faulty
            </Link>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 4, color: '#111' },
  subheading: { fontSize: 13, color: '#777', marginBottom: 24 },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
    paddingVertical: 14,
  },
  info: { marginBottom: 10 },
  title: { fontSize: 15, fontWeight: '600', color: '#111' },
  code: { fontSize: 11, color: '#999', fontFamily: 'monospace', marginTop: 3 },
  links: { flexDirection: 'row', gap: 8 },
  link: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    fontSize: 13,
    fontWeight: '600',
    overflow: 'hidden',
  },
  baselineLink: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
  faultyLink: { backgroundColor: '#fce4ec', color: '#c62828' },
});
