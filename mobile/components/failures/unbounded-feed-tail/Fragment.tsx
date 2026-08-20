import { View, Text, StyleSheet } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
  /**
   * How many "older posts" batches the host list has requested via onEndReached.
   * Driven by the host so auto-load rides the host's own scroll — no nested
   * scrollable, no button.
   */
  loadedTail: number;
}

const BATCH = 6;
/** Baseline stops here, with a genuine oldest post and a terminal marker. */
const BASELINE_TAIL = 18;

// Deterministic "older posts". Baseline's oldest is the last entry, so the task
// has a real answer; index 0 is the newest of the tail.
const OLDER_AUTHORS = [
  'Ruth Vale', 'Kofi Adu', 'Mara Ln', 'Yuki Ito', 'Ped Alfa', 'Nils Aas',
  'Ola Berg', 'Tam Ngo', 'Ivo Kral', 'Uma Rao', 'Zed Fox', 'Ada Von',
  'Bo Quist', 'Cy Marsh', 'Del Roy', 'Efe Kaya', 'Fia Holm', 'Gil Ansa',
];

function olderPost(i: number, oldest: boolean) {
  const author = OLDER_AUTHORS[i % OLDER_AUTHORS.length];
  return {
    id: `old-${i}`,
    author,
    text: oldest
      ? 'First post on this account — hello world! 👋'
      : `Throwback #${i + 1} · a quiet day.`,
    when: oldest ? 'Joined · 5y ago' : `${Math.min(9, 8 + Math.floor(i / 6))}h ago`,
  };
}

/**
 * X26 · M_UNBOUNDED_FEED_TAIL — F-FBK-01 No Terminal State / Unbounded Scroll.
 * Third observation of the type; hosted on the Feed (M_GHOST_ELEMENTS_FEED).
 *
 * Mechanism — AUTO-LOAD ON SCROLL with no button and no end. The three
 * observations separate three shapes of "no terminal state":
 *   · M_UNBOUNDED_SCROLL_NO_TERMINAL_STATE (F7.5, /dashboard/activity): a
 *     "Load older entries" BUTTON that never yields an end marker — the agent
 *     performs a discrete, repeatable action.
 *   · X27 (/dashboard/alerts): auto-load PLUS a scroll reset that destroys
 *     progress.
 *   · X26 (here): auto-load with no discrete control at all. New posts append
 *     silently as the tail is approached, so there is no action to count, no
 *     "load more" whose repetition might hint at endlessness, and no terminal
 *     marker. The feed simply always has more.
 *
 * IMPLEMENTATION — this fragment renders the unbounded tail as plain Views inside
 * the host FlatList's ListFooterComponent, GROWN by the host's onEndReached. It
 * deliberately does NOT append to the host list's `data`: the host's own defect
 * (M_GHOST_ELEMENTS_FEED) defeats virtualization to keep every data row mounted,
 * and feeding an unbounded generator into that would be a true memory conflict
 * (plan §8 risk 3). Keeping the tail outside the virtualized data lets the two
 * defects coexist — the ghost defect governs the finite base feed near the top;
 * the unbounded tail governs the bottom, which the host's like-Daniel task never
 * reaches.
 *
 *   Baseline: the tail is finite (18) and ends in "First post on this account…"
 *             followed by "You're all caught up".
 *   Faulty:   the tail grows by a batch every time the end is approached, forever,
 *             with no terminal marker.
 *
 *   Fails:    vision-only AND text-only (the oldest post is never reachable and
 *             nothing signals one exists).
 *
 * Isolation: bottom of the feed. The host's ghost-node defect and its off-screen
 * "Like Daniel's post" widget concern the finite base feed; this task scrolls
 * past all of that toward an end that never comes.
 */
export default function UnboundedFeedTailFragment({ faultActive: faultActiveProp, loadedTail }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const requested = (loadedTail + 1) * BATCH;
  const total = faultActive ? requested : Math.min(requested, BASELINE_TAIL);
  const atBaselineEnd = !faultActive && total >= BASELINE_TAIL;

  return (
    <View style={styles.wrap} testID={faultActive ? 'defect:M_UNBOUNDED_FEED_TAIL' : undefined}>
      <View style={styles.tailDivider}>
        <Text style={styles.tailDividerText}>Earlier posts</Text>
      </View>

      {Array.from({ length: total }, (_, i) => {
        const isOldest = atBaselineEnd && i === total - 1;
        const post = olderPost(i, isOldest);
        return (
          <View key={post.id} style={styles.post}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{post.author.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.postBody}>
              <Text style={styles.author}>{post.author}</Text>
              <Text style={styles.text}>{post.text}</Text>
              <Text style={styles.when}>{post.when}</Text>
            </View>
          </View>
        );
      })}

      {atBaselineEnd ? (
        <Text style={styles.terminal}>— You&apos;re all caught up —</Text>
      ) : (
        <Text style={styles.loading}>Loading earlier posts…</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#f0f2f5' },
  tailDivider: { paddingHorizontal: 14, paddingVertical: 10 },
  tailDividerText: { fontSize: 12, color: '#8a8d91', fontWeight: '700', textTransform: 'uppercase' },
  post: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8e9aa8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  postBody: { flex: 1, gap: 2 },
  author: { fontSize: 14, fontWeight: '700', color: '#111' },
  text: { fontSize: 14, color: '#111', lineHeight: 20 },
  when: { fontSize: 11, color: '#999', marginTop: 2 },
  loading: { fontSize: 12, color: '#999', textAlign: 'center', paddingVertical: 16 },
  terminal: { fontSize: 12, color: '#2e7d32', fontWeight: '700', textAlign: 'center', paddingVertical: 16 },
});
