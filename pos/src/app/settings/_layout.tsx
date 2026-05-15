import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="app-lock" />
      <Stack.Screen name="sales-channel" />
      <Stack.Screen name="department" />
      <Stack.Screen name="region" />
    </Stack>
  );
}
