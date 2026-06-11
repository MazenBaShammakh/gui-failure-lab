import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { scenarioRegistry } from '@/components/scenarios';

export default function BaselineScenarioStepN() {
  const params = useLocalSearchParams<{ 'scenario-id': string; step: string }>();
  const scenarioId = params['scenario-id'];
  const stepNum = parseInt(params.step, 10);
  const steps = scenarioId ? scenarioRegistry[scenarioId] : undefined;
  const StepComponent = steps?.[stepNum];

  if (!StepComponent) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.text}>
          Unknown step {stepNum} for scenario: {scenarioId}
        </Text>
      </View>
    );
  }

  return <StepComponent faultActive={false} />;
}

const styles = StyleSheet.create({
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { fontSize: 15, color: '#888' },
});
