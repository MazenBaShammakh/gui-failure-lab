import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

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

interface RowProps {
  email: Email;
  faultActive: boolean;
  onDelete: (id: string) => void;
  onArchive: (email: Email) => void;
}

function SwipeableEmailRow({ email, faultActive, onDelete, onArchive }: RowProps) {
  const translateX = useSharedValue(0);
  // Baseline: deliberate 80px swipe needed. Faulty: 40px — easy to trigger accidentally.
  const THRESHOLD = faultActive ? 40 : 80;

  const doDelete = useCallback(() => {
    if (faultActive) {
      // Faulty: no confirmation — immediately destroyed
      onDelete(email.id);
    } else {
      Alert.alert(
        'Delete Message',
        'This message will be permanently deleted.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(email.id) },
        ],
      );
    }
  }, [faultActive, onDelete, email.id]);

  const doArchive = useCallback(() => {
    onArchive(email);
  }, [onArchive, email]);

  const basePan = Gesture.Pan()
    .activeOffsetX((faultActive ? [-5, 5] : [-15, 15]) as [number, number]);

  // Baseline: failOffsetY ensures vertical scrolling cancels the swipe.
  // Faulty: no failOffsetY — a slightly diagonal scroll attempt can trigger the wrong action.
  const panGesture = (faultActive ? basePan : basePan.failOffsetY([-15, 15] as [number, number]))
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -THRESHOLD) {
        runOnJS(doDelete)();
      } else if (e.translationX > THRESHOLD) {
        runOnJS(doArchive)();
      }
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.rowWrapper}>
      {/* Left reveal (delete / remove) — vivid red in baseline, muted gray in faulty */}
      <View style={[styles.revealLeft, faultActive ? styles.revealGrayA : styles.revealRed]}>
        <Text style={faultActive ? styles.revealIconGray : styles.revealIconWhite}>
          {faultActive ? '↩' : '🗑'}
        </Text>
        <Text style={faultActive ? styles.revealLabelGray : styles.revealLabelWhite}>
          {faultActive ? 'Remove' : 'Delete'}
        </Text>
      </View>

      {/* Right reveal (archive / store) — vivid blue in baseline, near-identical gray in faulty */}
      <View style={[styles.revealRight, faultActive ? styles.revealGrayB : styles.revealBlue]}>
        <Text style={faultActive ? styles.revealIconGray : styles.revealIconWhite}>
          {faultActive ? '↗' : '📥'}
        </Text>
        <Text style={faultActive ? styles.revealLabelGray : styles.revealLabelWhite}>
          {faultActive ? 'Store' : 'Archive'}
        </Text>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.emailRow, rowStyle]}
          accessible={true}
          accessibilityRole="none"
          accessibilityLabel={`Email from ${email.from}: ${email.subject}`}
        >
          <View style={[styles.unreadDot, !email.unread && styles.unreadDotHidden]} />
          <View style={styles.emailContent}>
            <View style={styles.emailTopRow}>
              <Text
                style={[styles.emailFrom, email.unread && styles.emailFromUnread]}
                numberOfLines={1}
              >
                {email.from}
              </Text>
              <Text style={styles.emailTime}>{email.time}</Text>
            </View>
            <Text
              style={[styles.emailSubject, email.unread && styles.emailSubjectUnread]}
              numberOfLines={1}
            >
              {email.subject}
            </Text>
            <Text style={styles.emailPreview} numberOfLines={1}>
              {email.preview}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

interface Props {
  faultActive?: boolean;
}

export default function SwipeAmbiguousDirectionScreen({ faultActive = false }: Props) {
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [undoEmail, setUndoEmail] = useState<Email | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDelete = useCallback((id: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleArchive = useCallback((email: Email) => {
    setEmails((prev) => prev.filter((e) => e.id !== email.id));
    if (!faultActive) {
      if (undoTimer.current) clearTimeout(undoTimer.current);
      setUndoEmail(email);
      undoTimer.current = setTimeout(() => setUndoEmail(null), 4000);
    }
  }, [faultActive]);

  const handleUndo = () => {
    if (undoEmail) {
      setEmails((prev) => [undoEmail, ...prev]);
      setUndoEmail(null);
      if (undoTimer.current) clearTimeout(undoTimer.current);
    }
  };

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:B_SWIPE_AMBIGUOUS_DIRECTION' : undefined}
    >
      <Stack.Screen options={{ title: 'Inbox' }} />

      {/* Gesture hint bar
          Baseline: color-coded labels make the two directions immediately clear.
          Faulty:   both sides render in the same muted gray — visually indistinguishable. */}
      <View style={styles.hintBar}>
        <Text style={[styles.hintText, faultActive ? styles.hintGray : styles.hintRed]}>
          ← {faultActive ? 'Remove' : 'Delete'}
        </Text>
        <View style={styles.hintDivider} />
        <Text style={[styles.hintText, faultActive ? styles.hintGray : styles.hintBlue]}>
          {faultActive ? 'Store' : 'Archive'} →
        </Text>
      </View>

      <FlatList
        data={emails}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SwipeableEmailRow
            email={item}
            faultActive={faultActive}
            onDelete={handleDelete}
            onArchive={handleArchive}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={styles.list}
        contentContainerStyle={emails.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Inbox empty</Text>
          </View>
        }
      />

      {/* Undo snackbar — only shown in baseline after archive */}
      {undoEmail !== null && (
        <View style={styles.snackbar} accessibilityLiveRegion="polite">
          <Text style={styles.snackbarText}>Message archived</Text>
          <Pressable
            onPress={handleUndo}
            accessibilityRole="button"
            accessibilityLabel="Undo archive"
          >
            <Text style={styles.snackbarAction}>Undo</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  hintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: '#fafafa',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
    gap: 16,
  },
  hintText: { fontSize: 12, fontWeight: '600' },
  hintDivider: { width: StyleSheet.hairlineWidth, height: 14, backgroundColor: '#ddd' },
  hintRed: { color: '#c62828' },
  hintBlue: { color: '#1565c0' },
  hintGray: { color: '#9e9e9e' }, // both sides look the same in faulty mode

  list: { flex: 1 },
  emptyContainer: { flex: 1 },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#eeeeee',
    marginLeft: 60,
  },

  rowWrapper: { position: 'relative', overflow: 'hidden' },

  revealLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    justifyContent: 'center',
    paddingLeft: 28,
    gap: 3,
  },
  revealRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 28,
    gap: 3,
  },

  // Baseline reveals: clearly distinct colors
  revealRed: { backgroundColor: '#e53935' },
  revealBlue: { backgroundColor: '#1565c0' },
  // Faulty reveals: near-identical muted grays — vision-only agents cannot tell them apart
  revealGrayA: { backgroundColor: '#bdbdbd' },
  revealGrayB: { backgroundColor: '#b0bec5' },

  revealIconWhite: { fontSize: 20, color: '#fff' },
  revealLabelWhite: { fontSize: 12, fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  revealIconGray: { fontSize: 18, color: '#555' },
  revealLabelGray: { fontSize: 12, fontWeight: '600', color: '#555' },

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

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#888' },

  snackbar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#323232',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  snackbarText: { color: '#fff', fontSize: 14 },
  snackbarAction: { color: '#4db6ac', fontSize: 14, fontWeight: '700' },
});
