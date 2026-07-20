import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
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

export default function InvisibleTapOverlayScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [openedId, setOpenedId] = useState<string | null>(null);

  const openedEmail = INITIAL_EMAILS.find((e) => e.id === openedId) ?? null;

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_INVISIBLE_TAP_OVERLAY' : undefined}
    >
      <Stack.Screen options={{ title: 'Inbox' }} />

      {openedEmail !== null ? (
        <View style={styles.detail}>
          <Text style={styles.detailSubject}>{openedEmail.subject}</Text>
          <Text style={styles.detailFrom}>From: {openedEmail.from}</Text>
          <View style={styles.detailDivider} />
          <Text style={styles.detailBody}>{openedEmail.preview}</Text>
          <Pressable
            onPress={() => setOpenedId(null)}
            accessibilityRole="button"
            accessibilityLabel="Back to inbox"
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>← Back to inbox</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={INITIAL_EMAILS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.emailRow}
              onPress={() => setOpenedId(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`Email from ${item.from}: ${item.subject}`}
            >
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
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          style={styles.list}
        />
      )}

      {/* Faulty: a fully transparent, full-screen overlay with default pointerEvents
          sits on top of the list and swallows every tap. The list is perfectly
          visible and present in the tree, but no row is reachable. */}
      {faultActive && openedEmail === null && (
        <View style={styles.tapOverlay} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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

  // Fully transparent, full-screen — invisible but intercepts all touches.
  tapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },

  detail: { flex: 1, padding: 20, gap: 10 },
  detailSubject: { fontSize: 20, fontWeight: '700', color: '#111' },
  detailFrom: { fontSize: 14, color: '#555' },
  detailDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#e0e0e0', marginVertical: 6 },
  detailBody: { fontSize: 15, lineHeight: 22, color: '#333' },
  backBtn: { marginTop: 16, alignSelf: 'flex-start' },
  backBtnText: { fontSize: 15, color: '#1565c0', fontWeight: '600' },
});
