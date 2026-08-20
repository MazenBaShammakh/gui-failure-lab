import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import UnsortedArchiveNoControls from '@/components/failures/unsorted-archive-no-controls';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
}

const INITIAL_EMAILS: Email[] = [
  {
    id: 'e1',
    sender: 'Dropbox',
    subject: 'Your files are ready to download',
    preview: 'The shared folder "Q2 Designs" is now available…',
    time: '09:24',
    unread: true,
  },
  {
    id: 'e2',
    sender: 'GitHub',
    subject: '[aurora/app] 3 new pull requests',
    preview: 'A summary of activity in repositories you watch…',
    time: '08:51',
    unread: true,
  },
  {
    id: 'e3',
    sender: 'Linda Park',
    subject: 'Re: Lunch on Thursday?',
    preview: 'Sounds great — let’s do the place near the office…',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'e4',
    sender: 'Spotify',
    subject: 'Your Discover Weekly is here',
    preview: '30 new songs picked just for you this week…',
    time: 'Yesterday',
    unread: false,
  },
];

const ARCHIVE_THRESHOLD = 96;

interface RowProps {
  email: Email;
  faultActive: boolean;
  onArchive: (id: string) => void;
}

function EmailRow({ email, faultActive, onArchive }: RowProps) {
  const translateX = useSharedValue(0);

  const doArchive = useCallback(() => {
    onArchive(email.id);
  }, [onArchive, email.id]);

  // Faulty: the row can be archived ONLY by swiping it left. There is no visible
  // archive control and no painted hint that the row is swipeable.
  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15] as [number, number])
    .failOffsetY([-15, 15] as [number, number])
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX < -ARCHIVE_THRESHOLD) {
        runOnJS(doArchive)();
      }
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Faulty: the gesture-only action is correctly surfaced to the a11y tree as a
  // custom AccessibilityAction ("Archive"). TalkBack/VoiceOver — and a text-only
  // agent reading the node — can invoke it. A vision-only agent has no painted
  // affordance to ground on, so it cannot find or trigger the archive action.
  const a11yActionProps = faultActive
    ? {
        accessibilityActions: [{ name: 'archive', label: 'Archive' }],
        onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
          if (event.nativeEvent.actionName === 'archive') {
            doArchive();
          }
        },
      }
    : {};

  const rowInner = (
    <Animated.View
      style={[styles.row, faultActive && rowStyle]}
      accessible
      accessibilityLabel={`${email.sender}, ${email.subject}, ${email.time}${
        email.unread ? ', unread' : ''
      }`}
      {...a11yActionProps}
    >
      <View style={[styles.avatar, email.unread && styles.avatarUnread]}>
        <Text style={styles.avatarText}>{email.sender.charAt(0)}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.bodyTop}>
          <Text style={[styles.sender, email.unread && styles.unreadText]} numberOfLines={1}>
            {email.sender}
          </Text>
          <Text style={styles.time}>{email.time}</Text>
        </View>
        <Text style={[styles.subject, email.unread && styles.unreadText]} numberOfLines={1}>
          {email.subject}
        </Text>
        <Text style={styles.preview} numberOfLines={1}>
          {email.preview}
        </Text>
      </View>

      {/* Baseline: a clear, visible Archive button per row — vision can ground. */}
      {!faultActive && (
        <Pressable
          style={({ pressed }) => [styles.archiveBtn, pressed && styles.archiveBtnPressed]}
          onPress={doArchive}
          accessibilityRole="button"
          accessibilityLabel={`Archive email from ${email.sender}`}
        >
          <Text style={styles.archiveIcon}>🗄️</Text>
          <Text style={styles.archiveLabel}>Archive</Text>
        </Pressable>
      )}
    </Animated.View>
  );

  if (!faultActive) {
    return <View style={styles.rowWrapper}>{rowInner}</View>;
  }

  return (
    <View style={styles.rowWrapper}>
      <GestureDetector gesture={panGesture}>{rowInner}</GestureDetector>
    </View>
  );
}

interface Props {
  faultActive?: boolean;
}

/**
 * B12 — Gesture-only actions with no visible affordance (Perceptibility, overlaps
 * Interaction Scope).
 *
 * The archive action is not a drawn element. In faulty mode the only way to
 * archive a message is the swipe-left gesture; nothing is painted to indicate it.
 * The action IS, however, exposed to the accessibility tree as a custom
 * AccessibilityAction ("Archive") on each row.
 *
 *   Baseline: each row also carries a visible Archive button — a vision agent can
 *   ground on the painted control.
 *
 *   Faulty: no visible control at all. A vision-only agent has no pixel affordance
 *   to find or tap, so it cannot archive. A text-only agent reads the row's custom
 *   action from the node and invokes "Archive".
 *
 *   Fails: vision-only (no visible control).
 *   Succeeds: text-only (custom action present in the node).
 *
 * Mobile-exclusive: swipe / long-press gestures surfaced as a11y custom actions
 * are a native interaction pattern; web actions almost always carry a visible DOM
 * affordance. No app-side remediation is needed — this is correct mobile UX; the
 * study point is that vision cannot ground gesture-only actions while the textual
 * channel can.
 *
 * NOTE: the text-success path depends on the custom AccessibilityAction being read
 * from the native device tree. React Native Web does not surface
 * accessibilityActions, so this case is meaningful on the native build (where the
 * text modality reads the real a11y tree); on web only the visual arm is faithful.
 */
export default function GestureOnlyArchiveScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [lastArchived, setLastArchived] = useState<string | null>(null);

  const handleArchive = useCallback((id: string) => {
    setEmails((prev) => {
      const target = prev.find((e) => e.id === id);
      if (target) setLastArchived(target.sender);
      return prev.filter((e) => e.id !== id);
    });
  }, []);

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_GESTURE_ONLY_ARCHIVE' : undefined}
    >
      <Stack.Screen options={{ title: 'Inbox' }} />

      <View style={styles.list}>
        {emails.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Inbox zero</Text>
          </View>
        ) : (
          emails.map((email) => (
            <EmailRow
              key={email.id}
              email={email}
              faultActive={faultActive}
              onArchive={handleArchive}
            />
          ))
        )}
      </View>

      {lastArchived && (
        <Text style={styles.archivedNote} accessibilityLiveRegion="polite">
          ✓ Archived email from {lastArchived}
        </Text>
      )}

      {/* X24 (F-CNT-03): the archived-messages list. Read-only rows, so the
          host's gesture-only archiving defect is not on this task's path. */}
      <UnsortedArchiveNoControls />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { paddingTop: 4 },

  rowWrapper: {
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#bdbdbd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarUnread: { backgroundColor: '#e65100' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  body: { flex: 1, gap: 2 },
  bodyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sender: { fontSize: 15, color: '#222', flex: 1 },
  time: { fontSize: 12, color: '#999', marginLeft: 8 },
  subject: { fontSize: 14, color: '#333' },
  preview: { fontSize: 13, color: '#999' },
  unreadText: { fontWeight: '700', color: '#111' },

  archiveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fff3e0',
  },
  archiveBtnPressed: { backgroundColor: '#ffe0b2' },
  archiveIcon: { fontSize: 18 },
  archiveLabel: { fontSize: 11, fontWeight: '700', color: '#e65100', marginTop: 2 },

  empty: { justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 100 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#888' },

  archivedNote: {
    fontSize: 15,
    color: '#2e7d32',
    fontWeight: '700',
    padding: 16,
  },
});
