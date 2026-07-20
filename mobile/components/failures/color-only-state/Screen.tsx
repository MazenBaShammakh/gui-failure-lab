import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Service {
  id: string;
  name: string;
  detail: string;
  up: boolean;
}

const SERVICES: Service[] = [
  { id: 'api', name: 'API Gateway', detail: 'Latency 42ms · 12 regions', up: true },
  { id: 'db', name: 'Database', detail: 'Replication healthy', up: true },
  { id: 'cdn', name: 'CDN', detail: 'Cache hit rate 98%', up: true },
  { id: 'auth', name: 'Auth', detail: 'Token issuance failing', up: false },
  { id: 'billing', name: 'Billing', detail: 'Invoices processing', up: true },
];

const UP = '#2e9e44';
const DOWN = '#d32f2f';

export default function ColorOnlyStateScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [openedId, setOpenedId] = useState<string | null>(null);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_COLOR_ONLY_STATE' : undefined}
    >
      <Stack.Screen options={{ title: 'Service Status' }} />

      <Text style={styles.heading}>Service status</Text>
      <Text style={styles.subheading}>System health overview</Text>

      <View style={styles.list}>
        {SERVICES.map((svc) => {
          const opened = openedId === svc.id;
          const statusText = svc.up ? 'Operational' : 'Down';

          // BASELINE: row exposes the status via a clear text label and
          // accessibilityState — readable by vision, text, and tree agents.
          // FAULTY: status is encoded ONLY by the colored dot — no status text,
          // no accessibilityState, no label conveying it. Text/tree agents (and
          // the colorblind case) cannot tell which service is down.
          const rowA11yLabel = faultActive
            ? svc.name
            : `${svc.name}, ${statusText}`;

          return (
            <Pressable
              key={svc.id}
              style={({ pressed }) => [
                styles.row,
                opened && styles.rowOpened,
                pressed && styles.rowPressed,
              ]}
              onPress={() => setOpenedId(svc.id)}
              accessibilityRole="button"
              accessibilityLabel={rowA11yLabel}
              {...(faultActive
                ? {}
                : { accessibilityState: { disabled: !svc.up } })}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: svc.up ? UP : DOWN },
                ]}
              />

              <View style={styles.rowBody}>
                <Text style={styles.svcName}>{svc.name}</Text>
                <Text style={styles.svcDetail}>{svc.detail}</Text>
              </View>

              {!faultActive && (
                <Text
                  style={[
                    styles.statusLabel,
                    { color: svc.up ? UP : DOWN },
                  ]}
                >
                  {statusText}
                </Text>
              )}

              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        })}
      </View>

      {openedId && (
        <Text style={styles.openedNote} accessibilityLiveRegion="polite">
          Opened: {SERVICES.find((s) => s.id === openedId)?.name}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 20, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', color: '#111' },
  subheading: { fontSize: 14, color: '#888', marginBottom: 16, marginTop: 2 },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  rowOpened: { borderWidth: 2, borderColor: '#1565c0' },
  rowPressed: { opacity: 0.9 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  rowBody: { flex: 1 },
  svcName: { fontSize: 16, fontWeight: '600', color: '#111' },
  svcDetail: { fontSize: 13, color: '#999', marginTop: 2 },
  statusLabel: { fontSize: 14, fontWeight: '700' },
  chevron: { fontSize: 22, color: '#bbb', marginLeft: 4 },
  openedNote: { fontSize: 14, color: '#1565c0', fontWeight: '600', marginTop: 16 },
});
