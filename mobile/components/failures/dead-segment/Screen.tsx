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

type Segment = 'primary' | 'promotions' | 'social';

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'promotions', label: 'Promotions' },
  { key: 'social', label: 'Social' },
];

const EMAILS: Record<Segment, Email[]> = {
  primary: [
    { id: 'p1', from: 'Sarah Chen', subject: 'Project kickoff — Tuesday 3pm', preview: 'Hey, just confirming the meeting for next week. Can you make sure...', time: '10:24', unread: true },
    { id: 'p2', from: 'GitHub', subject: '[gui-failure-lab] PR #47 merged', preview: 'marcus merged your pull request into main. 3 files changed...', time: '09:15', unread: false },
    { id: 'p3', from: 'Lena Müller', subject: 'Re: Budget approval Q3', preview: 'Thanks for the update. The finance team will review by end of week...', time: 'Tue', unread: true },
  ],
  promotions: [
    { id: 'm1', from: 'Figma', subject: '🎉 50% off Figma Pro this week only', preview: 'Upgrade your workflow and save big. Limited-time offer ends Sunday...', time: '08:40', unread: true },
    { id: 'm2', from: 'Stripe', subject: 'New: instant payouts now available', preview: 'Get your money faster with instant payouts. See what is new in your...', time: 'Mon', unread: false },
    { id: 'm3', from: 'Notion', subject: 'Your weekly productivity digest', preview: 'Discover templates and tips to get more done this week with Notion...', time: 'Sun', unread: false },
  ],
  social: [
    { id: 's1', from: 'Alex Johnson', subject: 'Tagged you in a photo', preview: 'Alex Johnson tagged you in a photo from the weekend hike. Take a look...', time: '11:02', unread: true },
    { id: 's2', from: 'LinkedIn', subject: 'You have 3 new connection requests', preview: 'People in your network want to connect. Grow your professional circle...', time: 'Tue', unread: false },
    { id: 's3', from: 'Twitter', subject: 'Marcus and 4 others liked your post', preview: 'Your recent post is getting attention. See who engaged with it...', time: 'Mon', unread: false },
  ],
};

interface Props {
  faultActive?: boolean;
}

export default function DeadSegmentScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [active, setActive] = useState<Segment>('primary');

  const handlePress = (key: Segment) => {
    // Baseline: switching works and shows that segment's emails.
    // Faulty: tapping a segment does NOT switch the active segment/content.
    if (!faultActive) {
      setActive(key);
    }
  };

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DEAD_SEGMENT' : undefined}
    >
      <Stack.Screen options={{ title: 'Inbox' }} />

      <View style={styles.segmentBar}>
        {SEGMENTS.map((seg) => {
          const isActive = seg.key === active;
          return (
            <Pressable
              key={seg.key}
              onPress={() => handlePress(seg.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${seg.label} tab`}
              style={[styles.segment, isActive && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                {seg.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={EMAILS[active]}
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

  segmentBar: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  segmentActive: { borderBottomColor: '#1565c0' },
  segmentText: { fontSize: 14, color: '#888', fontWeight: '600' },
  segmentTextActive: { color: '#1565c0' },

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
