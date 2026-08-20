import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';
import WebViewOpaquePrivacyPanel from '@/components/failures/webview-opaque-privacy-panel';

interface Props {
  faultActive?: boolean;
}

const DESCRIPTION_EN =
  'Notiz is a simple, fast note-taking app. Capture ideas instantly, organize ' +
  'them into folders, and sync across every device. No clutter, no distractions ' +
  '— just your notes, always within reach.';

const DESCRIPTION_DE =
  'Notiz ist eine einfache, schnelle Notiz-App. Halten Sie Ideen sofort fest, ' +
  'organisieren Sie sie in Ordnern und synchronisieren Sie sie geräteübergreifend. ' +
  'Kein Schnickschnack, keine Ablenkung — nur Ihre Notizen, immer griffbereit.';

const REVIEWS_EN = [
  { author: 'Priya K.', text: 'Clean interface and syncs instantly. Exactly what I needed.' },
  { author: 'Tom R.', text: 'Replaced three other note apps with this one.' },
];

const REVIEWS_DE = [
  { author: 'Priya K.', text: 'Übersichtliche Oberfläche und sofortige Synchronisierung. Genau das, was ich brauchte.' },
  { author: 'Tom R.', text: 'Hat drei andere Notiz-Apps ersetzt.' },
];

export default function UnsupportedLanguageContentScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const description = faultActive ? DESCRIPTION_DE : DESCRIPTION_EN;
  const reviews = faultActive ? REVIEWS_DE : REVIEWS_EN;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={faultActive ? 'defect:M_UNSUPPORTED_LANGUAGE_CONTENT' : undefined}
    >
      <Stack.Screen options={{ title: 'Notiz' }} />

      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Text style={styles.icon}>📝</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>Notiz</Text>
          <Text style={styles.developer}>Simple note-taking</Text>
        </View>
        <Pressable style={styles.getButton} accessibilityRole="button" accessibilityLabel="Get">
          <Text style={styles.getText}>Get</Text>
        </Pressable>
      </View>

      {/* Faulty: the description and reviews render in German with no
          translate affordance, even though the store chrome around it
          (title, buttons) stays in English — blocking a task that
          requires reading the content itself. */}
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{description}</Text>

      {/* X08 (F-PRC-02): the App Privacy panel is an embedded WebView and the only
          place the collected-data answer exists. Independent of the host's
          unsupported-language description above. */}
      <WebViewOpaquePrivacyPanel />

      <Text style={styles.sectionTitle}>Reviews</Text>
      {reviews.map((r, i) => (
        <View key={i} style={styles.reviewRow}>
          <Text style={styles.reviewAuthor}>{r.author}</Text>
          <Text style={styles.reviewText}>{r.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  content: { padding: 20, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 32 },
  headerInfo: { flex: 1, gap: 2 },
  name: { fontSize: 19, fontWeight: '700', color: '#111' },
  developer: { fontSize: 13, color: '#888' },
  getButton: {
    backgroundColor: '#e3f0ff',
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 16,
  },
  getText: { fontSize: 14, fontWeight: '700', color: '#007aff' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 10,
  },
  description: { fontSize: 15, color: '#333', lineHeight: 22 },
  reviewRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  reviewAuthor: { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 4 },
  reviewText: { fontSize: 14, color: '#555', lineHeight: 20 },
});
