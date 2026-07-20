import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
}

const EMAILS: Email[] = [
  { id: '1', from: 'Stripe', subject: 'Your invoice for June is ready', preview: 'Total: $249.00. Due: Jul 1, 2026.' },
  { id: '2', from: 'Sarah Chen', subject: 'Project kickoff — Tuesday 3pm', preview: 'Just confirming the meeting for next week.' },
  { id: '3', from: 'GitHub', subject: '[gui-failure-lab] PR #47 merged', preview: '3 files changed, 84 additions...' },
];

type Panel = 'none' | 'search' | 'compose';

export default function OverloadedIconSearchComposeScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [panel, setPanel] = useState<Panel>('none');
  const [query, setQuery] = useState('');
  // Faulty: the single overloaded icon's behavior depends on this hidden
  // press counter, which nothing on screen exposes. Odd presses open
  // Compose, even presses open Search — visually indistinguishable in
  // advance from the icon alone.
  const [pressCount, setPressCount] = useState(0);

  const onOverloadedIconPress = () => {
    const next = pressCount + 1;
    setPressCount(next);
    setPanel(next % 2 === 1 ? 'compose' : 'search');
  };

  const results = EMAILS.filter(
    (e) =>
      query.trim().length === 0 ||
      e.subject.toLowerCase().includes(query.toLowerCase()) ||
      e.preview.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_OVERLOADED_ICON_SEARCH_COMPOSE' : undefined}
    >
      <Stack.Screen options={{ title: 'Toolbar' }} />

      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Inbox</Text>
        <View style={styles.toolbarIcons}>
          {!faultActive ? (
            <>
              <Pressable
                onPress={() => setPanel((p) => (p === 'search' ? 'none' : 'search'))}
                accessibilityRole="button"
                accessibilityLabel="Search"
                style={styles.iconBtn}
                hitSlop={8}
              >
                <Text style={styles.icon}>🔍</Text>
              </Pressable>
              <Pressable
                onPress={() => setPanel((p) => (p === 'compose' ? 'none' : 'compose'))}
                accessibilityRole="button"
                accessibilityLabel="Compose"
                style={styles.iconBtn}
                hitSlop={8}
              >
                <Text style={styles.icon}>✍️</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={onOverloadedIconPress}
              accessibilityRole="button"
              accessibilityLabel="Search"
              style={styles.iconBtn}
              hitSlop={8}
            >
              <Text style={styles.icon}>🔍</Text>
            </Pressable>
          )}
        </View>
      </View>

      {panel === 'search' && (
        <View style={styles.searchPanel}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search mail"
            placeholderTextColor="#9e9e9e"
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Search mail"
            autoFocus
          />
        </View>
      )}

      {panel === 'compose' && (
        <View style={styles.composePanel}>
          <Text style={styles.composeTitle}>New Message</Text>
          <View style={styles.composeField}>
            <Text style={styles.composeFieldText}>To</Text>
          </View>
          <View style={styles.composeField}>
            <Text style={styles.composeFieldText}>Subject</Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {(panel === 'search' ? results : EMAILS).map((e) => (
          <View key={e.id} style={styles.emailRow}>
            <Text style={styles.emailFrom}>{e.from}</Text>
            <Text style={styles.emailSubject} numberOfLines={1}>
              {e.subject}
            </Text>
            <Text style={styles.emailPreview} numberOfLines={1}>
              {e.preview}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  toolbarTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  toolbarIcons: { flexDirection: 'row', gap: 18 },
  iconBtn: { padding: 4 },
  icon: { fontSize: 22 },
  searchPanel: { paddingHorizontal: 20, paddingTop: 14 },
  searchInput: {
    backgroundColor: '#f6f6f8',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#dcdce0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
  },
  composePanel: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: '#f6f6f8',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  composeTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 4 },
  composeField: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#dcdce0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  composeFieldText: { fontSize: 14, color: '#9e9e9e' },
  list: { flex: 1, marginTop: 8 },
  listContent: { paddingHorizontal: 20, paddingBottom: 32 },
  emailRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
    gap: 2,
  },
  emailFrom: { fontSize: 13, fontWeight: '600', color: '#555' },
  emailSubject: { fontSize: 15, fontWeight: '600', color: '#111' },
  emailPreview: { fontSize: 13, color: '#999' },
});
