import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

const TOP_ACTIONS = [
  { id: 'chat', label: 'Chat with us', emoji: '💬' },
  { id: 'faqs', label: 'FAQs', emoji: '❓' },
  { id: 'call', label: 'Call support', emoji: '📞' },
];

const CATEGORIES = [
  { id: 'account', label: 'Account issues' },
  { id: 'card', label: 'Card issues' },
  { id: 'settings', label: 'Settings' },
];

const ACCOUNT_ITEMS = [
  { id: 'fraud', label: 'Report fraud', emoji: '🚨' },
  { id: 'dispute', label: 'Dispute a charge', emoji: '📋' },
  { id: 'contact', label: 'Update contact info', emoji: '✏️' },
];

export default function HiddenNavSubtleMenuScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [reported, setReported] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const onReportFraud = () => setReported(true);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_HIDDEN_NAV_SUBTLE_MENU' : undefined}
    >
      <Stack.Screen options={{ title: 'Support' }} />

      {reported && (
        <View style={styles.banner} accessibilityLiveRegion="polite">
          <Text style={styles.bannerText}>✓ Fraud report submitted. We&apos;ll follow up within 24h.</Text>
        </View>
      )}

      {TOP_ACTIONS.map((a) => (
        <View key={a.id} style={styles.row}>
          <Text style={styles.rowIcon}>{a.emoji}</Text>
          <Text style={styles.rowLabel}>{a.label}</Text>
        </View>
      ))}

      {!faultActive ? (
        // Baseline: Report fraud is a top-level, clearly visible action —
        // no nesting, styled with urgency to match its importance.
        <Pressable
          onPress={onReportFraud}
          accessibilityRole="button"
          accessibilityLabel="Report fraud"
          style={styles.fraudRow}
        >
          <Text style={styles.rowIcon}>🚨</Text>
          <Text style={styles.fraudLabel}>Report fraud</Text>
        </Pressable>
      ) : (
        // Faulty: Report fraud is nested two levels inside a "•••" overflow
        // with no chevron, badge, or count hinting that more items — let
        // alone an urgent one — exist below the three visible actions.
        <>
          <Pressable
            onPress={() => setOverflowOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="More"
            style={styles.row}
          >
            <Text style={styles.rowIcon}>•••</Text>
            <Text style={styles.rowLabel}>More</Text>
          </Pressable>

          {overflowOpen && (
            <View style={styles.nestedGroup}>
              {CATEGORIES.map((c) => (
                <View key={c.id}>
                  <Pressable
                    onPress={() =>
                      setExpandedCategory((cur) => (cur === c.id ? null : c.id))
                    }
                    accessibilityRole="button"
                    accessibilityLabel={c.label}
                    style={styles.nestedRow}
                  >
                    <Text style={styles.nestedLabel}>{c.label}</Text>
                  </Pressable>
                  {expandedCategory === c.id && c.id === 'account' && (
                    <View style={styles.nestedGroup2}>
                      {ACCOUNT_ITEMS.map((item) => (
                        <Pressable
                          key={item.id}
                          onPress={item.id === 'fraud' ? onReportFraud : undefined}
                          accessibilityRole="button"
                          accessibilityLabel={item.label}
                          style={styles.nestedRow2}
                        >
                          <Text style={styles.rowIcon}>{item.emoji}</Text>
                          <Text style={styles.nestedLabel}>{item.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 48 },
  banner: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  bannerText: { color: '#2e7d32', fontSize: 14, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  rowIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  rowLabel: { fontSize: 16, color: '#111' },
  fraudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  fraudLabel: { fontSize: 16, fontWeight: '700', color: '#c62828' },
  nestedGroup: {
    marginLeft: 8,
    borderLeftWidth: 2,
    borderColor: '#eee',
    paddingLeft: 12,
  },
  nestedRow: { paddingVertical: 12 },
  nestedLabel: { fontSize: 15, color: '#333' },
  nestedGroup2: {
    marginLeft: 8,
    borderLeftWidth: 2,
    borderColor: '#f0f0f0',
    paddingLeft: 12,
  },
  nestedRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
});
