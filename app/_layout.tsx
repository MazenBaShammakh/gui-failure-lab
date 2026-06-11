import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'gui-failure-lab' }} />
        <Stack.Screen name="baseline" options={{ headerShown: false }} />
        <Stack.Screen name="faulty" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
