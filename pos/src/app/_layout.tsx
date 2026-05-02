import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { View } from 'react-native';
import { useTheme, light, dark } from '@/theme/useTheme';
import { AuthProvider, useAuthCtx } from '@/contexts/auth';
import { SettingsProvider, usePosSettings } from '@/contexts/settings';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import '../../global.css';

import { queryClient } from '@/lib/query-client';
const asyncStoragePersister = createAsyncStoragePersister({ storage: AsyncStorage });

const FinanceLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: light.canvas,
    card: light.surface,
    primary: light.primary,
  },
};
const FinanceDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: dark.canvas,
    card: dark.surface,
    primary: dark.primary,
    border: dark.border,
  },
};

function App() {
  const { colors } = useTheme();
  const { state } = useAuthCtx();
  const { isReady: settingsReady, isComplete: hasPosDefaults } = usePosSettings();
  const segments = useSegments();
  const router = useRouter();
  const authState = state.status === 'authenticated' ? state : null;

  useEffect(() => {
    if (state.status === 'loading') return;
    if (state.status === 'authenticated' && !settingsReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (state.status === 'unauthenticated') {
      if (!inAuthGroup) {
        router.replace('/(auth)/onboarding');
      }
    } else if (state.status === 'authenticated') {
      const currentLeaf = segments[segments.length - 1];
      if (!authState?.hasAppLockSetup) {
        if (currentLeaf !== 'app-lock-setup') {
          router.replace('/(auth)/app-lock-setup');
        }
      } else if (authState.isAppLocked) {
        if (currentLeaf !== 'app-lock') {
          router.replace('/(auth)/app-lock');
        }
      } else if (!hasPosDefaults) {
        if (currentLeaf !== 'pos-setup') {
          router.replace('/(auth)/pos-setup');
        }
      } else if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [
    state.status,
    authState?.hasAppLockSetup,
    authState?.isAppLocked,
    hasPosDefaults,
    settingsReady,
    segments,
  ]);

  if (state.status === 'loading' || (state.status === 'authenticated' && !settingsReady)) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.canvas,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {/* You could add a logo or spinner here */}
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="draft-order" options={{ presentation: 'modal' }} />
          <Stack.Screen name="search" options={{ animation: 'fade' }} />
          <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const { isDark } = useTheme();
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}>
        <ThemeProvider value={isDark ? FinanceDarkTheme : FinanceLightTheme}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <SettingsProvider>
                  <App />
                </SettingsProvider>
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
