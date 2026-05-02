import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="login-password" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="login-otp" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="app-lock-setup" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="app-lock" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="pos-setup" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
