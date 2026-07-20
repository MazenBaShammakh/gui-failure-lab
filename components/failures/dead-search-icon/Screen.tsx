import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
}

const INITIAL_EMAILS: Email[] = [
  { id: '1', from: 'Sarah Chen', subject: 'Project kickoff — Tuesday 3pm', preview: 'Hey, just confirming the meeting for next week. Can you make sure...', time: '10:24', unread: true },
  { id: '2', from: 'GitHub', subject: '[gui-failure-lab] PR #47 merged', preview: 'marcus merged your pull request into main. 3 files changed, 84 additions...', time: '09:15', unread: false },
  { id: '3', from: 'Newsletter · Figma', subject: "What's new in Figma — June edition", preview: 'Discover the latest features, plugins, and community highlights from...', time: '08:40', unread: false },
  { id: '4', from: 'Lena Müller', subject: 'Re: Budget approval Q3', preview: 'Thanks for the update. The finance team will review by end of week and...', time: 'Tue', unread: true },
  { id: '5', from: 'Stripe', subject: 'Your invoice for June is ready', preview: 'Your monthly invoice is available. Total: $249.00. Due: Jul 1, 2026.', time: 'Mon', unread: false },
  { id: '6', from: 'Alex Johnson', subject: 'Lunch tomorrow?', preview: 'Are you free for lunch tomorrow? I was thinking we could catch up at...', time: 'Sun', unread: true },
  { id: '7', from: 'Jira', subject: '[PROJ-142] Status changed to In Review', preview: 'Marcus Bauer updated PROJ-142: Implement swipe gesture scenario...', time: 'Sat', unread: false },
];

interface Props {
  faultActive?: boolean;
}

export default function DeadSearchIconScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleSearchPress = () => {
    // Baseline: tapping the icon reveals a working search field.
    // Faulty: tapping search opens nothing — no field, no nav.
    if (!faultActive) {
      setSearchOpen((prev) => !prev);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === '') return INITIAL_EMAILS;
    return INITIAL_EMAILS.filter(
      (e) =>
        e.from.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        e.preview.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DEAD_SEARCH_ICON' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'Inbox',
          headerRight: () => (
            <Pressable
              onPress={handleSearchPress}
              accessibilityRole="button"
              accessibilityLabel="Search inbox"
              style={styles.searchIconBtn}
            >
              <Text style={styles.searchIcon}>🔍</Text>
            </Pressable>
          ),
        }}
      />

      {searchOpen && (
        <View style={styles.searchFieldRow}>
          <Text style={styles.searchFieldIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search mail"
            placeholderTextColor="#aaa"
            autoFocus
            accessibilityLabel="Search mail input"
          />
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.emailRow}>
            <View style={[styles.unreadDot, !item.unread && styles.unreadDotHidden]} />
            <View style={styles.emailContent}>
              <View style={styles.emailTopRow}>
                <Text
                  style={[styles.emailFrom, item.unread && styles.emailFromUnread]}
                  numberOfLines={1}
                >
                  {item.from}
                </Text>
                <Text style={styles.emailTime}>{item.time}</Text>
              </View>
              <Text
                style={[styles.emailSubject, item.unread && styles.emailSubjectUnread]}
                numberOfLines={1}
              >
                {item.subject}
              </Text>
              <Text style={styles.emailPreview} numberOfLines={1}>
                {item.preview}
              </Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchIconBtn: { padding: 6 },
  searchIcon: { fontSize: 18 },

  searchFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f1f3f4',
    borderRadius: 10,
  },
  searchFieldIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: '#111', padding: 0 },

  list: { flex: 1 },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#eeeeee',
    marginLeft: 60,
  },
  emailRow: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1565c0',
    flexShrink: 0,
  },
  unreadDotHidden: { backgroundColor: 'transparent' },
  emailContent: { flex: 1, gap: 3 },
  emailTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emailFrom: { fontSize: 14, color: '#666', flex: 1 },
  emailFromUnread: { fontWeight: '700', color: '#111' },
  emailSubject: { fontSize: 14, color: '#777' },
  emailSubjectUnread: { fontWeight: '600', color: '#111' },
  emailPreview: { fontSize: 13, color: '#aaa' },
  emailTime: { fontSize: 12, color: '#aaa', marginLeft: 8 },
});
