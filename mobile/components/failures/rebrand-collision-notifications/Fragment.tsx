import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface AppRow {
  id: string;
  name: string;
  icon: string;
  tint: string;
}

// The social app the task names is `id: 'chirp'` in both modes — only its
// presentation changes. `echo-notes` is an ordinary, unrelated app that exists
// in BOTH modes; it is not introduced by the fault. That matters: the collision
// is caused purely by the rebrand moving onto an occupied name.
const BASELINE_APPS: AppRow[] = [
  { id: 'lumina', name: 'Lumina Photos', icon: '🌅', tint: '#fff3e0' },
  { id: 'chirp', name: 'Chirp', icon: '🐦', tint: '#e3f2fd' },
  { id: 'echo-notes', name: 'Echo Notes', icon: '📝', tint: '#f1f8e9' },
  { id: 'tempo', name: 'Tempo', icon: '🎧', tint: '#f3e5f5' },
  { id: 'ledger', name: 'Ledger', icon: '💰', tint: '#e8f5e9' },
];

const FAULTY_APPS: AppRow[] = [
  { id: 'lumina', name: 'Lumina Photos', icon: '🌅', tint: '#fff3e0' },
  { id: 'chirp', name: 'Echo', icon: '🔊', tint: '#e0f7fa' },
  { id: 'echo-notes', name: 'Echo Notes', icon: '📝', tint: '#f1f8e9' },
  { id: 'tempo', name: 'Tempo', icon: '🎧', tint: '#f3e5f5' },
  { id: 'ledger', name: 'Ledger', icon: '💰', tint: '#e8f5e9' },
];

/**
 * X05 · M_REBRAND_COLLISION_NOTIFICATIONS — F-IDT-04 Rebrand Breaks Entity
 * Grounding. Third observation of the type; hosted on Notifications
 * (M_DEAD_CHECKBOX).
 *
 * Mechanism — the rebrand lands on a name ALREADY IN USE, which is what makes
 * this distinct from the other two observations. M_RENAME_INSTALL_APPSTORE (E21)
 * and M_RENAME_SETTINGS_APPS (E22) both retire "Chirp" in favour of "Zap", a
 * string that appears nowhere else; grounding fails by finding NOTHING, and a
 * careful agent stalls or reports the target missing. Here Chirp is rebranded to
 * "Echo" while an unrelated "Echo Notes" is already installed, so:
 *
 *   · the string "Chirp" is absent from both the pixels and the a11y tree, AND
 *   · the closest surviving match is a DIFFERENT, real app.
 *
 * The failure mode is therefore an incorrect action performed confidently —
 * muting Echo Notes returns a perfectly ordinary success state — rather than a
 * visible stall. That is the harder case to detect in a run record: the agent
 * reports success and the screen agrees with it.
 *
 *   Baseline: the row reads "Chirp" 🐦; "Echo Notes" is present but unambiguous.
 *   Faulty:   the row reads "Echo" 🔊; two rows now begin with "Echo".
 *
 *   Fails:    vision-only AND text-only (name and icon are both replaced).
 *
 * Isolation: a separate per-app section below the host's notification card. The
 * host's defect is the inert "Push notifications" checkbox in that card, which
 * this task never touches.
 */
export default function RebrandCollisionNotificationsFragment({
  faultActive: faultActiveProp,
}: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const apps = faultActive ? FAULTY_APPS : BASELINE_APPS;
  const [muted, setMuted] = useState<Record<string, boolean>>({});

  return (
    <View testID={faultActive ? 'defect:M_REBRAND_COLLISION_NOTIFICATIONS' : undefined}>
      <Text style={styles.sectionLabel}>PER-APP NOTIFICATIONS</Text>
      <View style={styles.card}>
        {apps.map((app, i) => {
          const isMuted = !!muted[app.id];
          return (
            <Pressable
              key={app.id}
              onPress={() => setMuted((prev) => ({ ...prev, [app.id]: !prev[app.id] }))}
              accessibilityRole="switch"
              accessibilityState={{ checked: isMuted }}
              accessibilityLabel={`Mute notifications from ${app.name}`}
              style={[styles.row, i > 0 && styles.rowBorder]}
            >
              <View style={[styles.iconBadge, { backgroundColor: app.tint }]}>
                <Text style={styles.icon}>{app.icon}</Text>
              </View>
              <Text style={styles.rowLabel}>{app.name}</Text>
              <Text style={[styles.state, isMuted && styles.stateMuted]}>
                {isMuted ? 'Muted' : 'On'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 8,
  },
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#e6e6ea' },
  iconBadge: { width: 36, height: 36, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 18 },
  rowLabel: { flex: 1, fontSize: 15, color: '#111', fontWeight: '600' },
  state: { fontSize: 13, color: '#9e9e9e', fontWeight: '700' },
  stateMuted: { color: '#c62828' },
});
