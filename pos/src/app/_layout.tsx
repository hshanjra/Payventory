import { SafeAreaProvider } from 'react-native-safe-area-context';
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
  const authState = state.status === 'authenticated' ? state : null;

  if (state.status === 'loading' || (state.status === 'authenticated' && !settingsReady)) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.canvas,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    );
  }

  const isFullyAuthenticated =
    state.status === 'authenticated' &&
    authState?.hasAppLockSetup &&
    !authState?.isAppLocked &&
    hasPosDefaults;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isFullyAuthenticated}>
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      </Stack.Protected>

      <Stack.Protected guard={!!isFullyAuthenticated}>
        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="store-select"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.75, 1],
            sheetGrabberVisible: true,
            sheetCornerRadius: 28,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="menu"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
          }}
        />

        <Stack.Screen
          name="draft-order"
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_right',
            animationDuration: 10,
          }}
        />

        <Stack.Screen
          name="product/[id]/variant-select"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [1],
            sheetGrabberVisible: true,
            sheetCornerRadius: 28,
          }}
        />

        <Stack.Screen name="orders/index" options={{ title: 'Orders' }} />
        <Stack.Screen name="orders/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="customers/index" options={{ title: 'Customers' }} />
        <Stack.Screen name="explore/index" options={{ title: 'Reports' }} />

        <Stack.Screen name="search" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

function ThemeConsumerWrapper() {
  const { isDark } = useTheme();
  return (
    <ThemeProvider value={isDark ? FinanceDarkTheme : FinanceLightTheme}>
      <App />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <AuthProvider>
              <SettingsProvider>
                <ThemeConsumerWrapper />
              </SettingsProvider>
            </AuthProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
