import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import StaticStyledCompanyLink from '@/components/failures/static-styled-company-link';

interface Props {
  faultActive?: boolean;
}

export default function ClickNoVisibleEffectScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!faultActive) {
      setSaved((prev) => !prev);
    }
    // In faulty mode: press event fires but state is never updated — no visible change
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Senior Frontend Engineer — Acme Corp' }} />

      <View
        testID={faultActive ? 'defect:B_CLICK_NO_VISIBLE_EFFECT' : undefined}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.companyLogo}>
            <Text style={styles.logoText}>AC</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.jobTitle}>Senior Frontend Engineer</Text>
            {/* X01 (F-IDT-02): the company byline is a real link disguised as
                metadata. It replaces the static Text so there is no second,
                plainly-static "Acme Corp" node to compare against. */}
            <StaticStyledCompanyLink />
          </View>
          <Pressable
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Remove from saved jobs' : 'Save job'}
            style={styles.saveBtn}
          >
            <Text style={[styles.heartIcon, saved && styles.heartSaved]}>
              {saved ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>📍 Berlin, Germany · Remote</Text>
          <Text style={styles.metaItem}>💼 Full-time</Text>
          <Text style={styles.metaItem}>💰 €80K–€110K / year</Text>
        </View>

        <View style={styles.tags}>
          {['React', 'TypeScript', 'GraphQL', 'Node.js'].map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.description}>
          We are looking for a Senior Frontend Engineer to join our product team. You will work closely with designers and backend engineers to ship exceptional user experiences across web and mobile.
        </Text>

        <Text style={styles.postedAt}>Posted 2 days ago · 34 applicants</Text>

        {saved && (
          <Text style={styles.savedConfirm} accessibilityLiveRegion="polite">
            ✓ Saved to your jobs
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16, paddingBottom: 48 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#1565c0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  headerInfo: { flex: 1 },
  jobTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
  saveBtn: { padding: 4 },
  heartIcon: { fontSize: 26, color: '#bbb' },
  heartSaved: { color: '#e91e63' },
  metaRow: { gap: 6 },
  metaItem: { fontSize: 13, color: '#666' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontSize: 12, color: '#1565c0', fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 22, color: '#444' },
  postedAt: { fontSize: 12, color: '#999' },
  savedConfirm: { fontSize: 14, color: '#2e7d32', fontWeight: '600' },
});
