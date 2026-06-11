import { Stack } from 'expo-router';

export default function BaselineLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="failures" />
      <Stack.Screen name="scenarios" />
    </Stack>
  );
}
