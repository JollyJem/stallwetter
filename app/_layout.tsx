import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#111',
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: '#f9fafb' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'StallWetter' }} />
        <Stack.Screen name="horses" options={{ title: 'Pferde' }} />
        <Stack.Screen
          name="horses/new"
          options={{ presentation: 'modal', title: 'Pferd hinzufügen' }}
        />
      </Stack>
    </>
  );
}
