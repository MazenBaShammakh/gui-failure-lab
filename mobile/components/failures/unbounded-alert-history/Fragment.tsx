import { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Alert {
  id: string;
  label: string;
  when: string;
}

const PAGE = 10;
/** Baseline: a real, finite history with a genuine oldest entry. */
const BASELINE_TOTAL = 32;
/**
 * Faulty: rows are synthesised on demand. Capped only so the fixture cannot run
 * away with memory — the cap is far beyond any plausible agent budget and no
 * terminal marker is ever rendered at it, so the list is unbounded in practice.
 */
const FAULTY_CAP = 240;

function makeAlert(i: number, total: number): Alert {
  if (i === total - 1) {
    return { id: `a${i}`, label: 'Monitoring enabled for this account', when: 'Jan 2, 2025' };
  }
  return { id: `a${i}`, label: `Latency threshold exceeded — api-gateway #${i + 1}`, when: `2026 · event ${i + 1}` };
}

/**
 * X27 · M_UNBOUNDED_ALERT_HISTORY — F-FBK-01 No Terminal State / Unbounded
 * Scroll. Second observation of the type; hosted on Alerts
 * (M_NONBLOCKING_OVERLAY_OCCLUSION).
 *
 * Mechanism — progress is DESTROYED, not merely unacknowledged. The distinction
 * from M_UNBOUNDED_SCROLL_NO_TERMINAL_STATE (F7.5, /dashboard/activity) is sharp
 * and matters for what a run measures:
 *   · F7.5 paginates a genuinely FINITE list (64 entries). The oldest entry is
 *     reachable; what is missing is the end-of-content signal, so the agent
 *     cannot tell it has arrived. The task is achievable and the failure is one
 *     of confidence — it may report success and be right, or keep pulling.
 *   · X27 (here) is unbounded AND resets scroll position to the top on every
 *     auto-load. Each successful fetch undoes the traversal that earned it, so
 *     the agent makes no net progress no matter how long it persists. The task is
 *     unachievable, and the failure is termination by budget exhaustion.
 *
 * Auto-loading on scroll (no "Load more" button) is what makes the reset
 * invisible: there is no discrete action the agent can attribute the jump to, so
 * the screen reads as merely long rather than as actively undoing its work.
 *
 *   Baseline: 32 alerts, paged, ending in "— Beginning of history —"; scroll
 *             position is preserved across loads.
 *   Faulty:   endless synthesis, no terminal marker, scroll snapped to 0 on load.
 *
 *   Fails:    vision-only AND text-only (neither channel can reach the oldest
 *             entry, and neither is told one exists).
 *
 * Isolation: its own history list below the host's alert rows. The host's defect
 * is an overlay occluding the Refresh control in the header; this task never
 * refreshes.
 */
export default function UnboundedAlertHistoryFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const listRef = useRef<FlatList<Alert>>(null);
  const [count, setCount] = useState(PAGE);

  const total = faultActive ? FAULTY_CAP : BASELINE_TOTAL;
  const visible = Math.min(count, total);
  const hasMore = visible < total;
  const data = Array.from({ length: visible }, (_, i) => makeAlert(i, total));

  const onEndReached = () => {
    if (!hasMore) return;
    setCount((c) => c + PAGE);
    if (faultActive) {
      // The injection: the fetch succeeds, and the traversal that triggered it is
      // thrown away.
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  };

  return (
    <View style={styles.wrap} testID={faultActive ? 'defect:M_UNBOUNDED_ALERT_HISTORY' : undefined}>
      <Text style={styles.heading}>Alert history</Text>

      <FlatList
        ref={listRef}
        style={styles.list}
        data={data}
        keyExtractor={(a) => a.id}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.rowWhen}>{item.when}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          hasMore ? (
            <Text style={styles.loading}>Loading older alerts…</Text>
          ) : !faultActive ? (
            <Text style={styles.terminal}>— Beginning of history —</Text>
          ) : (
            <View style={styles.blankFooter} />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8, flex: 1 },
  heading: { fontSize: 15, fontWeight: '800', color: '#111', marginBottom: 8 },
  list: { flexGrow: 0, maxHeight: 260 },
  row: { paddingVertical: 10 },
  rowLabel: { fontSize: 13, color: '#111' },
  rowWhen: { fontSize: 11, color: '#999', marginTop: 2 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#eee' },
  loading: { fontSize: 12, color: '#999', textAlign: 'center', paddingVertical: 12 },
  terminal: { fontSize: 12, color: '#2e7d32', fontWeight: '700', textAlign: 'center', paddingVertical: 12 },
  blankFooter: { height: 24 },
});
