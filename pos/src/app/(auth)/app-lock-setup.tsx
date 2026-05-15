import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { Layout } from '@/components/ui/layout';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthCtx } from '@/contexts/auth';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';

export default function AppLockSetupScreen() {
  const { colors, isDark } = useTheme();
  const { setupAppLock } = useAuthCtx();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 55,
      friction: 8,
    }).start();
  }, []);

  const handleEnableLocalAuth = async () => {
    try {
      setError('');
      const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync();

      if (enrolledLevel === LocalAuthentication.SecurityLevel.NONE) {
        setError('No screen lock (PIN, Pattern, or Biometrics) is configured on this device. Please set up a device lock in your system settings first.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to secure your app',
        fallbackLabel: 'Use Device Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await setupAppLock();
        setSuccess(true);
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (e) {
      setError('An error occurred during authentication.');
    }
  };

  const gradientColors: [string, string] = isDark
    ? ['#181002', colors.canvas]
    : ['#FFFBEB', colors.canvas];

  const cardAnim_style = {
    opacity: cardAnim,
    transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
  };

  if (success) {
    return (
      <Layout className="px-0 pt-0">
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={gradientColors} className="absolute inset-0" />
        <View className="flex-1 items-center justify-center gap-5 px-8">
          <Animated.View style={{ transform: [{ scale: cardAnim }] }}>
            <View
              className="h-24 w-24 items-center justify-center rounded-[28px] overflow-hidden"
              style={{ backgroundColor: colors.primary + '1e' }}>
              <Image
                source={require('@/assets/icon.png')}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
              />
            </View>
          </Animated.View>
          <Text
            className="text-center text-[32px] font-extrabold tracking-[-0.5px]"
            style={{ color: colors.foreground }}>
            {"You're all set!"}
          </Text>
          <Text className="text-center text-[16px] leading-6" style={{ color: colors.fgSecondary }}>
            {"Device lock is now enabled. You'll be prompted to authenticate when opening the app."}
          </Text>
          <Pressable
            className="w-full overflow-hidden rounded-2xl"
            style={({ pressed }) => (pressed ? { opacity: 0.88 } : {})}
            onPress={() => router.replace('/')}>
            <View
              style={{ backgroundColor: colors.primary }}
              className="h-14 items-center justify-center">
              <Text className="text-[16px] font-bold tracking-[0.3px] text-white">Continue →</Text>
            </View>
          </Pressable>
        </View>
      </Layout>
    );
  }

  return (
    <Layout className="px-0 pt-0">
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={gradientColors} className="absolute inset-0" />

      <View className="flex-1 items-center justify-center px-6">
        <Card style={cardAnim_style} className="w-full p-8">
          <PageHeader
            title="Secure Your App"
            subtitle="Enable device authentication (Passcode, PIN, Pattern, or Biometrics) to protect your sales data."
            icon="security"
            className="mb-0"
          />

          <Pressable
            className="overflow-hidden rounded-2xl"
            style={({ pressed }) => (pressed ? { opacity: 0.88 } : {})}
            onPress={handleEnableLocalAuth}>
            <View
              style={{ backgroundColor: colors.primary }}
              className="h-14 items-center justify-center">
              <Text className="text-[16px] font-bold tracking-[0.3px] text-white">
                Enable Device Lock
              </Text>
            </View>
          </Pressable>

          <Pressable onPress={() => router.replace('/')} className="self-center py-2">
            <Text className="text-[14px] font-semibold" style={{ color: colors.fgMuted }}>
              Skip for now
            </Text>
          </Pressable>

          {!!error && (
            <Text className="text-center text-[14px] font-medium" style={{ color: colors.error }}>
              {error}
            </Text>
          )}
        </Card>
      </View>
    </Layout>
  );
}

