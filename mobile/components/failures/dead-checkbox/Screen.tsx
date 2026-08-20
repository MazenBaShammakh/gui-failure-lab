import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import RebrandCollisionNotifications from '@/components/failures/rebrand-collision-notifications';

interface Props {
  faultActive?: boolean;
}

interface Setting {
  id: string;
  label: string;
  hint: string;
}

const SETTINGS: Setting[] = [
  { id: 'push', label: 'Push notifications', hint: 'Alerts on your lock screen and banner.' },
  { id: 'email', label: 'Email notifications', hint: 'Summaries and important updates by email.' },
  { id: 'sound', label: 'Sounds', hint: 'Play a sound for new notifications.' },
];

export default function DeadCheckboxScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [checked, setChecked] = useState<Record<string, boolean>>({
    push: false,
    email: true,
    sound: true,
  });

  const toggle = (id: string) => {
    // Faulty: the "Push notifications" checkbox renders and reads as a checkbox
    // but its handler is inert, so it never toggles. Other rows still work.
    // Baseline: every row toggles normally.
    if (faultActive && id === 'push') return;
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_DEAD_CHECKBOX' : undefined}
    >
      <Stack.Screen options={{ title: 'Notifications' }} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          {SETTINGS.map((s, i) => {
            const isOn = checked[s.id];
            return (
              <Pressable
                key={s.id}
                onPress={() => toggle(s.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isOn }}
                accessibilityLabel={s.label}
                style={[styles.row, i > 0 && styles.rowBorder]}
              >
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{s.label}</Text>
                  <Text style={styles.rowHint}>{s.hint}</Text>
                </View>
                <View style={[styles.checkbox, isOn && styles.checkboxOn]}>
                  {isOn && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* X05 (F-IDT-04): per-app rows in their own section below. The host's
            defect is the inert "Push notifications" checkbox in the card above,
            which this task never touches. */}
        <RebrandCollisionNotifications />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f3f7' },
  content: { padding: 20 },
  sectionLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#e5e5e5' },
  rowText: { flex: 1, gap: 3 },
  rowLabel: { fontSize: 16, color: '#111', fontWeight: '600' },
  rowHint: { fontSize: 13, color: '#888', lineHeight: 18 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxOn: { backgroundColor: '#1565c0', borderColor: '#1565c0' },
  checkMark: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
