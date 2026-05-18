import { Stack } from 'expo-router';
import { useAuthCtx } from '@/contexts/auth';
import { usePosSettings } from '@/contexts/settings';

export default function AuthLayout() {
  const { state } = useAuthCtx();
  const { isComplete: hasPosDefaults } = usePosSettings();
  const authState = state.status === 'authenticated' ? state : null;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Protected guard={state.status === 'unauthenticated'}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="login-password" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="login-otp" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>

      <Stack.Protected guard={state.status === 'authenticated' && !authState?.hasAppLockSetup}>
        <Stack.Screen name="app-lock-setup" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>

      <Stack.Protected guard={state.status === 'authenticated' && !!authState?.hasAppLockSetup && !!authState?.isAppLocked}>
        <Stack.Screen
          name="app-lock"
          options={{
            animation: 'slide_from_bottom',
            animationDuration: 400,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={state.status === 'authenticated' && !authState?.isAppLocked && !hasPosDefaults}>
        <Stack.Screen name="pos-setup" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>
    </Stack>
  );
}
