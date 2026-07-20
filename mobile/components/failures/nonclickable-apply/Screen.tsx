import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

export default function NonclickableApplyScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [applied, setApplied] = useState(false);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_NONCLICKABLE_APPLY' : undefined}
    >
      <Stack.Screen options={{ title: 'Product Designer — Figma' }} />

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>F</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Product Designer</Text>
            <Text style={styles.company}>Figma</Text>
          </View>
        </View>

        <Text style={styles.meta}>📍 San Francisco, CA</Text>
        <Text style={styles.meta}>💰 $130K–$160K</Text>
        <Text style={styles.meta}>🕑 Posted 1d ago</Text>

        <View style={styles.tags}>
          {['Figma', 'UX', 'Prototyping'].map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.description}>
          Join the Figma team as a Product Designer. You will craft intuitive
          interfaces, run user research, and partner with engineering to ship
          features used by millions of designers worldwide.
        </Text>

        {applied && (
          <Text style={styles.confirmation} accessibilityLiveRegion="polite">
            ✓ Application submitted — we&apos;ll be in touch!
          </Text>
        )}
      </View>

      {/* Faulty: a plain styled View — looks identical to a button but has no
          Pressable/onPress, so tapping "Apply now" does nothing.
          Baseline: a working Pressable that confirms the application. */}
      {faultActive ? (
        <View
          style={styles.applyBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Apply now"
        >
          <Text style={styles.applyBtnText}>Apply now</Text>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.applyBtn, pressed && styles.applyBtnPressed]}
          onPress={() => setApplied(true)}
          accessibilityRole="button"
          accessibilityLabel="Apply now"
        >
          <Text style={styles.applyBtnText}>Apply now</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16, paddingBottom: 48, gap: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#1565c0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  headerInfo: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  company: { fontSize: 14, color: '#555', marginTop: 2 },
  meta: { fontSize: 14, color: '#555' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  tag: { backgroundColor: '#e3f2fd', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, color: '#1565c0', fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 22, color: '#444', marginTop: 4 },
  confirmation: { fontSize: 14, color: '#2e7d32', fontWeight: '600', marginTop: 8 },
  applyBtn: {
    backgroundColor: '#1565c0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyBtnPressed: { opacity: 0.8 },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
