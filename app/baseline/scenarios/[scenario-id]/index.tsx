import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { scenarioRegistry } from '@/components/scenarios';

export default function BaselineScenarioStep1() {
  const params = useLocalSearchParams<{ 'scenario-id': string }>();
  const scenarioId = params['scenario-id'];
  const steps = scenarioId ? scenarioRegistry[scenarioId] : undefined;
  const StepComponent = steps?.[1];

  if (!StepComponent) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.text}>Unknown scenario: {scenarioId}</Text>
      </View>
    );
  }

  return <StepComponent faultActive={false} />;
}

const styles = StyleSheet.create({
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { fontSize: 15, color: '#888' },
});
