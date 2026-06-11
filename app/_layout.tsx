import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { FaultModeProvider } from '@/lib/fault-mode';

export default function RootLayout() {
  return (
    <FaultModeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ title: 'Settings', presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </FaultModeProvider>
  );
}
