import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
  posted: string;
}

// The job whose detail page is the "Save job" screen.
export const HERO_JOB_ID = 'acme';

export const MOCK_JOBS: Job[] = [
  { id: 'acme', title: 'Senior Frontend Engineer', company: 'Acme Corp', location: 'Berlin, Germany · Remote', salary: '€80K–€110K', tags: ['React', 'TypeScript', 'GraphQL', 'Node.js'], posted: '2d ago' },
  { id: '1', title: 'Product Designer', company: 'Figma', location: 'San Francisco, CA', salary: '$130K–$160K', tags: ['Figma', 'UX', 'Prototyping'], posted: '1d ago' },
  { id: '2', title: 'Data Engineer', company: 'Stripe', location: 'Remote', salary: '$140K–$180K', tags: ['Python', 'Spark', 'dbt'], posted: '2d ago' },
  { id: '3', title: 'iOS Developer', company: 'Spotify', location: 'Stockholm, Sweden', salary: '€90K–€120K', tags: ['Swift', 'SwiftUI', 'Objective-C'], posted: '3d ago' },
  { id: '4', title: 'Backend Engineer', company: 'Shopify', location: 'Ottawa, Canada', salary: 'CAD $120K–$150K', tags: ['Go', 'Ruby', 'GraphQL'], posted: '4d ago' },
  { id: '5', title: 'ML Engineer', company: 'DeepMind', location: 'London, UK', salary: '£100K–£140K', tags: ['Python', 'PyTorch', 'TensorFlow'], posted: '5d ago' },
];

interface Props {
  faultActive?: boolean;
}

export default function AsyncContentLateRenderScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[] | null>(null);

  useEffect(() => {
    // Baseline: 500ms — fast enough for agents to see content after snapshot
    // Faulty: 5000ms — agent snapshots DOM while only the loading spinner is visible
    const delay = faultActive ? 5000 : 500;
    const timer = setTimeout(() => setJobs(MOCK_JOBS), delay);
    return () => clearTimeout(timer);
  }, [faultActive]);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:B_ASYNC_CONTENT_LATE_RENDER' : undefined}
    >
      <Stack.Screen options={{ title: 'Job Search Results' }} />

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchQuery}>“frontend engineer” · Remote</Text>
      </View>

      {jobs === null ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1565c0" />
          <Text style={styles.loadingTitle}>Finding matching jobs…</Text>
          <Text style={styles.loadingSubtitle}>Searching 12,000+ listings</Text>
        </View>
      ) : (
        <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent}>
          <Text style={styles.resultsCount}>{jobs.length} jobs found</Text>
          {jobs.map((job) => (
            <Pressable
              key={job.id}
              style={styles.jobCard}
              onPress={() => router.push(`/careers/job/${job.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`${job.title} at ${job.company}, ${job.location}`}
            >
              <View style={styles.jobHeader}>
                <View style={styles.companyBadge}>
                  <Text style={styles.companyInitial}>{job.company[0]}</Text>
                </View>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobCompany}>{job.company}</Text>
                </View>
                <Text style={styles.postedAt}>{job.posted}</Text>
              </View>
              <Text style={styles.jobLocation}>📍 {job.location}</Text>
              <Text style={styles.jobSalary}>💰 {job.salary}</Text>
              <View style={styles.tagRow}>
                {job.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: { fontSize: 16 },
  searchQuery: { fontSize: 14, color: '#333', flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  loadingSubtitle: { fontSize: 13, color: '#888' },
  results: { flex: 1 },
  resultsContent: { paddingHorizontal: 16, paddingBottom: 48 },
  resultsCount: { fontSize: 13, color: '#888', marginBottom: 12 },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  jobHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  companyBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1565c0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyInitial: { color: '#fff', fontWeight: '700', fontSize: 16 },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  jobCompany: { fontSize: 13, color: '#555', marginTop: 1 },
  postedAt: { fontSize: 11, color: '#999' },
  jobLocation: { fontSize: 13, color: '#555' },
  jobSalary: { fontSize: 13, color: '#555' },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { backgroundColor: '#e3f2fd', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, color: '#1565c0', fontWeight: '600' },
});
