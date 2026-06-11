import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { failureRegistry } from '@/components/failures';

export default function BaselineFailureScreen() {
  const params = useLocalSearchParams<{ 'failure-id': string }>();
  const failureId = params['failure-id'];
  const ScreenComponent = failureId ? failureRegistry[failureId] : undefined;

  if (!ScreenComponent) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.text}>Unknown failure: {failureId}</Text>
      </View>
    );
  }

  return <ScreenComponent faultActive={false} />;
}

const styles = StyleSheet.create({
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { fontSize: 15, color: '#888' },
});
