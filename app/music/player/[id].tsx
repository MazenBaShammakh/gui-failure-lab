import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import ActionNotExposedInTree from '@/components/failures/action-not-exposed-in-tree';
import GhostElementNoBackingNode from '@/components/failures/ghost-element-no-backing-node';

export default function MusicPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (id === 'midnight') return <ActionNotExposedInTree />;
  if (id === 'ocean') return <GhostElementNoBackingNode />;

  return (
    <View style={styles.notFound}>
      <Text style={styles.text}>Track not found</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { fontSize: 15, color: '#888' },
});
