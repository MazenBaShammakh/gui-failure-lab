import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Job {
  id: string;
  title: string;
  company: string;
  level: 'Entry' | 'Mid' | 'Senior';
  color: string;
}

const JOBS: Job[] = [
  { id: 'j1', title: 'Software Engineer', company: 'Vertex Labs', level: 'Mid', color: '#5c6bc0' },
  { id: 'j2', title: 'Software Engineer', company: 'Bright Systems', level: 'Entry', color: '#26a69a' },
  { id: 'j3', title: 'Software Engineer', company: 'Cobalt Works', level: 'Mid', color: '#8d6e63' },
  { id: 'j4', title: 'Software Engineer', company: 'Northwind Data', level: 'Entry', color: '#7e57c2' },
  { id: 'j5', title: 'Software Engineer', company: 'Ridgeline Tech', level: 'Mid', color: '#42a5f5' },
  { id: 'j6', title: 'Software Engineer', company: 'Harbor Cloud', level: 'Entry', color: '#66bb6a' },
  { id: 'j7', title: 'Software Engineer', company: 'Pinecone Apps', level: 'Mid', color: '#ec407a' },
  { id: 'j8', title: 'Senior Backend Engineer', company: 'Nimbus Cloud', level: 'Senior', color: '#ff7043' },
  { id: 'j9', title: 'Software Engineer', company: 'Lumen Digital', level: 'Entry', color: '#26c6da' },
  { id: 'j10', title: 'Software Engineer', company: 'Solstice Soft', level: 'Mid', color: '#9ccc65' },
  { id: 'j11', title: 'Software Engineer', company: 'Vantage Point', level: 'Entry', color: '#ab47bc' },
  { id: 'j12', title: 'Software Engineer', company: 'Meridian Apps', level: 'Mid', color: '#5c6bc0' },
  { id: 'j13', title: 'Software Engineer', company: 'Anchor Digital', level: 'Entry', color: '#26a69a' },
  { id: 'j14', title: 'Software Engineer', company: 'Beacon Tech', level: 'Mid', color: '#8d6e63' },
  { id: 'j15', title: 'Software Engineer', company: 'Foundry Labs', level: 'Entry', color: '#7e57c2' },
];

export default function ClutteredSimilarListScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [opened, setOpened] = useState<Job | null>(null);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_CLUTTERED_SIMILAR_LIST' : undefined}
    >
      <Stack.Screen options={{ title: 'All Openings' }} />

      {opened && (
        <View style={styles.banner} accessibilityLiveRegion="polite">
          <Text style={styles.bannerText}>
            Opened {opened.title} at {opened.company}
          </Text>
        </View>
      )}

      <FlatList
        data={JOBS}
        keyExtractor={(j) => j.id}
        renderItem={({ item }) =>
          !faultActive ? (
            // Baseline: each row carries a distinct colored company badge and
            // a level pill, so the target row is quick to spot on scan.
            <Pressable
              onPress={() => setOpened(item)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.title} at ${item.company}`}
              style={styles.rowBaseline}
            >
              <View style={[styles.logoBadge, { backgroundColor: item.color }]}>
                <Text style={styles.logoInitial}>{item.company[0]}</Text>
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowCompany}>{item.company}</Text>
              </View>
              <Text
                style={[
                  styles.levelBadge,
                  item.level === 'Senior' && styles.levelBadgeSenior,
                ]}
              >
                {item.level}
              </Text>
            </Pressable>
          ) : (
            // Faulty: same generic icon, same gray weight, no badges — ~15
            // near-identical rows force a slow manual read of every title.
            <Pressable
              onPress={() => setOpened(item)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.title} at ${item.company}`}
              style={styles.rowFaulty}
            >
              <View style={styles.logoBadgeFaulty}>
                <Text style={styles.logoIconFaulty}>🏢</Text>
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitleFaulty}>{item.title}</Text>
                <Text style={styles.rowCompanyFaulty}>{item.company}</Text>
              </View>
            </Pressable>
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  banner: { backgroundColor: '#e3f2fd', padding: 14 },
  bannerText: { color: '#1565c0', fontSize: 14, fontWeight: '600' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#eee', marginLeft: 68 },

  rowBaseline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitial: { color: '#fff', fontSize: 17, fontWeight: '800' },
  rowInfo: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  rowCompany: { fontSize: 13, color: '#777' },
  levelBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeSenior: { color: '#e65100', backgroundColor: '#fff3e0' },

  rowFaulty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  logoBadgeFaulty: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIconFaulty: { fontSize: 15 },
  rowTitleFaulty: { fontSize: 14, fontWeight: '500', color: '#666' },
  rowCompanyFaulty: { fontSize: 13, color: '#999' },
});
