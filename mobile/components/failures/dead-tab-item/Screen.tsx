import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import UntreedCloseSubscription from '@/components/failures/untreed-close-subscription';

interface Props {
  faultActive?: boolean;
}

type TabKey = 'library' | 'search' | 'profile';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'library', label: 'Library', icon: '📚' },
  { key: 'search', label: 'Search', icon: '🔍' },
  { key: 'profile', label: 'Profile', icon: '👤' },
];

function TabContent({ tab }: { tab: TabKey }) {
  if (tab === 'library') {
    return (
      <View style={styles.panel}>
        <Text style={styles.panelHeading}>Your Library</Text>
        {['Liked Songs', 'Chill Vibes', 'Night Sessions', 'Workout Mix'].map((p) => (
          <View key={p} style={styles.listItem}>
            <Text style={styles.listItemEmoji}>🎵</Text>
            <Text style={styles.listItemText}>{p}</Text>
          </View>
        ))}
      </View>
    );
  }
  if (tab === 'search') {
    return (
      <View style={styles.panel}>
        <Text style={styles.panelHeading}>Search</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchPlaceholder}>🔍 Artists, songs, or podcasts</Text>
        </View>
        <Text style={styles.panelSub}>Browse all</Text>
        {['Pop', 'Rock', 'Jazz', 'Electronic'].map((g) => (
          <View key={g} style={styles.genreChip}>
            <Text style={styles.genreText}>{g}</Text>
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={styles.panel}>
      <Text style={styles.panelHeading}>Profile</Text>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
        <View>
          <Text style={styles.listItemText}>Jordan Diaz</Text>
          <Text style={styles.panelSub}>142 following · 38 playlists</Text>
        </View>
      </View>
    </View>
  );
}

export default function DeadTabItemScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [activeTab, setActiveTab] = useState<TabKey>('library');

  const handleTabPress = (key: TabKey) => {
    // Faulty: the "Search" tab press is dropped — content never switches to it.
    // Baseline: all tabs switch normally.
    if (faultActive && key === 'search') return;
    setActiveTab(key);
  };

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DEAD_TAB_ITEM' : undefined}
    >
      <Stack.Screen options={{ title: 'Browse' }} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <TabContent tab={activeTab} />

        {/* X33 (F-INS-01): GATED. The subscription modal only mounts once the
            Chill Radio row is pressed, so the host's tab-switching task never
            raises it. */}
        <UntreedCloseSubscription />
      </ScrollView>

      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => handleTabPress(t.key)}
              style={styles.tabItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${t.label} tab`}
            >
              <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{t.icon}</Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  body: { flex: 1 },
  bodyContent: { padding: 20 },

  panel: { gap: 12 },
  panelHeading: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  panelSub: { fontSize: 13, color: '#999', marginTop: 8 },

  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  listItemEmoji: { fontSize: 22 },
  listItemText: { fontSize: 16, color: '#fff', fontWeight: '600' },

  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  searchPlaceholder: { fontSize: 15, color: '#666' },
  genreChip: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  genreText: { fontSize: 15, color: '#fff', fontWeight: '600' },

  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1db954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },

  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#282828',
    backgroundColor: '#181818',
    paddingBottom: 18,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 },
  tabIcon: { fontSize: 20, opacity: 0.6 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 11, color: '#888' },
  tabLabelActive: { color: '#fff', fontWeight: '700' },
});
