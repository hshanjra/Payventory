import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { Layout } from '@/components/ui/layout';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useAuthCtx } from '@/contexts/auth';
import { Prompt } from '@/components/ui/prompt';

export default function AppLockScreen() {
  const { colors, isDark } = useTheme();
  const { unlockApp, logout } = useAuthCtx();

  const [error, setError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  const handleLocalAuth = async () => {
    if (authenticating) return;
    setAuthenticating(true);
    setError('');
    try {
      const success = await unlockApp();
      if (!success) {
        setError('Authentication failed. Please try again.');
      }
    } catch (e) {
      setError('An error occurred during authentication.');
    } finally {
      setAuthenticating(false);
    }
  };

  useEffect(() => {
    handleLocalAuth();
  }, []);

  const gradientColors: [string, string] = isDark
    ? ['#020617', '#0d1b35']
    : ['#eef2ff', colors.canvas];

  return (
    <Layout className="px-0 pt-0">
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={gradientColors} className="absolute inset-0" />

      <Prompt
        visible={showLogoutPrompt}
        title="Sign Out?"
        submitText="Sign Out"
        cancelText="Cancel"
        description="Are you sure you want to sign out of your account? You will need to log in again to access the POS."
        onSubmit={() => {
          setShowLogoutPrompt(false);
          logout();
        }}
        onClose={() => setShowLogoutPrompt(false)}
      />

      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-12 items-center gap-6">
          <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-[32px]">
            <Image
              source={require('@/assets/icon.png')}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
            />
          </View>
          <View className="items-center gap-2">
            <Text
              className="text-center text-[32px] font-extrabold tracking-[-0.5px]"
              style={{ color: colors.foreground }}>
              App Locked
            </Text>
            <Text
              className="text-center text-[16px] leading-6"
              style={{ color: colors.fgSecondary }}>
              Use your device passcode or biometrics to access your Divya Jyoti Foundation account.
            </Text>
          </View>
        </View>

        <View className="w-full gap-4">
          <Pressable
            className="h-16 w-full flex-row items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.primary }}
            onPress={handleLocalAuth}>
            <MaterialIcons name="security" size={24} color={colors.primaryFg} className="mr-2" />
            <Text
              className="text-[16px] font-black uppercase tracking-widest"
              style={{ color: colors.primaryFg }}>
              {authenticating ? 'Authenticating...' : 'Unlock App'}
            </Text>
          </Pressable>

          {!!error && (
            <Text className="text-center text-[14px] font-medium" style={{ color: colors.error }}>
              {error}
            </Text>
          )}
        </View>

        <Pressable onPress={() => setShowLogoutPrompt(true)} className="mt-12">
          <Text
            className="text-[14px] font-bold uppercase tracking-widest"
            style={{ color: colors.error }}>
            Log out of account
          </Text>
        </Pressable>
      </View>
    </Layout>
  );
}
