import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
}

const ALL_JOBS: Job[] = [
  { id: '1', title: 'Senior Frontend Engineer', company: 'Acme Corp', location: 'Remote' },
  { id: '2', title: 'Product Designer', company: 'Figma', location: 'San Francisco, CA' },
  { id: '3', title: 'Data Engineer', company: 'Stripe', location: 'Remote' },
  { id: '4', title: 'iOS Developer', company: 'Spotify', location: 'Stockholm, Sweden' },
  { id: '5', title: 'Backend Engineer', company: 'Shopify', location: 'Ottawa, Canada' },
  { id: '6', title: 'ML Engineer', company: 'DeepMind', location: 'London, UK' },
];

const LOCATIONS = ['All locations', 'Remote', 'San Francisco, CA', 'Stockholm, Sweden', 'Ottawa, Canada', 'London, UK'];

export default function DeadDropdownScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('All locations');

  const filtered =
    selected === 'All locations'
      ? ALL_JOBS
      : ALL_JOBS.filter((j) => j.location === selected);

  // Faulty: tapping the dropdown does nothing — the options never open, so the
  // user can never choose "Remote". Baseline: the dropdown opens its options.
  const handleOpen = () => {
    if (faultActive) return;
    setOpen(true);
  };

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DEAD_DROPDOWN' : undefined}
    >
      <Stack.Screen options={{ title: 'Filter Jobs' }} />

      <Text style={styles.label}>Location</Text>
      <Pressable
        style={({ pressed }) => [styles.select, pressed && !faultActive && styles.selectPressed]}
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel={`Location filter: ${selected}`}
      >
        <Text style={styles.selectText}>{selected}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Text style={styles.resultsCount}>{filtered.length} jobs</Text>

      <View style={styles.list}>
        {filtered.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobCompany}>{job.company}</Text>
            <Text style={styles.jobLocation}>📍 {job.location}</Text>
          </View>
        ))}
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Select location</Text>
            {LOCATIONS.map((loc) => (
              <Pressable
                key={loc}
                style={styles.option}
                onPress={() => {
                  setSelected(loc);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={loc}
              >
                <Text style={[styles.optionText, loc === selected && styles.optionSelected]}>
                  {loc}
                </Text>
                {loc === selected && <Text style={styles.check}>✓</Text>}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16, gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#444' },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectPressed: { backgroundColor: '#f0f0f0' },
  selectText: { fontSize: 15, color: '#111' },
  chevron: { fontSize: 14, color: '#888' },
  resultsCount: { fontSize: 13, color: '#888', marginTop: 8 },
  list: { gap: 12, marginTop: 4 },
  jobCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 4 },
  jobTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  jobCompany: { fontSize: 13, color: '#555' },
  jobLocation: { fontSize: 13, color: '#555' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 32 },
  sheet: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 8 },
  sheetTitle: {
    fontSize: 13,
    color: '#999',
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionText: { fontSize: 16, color: '#111' },
  optionSelected: { fontWeight: '700', color: '#1565c0' },
  check: { fontSize: 16, color: '#1565c0', fontWeight: '700' },
});
