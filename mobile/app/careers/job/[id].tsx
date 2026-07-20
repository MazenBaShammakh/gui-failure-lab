import { useLocalSearchParams, Stack } from 'expo-router';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ClickNoVisibleEffect from '@/components/failures/click-no-visible-effect';
import { MOCK_JOBS, HERO_JOB_ID } from '@/components/failures/async-content-late-render/Screen';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // The hero job opens the dedicated "Save job" screen.
  if (id === HERO_JOB_ID) return <ClickNoVisibleEffect />;

  const job = MOCK_JOBS.find((j) => j.id === id);

  if (!job) {
    return (
      <View style={styles.notFound}>
        <Stack.Screen options={{ title: 'Job' }} />
        <Text style={styles.notFoundText}>Job not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: job.title }} />

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{job.company[0]}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{job.title}</Text>
            <Text style={styles.company}>{job.company}</Text>
          </View>
        </View>

        <Text style={styles.meta}>📍 {job.location}</Text>
        <Text style={styles.meta}>💰 {job.salary}</Text>
        <Text style={styles.meta}>🕑 Posted {job.posted}</Text>

        <View style={styles.tags}>
          {job.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.description}>
          Join the {job.company} team as a {job.title}. You will collaborate across
          functions to design, build, and ship products used by millions.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16, paddingBottom: 48 },
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
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  notFoundText: { fontSize: 15, color: '#888' },
});
