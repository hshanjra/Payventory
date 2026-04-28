import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient } from '@tanstack/react-query';
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
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import '../../global.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 1000 * 60 * 60 * 24 } },
});
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
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (state.status === 'loading') return;

    const inAuthGroup = segments[0] === '(auth)';

    if (state.status === 'unauthenticated') {
      if (!inAuthGroup) {
        router.replace('/(auth)/onboarding');
      }
    } else if (state.status === 'authenticated') {
      if (!state.hasAppLockSetup) {
        if (segments[1] !== 'app-lock-setup') {
          router.replace('/(auth)/app-lock-setup');
        }
      } else if (state.isAppLocked) {
        if (segments[1] !== 'app-lock') {
          router.replace('/(auth)/app-lock');
        }
      } else if (inAuthGroup) {
        // If logged in and unlocked, don't stay in auth group unless it's onboarding (though usually we'd go to tabs)
        router.replace('/(tabs)');
      }
    }
  }, [state.status, state.hasAppLockSetup, state.isAppLocked, segments]);

  if (state.status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center' }}>
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
          <Stack.Screen name="cart" options={{ presentation: 'modal' }} />
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
                <App />
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
