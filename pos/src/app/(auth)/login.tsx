import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Animated,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { colors, isDark } = useTheme();

  const [emailFocused, setEmailFocused] = useState(false);
  const {
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
    mode: 'onSubmit',
  });
  const email = watch('email');

  // Card entrance animation
  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 55,
      friction: 8,
    }).start();
  }, []);

  // Derived border color for focused inputs
  const inputBorderColor = (focused: boolean) => (focused ? colors.primary : colors.border);

  const gradientColors: [string, string] = isDark
    ? ['#181002', colors.canvas] // Warm dark
    : ['#FFFBEB', colors.canvas]; // Warm amber-50 light

  const cardAnim_style = {
    transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [48, 0] }) }],
    opacity: cardAnim,
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background gradient */}
      <LinearGradient colors={gradientColors} className="absolute inset-0" />

      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          className="flex-grow px-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Back button */}
          <Pressable
            className="mb-6 h-10 w-10 items-center justify-center self-start rounded-xl"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}
            onPress={() => router.back()}>
            <Text className="text-[18px]" style={{ color: colors.foreground }}>
              ←
            </Text>
          </Pressable>

          {/* Header */}
          <PageHeader
            title="Welcome back"
            subtitle="Sign in to your Payventory account"
            icon="credit-card"
          />

          {/* Card */}
          <Card style={cardAnim_style}>
            {/* ── Email field ── */}
            <View className="gap-2">
              <Text
                className="text-[13px] font-semibold uppercase tracking-wider"
                style={{ color: colors.fgMuted }}>
                Email address
              </Text>
              <TextInput
                className="h-[52px] rounded-[14px] border-[1.5px] px-4 text-[15px] font-medium"
                style={{
                  backgroundColor: colors.muted,
                  borderColor: inputBorderColor(emailFocused),
                  color: colors.foreground,
                }}
                placeholder="you@company.com"
                placeholderTextColor={colors.fgMuted}
                value={email}
                onChangeText={(value) => setValue('email', value, { shouldValidate: false })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={async () => {
                  setEmailFocused(false);
                  await trigger('email');
                }}
              />
              {!!errors.email?.message && (
                <Text className="text-[13px] font-medium" style={{ color: colors.error }}>
                  {errors.email.message}
                </Text>
              )}
            </View>

            {/* ── Login method buttons ── */}
            <View className="mt-1 gap-3">
              <Text
                className="text-[13px] font-semibold uppercase tracking-wider"
                style={{ color: colors.fgMuted }}>
                Login method
              </Text>

              <Pressable
                className="flex-row items-center justify-between rounded-2xl p-4"
                style={({ pressed }) => ({
                  borderWidth: 1.5,
                  backgroundColor: pressed ? colors.primary + '1a' : colors.muted,
                  borderColor: colors.border,
                })}
                onPress={async () => {
                  const isValid = await trigger('email');
                  if (!isValid) return;
                  router.push(`/(auth)/login-password?email=${encodeURIComponent(email.trim())}`);
                }}>
                <View className="flex-row items-center gap-3.5">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-[14px]"
                    style={{ backgroundColor: colors.primary + '26' }}>
                    <MaterialIcons name="vpn-key" size={22} color={colors.primary} />
                  </View>
                  <View>
                    <Text className="text-[15px] font-bold" style={{ color: colors.foreground }}>
                      Password
                    </Text>
                    <Text className="mt-0.5 text-[13px]" style={{ color: colors.fgSecondary }}>
                      Login with account password
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={colors.fgMuted} />
              </Pressable>

              <Pressable
                className="flex-row items-center justify-between rounded-2xl p-4"
                style={({ pressed }) => ({
                  borderWidth: 1.5,
                  backgroundColor: pressed ? colors.primary + '1a' : colors.muted,
                  borderColor: colors.border,
                })}
                onPress={async () => {
                  const isValid = await trigger('email');
                  if (!isValid) return;
                  router.push(`/(auth)/login-otp?email=${encodeURIComponent(email.trim())}`);
                }}>
                <View className="flex-row items-center gap-3.5">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-[14px]"
                    style={{ backgroundColor: colors.primary + '26' }}>
                    <MaterialIcons name="smartphone" size={22} color={colors.primary} />
                  </View>
                  <View>
                    <Text className="text-[15px] font-bold" style={{ color: colors.foreground }}>
                      OTP / Magic Link
                    </Text>
                    <Text className="mt-0.5 text-[13px]" style={{ color: colors.fgSecondary }}>
                      Receive a code on your email
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={colors.fgMuted} />
              </Pressable>
            </View>
          </Card>

          {/* Footer */}
          <View className="mt-8 gap-5 px-5">
            <Pressable
              className="h-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.primary }}
              onPress={async () => {
                const isValid = await trigger('email');
                if (!isValid) return;
                router.push(`/(auth)/login-password?email=${encodeURIComponent(email.trim())}`);
              }}>
              <Text style={{ color: colors.primaryFg }} className="text-[16px] font-black uppercase tracking-widest">
                Continue to Password
              </Text>
            </Pressable>
            
            <Text className="text-center text-[13px] leading-5" style={{ color: colors.fgMuted }}>
              By signing in you agree to our <Text style={{ color: colors.primary }}>Terms</Text> and{' '}
              <Text style={{ color: colors.primary }}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
