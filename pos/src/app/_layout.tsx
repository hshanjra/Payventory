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

import '../../global.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 1000 * 60 * 60 * 24 } },
});
const asyncStoragePersister = createAsyncStoragePersister({ storage: AsyncStorage });

const FinanceLightTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: light.canvas, card: light.surface, primary: light.primary },
};
const FinanceDarkTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: dark.canvas, card: dark.surface, primary: dark.primary, border: dark.border },
};

function App() {
  const { colors, isDark } = useTheme();
  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* flex-1 wrapper so Stack fills the SafeAreaView */}
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Protected guard={true}>
            <Stack.Screen name="(tabs)"   options={{ headerShown: false }} />
            <Stack.Screen name="cart"     options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="search"   options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="scan"     options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const { isDark } = useTheme();
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
        <ThemeProvider value={isDark ? FinanceDarkTheme : FinanceLightTheme}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <App />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
