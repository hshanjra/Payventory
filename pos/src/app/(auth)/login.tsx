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

  // Derived border color for focused inputs
  const inputBorderColor = (focused: boolean) => (focused ? colors.primary : colors.border);

  const gradientColors: [string, string] = isDark
    ? ['#1E293B', colors.canvas] // Softer dark
    : ['#FFFBEB', colors.canvas]; // Warm amber-50 light

  const handleLoginWithPassword = async () => {
    const isValid = await trigger('email');
    if (!isValid) return;
    router.push(`/(auth)/login-password?email=${encodeURIComponent(email.trim())}`);
  };

  const handleLoginWithOTP = async () => {
    const isValid = await trigger('email');
    if (!isValid) return;
    router.push(`/(auth)/login-otp?email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background gradient */}
      <LinearGradient colors={gradientColors} className="absolute inset-0" />

      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: 16, paddingBottom: 32 }}
          className="px-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Back button */}
          <Pressable
            className="mb-6 h-10 w-10 items-center justify-center self-start rounded-xl"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}
            onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color={colors.foreground} />
          </Pressable>

          {/* Header */}
          <PageHeader
            title="Welcome back"
            subtitle="Sign in to your Payventory account"
            icon="credit-card"
          />

          <View className="mt-8 gap-8">
            {/* ── Email field ── */}
            <View className="gap-2.5">
              <Text
                className="text-[13px] font-bold uppercase tracking-wider"
                style={{ color: colors.fgMuted }}>
                Email address
              </Text>
              <TextInput
                className="h-[56px] rounded-[16px] border-[1.5px] px-4 text-[16px] font-semibold"
                style={{
                  backgroundColor: colors.surface,
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

            {/* ── Action Buttons ── */}
            <View className="gap-4">
              <View
                className="h-[56px] rounded-[16px]"
                style={{
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isDark ? 0.3 : 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                <Pressable
                  className="h-full w-full flex-row items-center justify-center rounded-[16px]"
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? colors.primaryFg + '15' : 'transparent',
                  })}
                  onPress={handleLoginWithPassword}>
                  <MaterialIcons name="vpn-key" size={20} color={colors.primaryFg} className="mr-2" />
                  <Text
                    className="text-[16px] font-black uppercase tracking-widest"
                    style={{ color: colors.primaryFg }}>
                    Login with Password
                  </Text>
                </Pressable>
              </View>

              <View
                className="h-[56px] rounded-[16px] border-[1.5px]"
                style={{
                  backgroundColor: colors.muted,
                  borderColor: colors.borderStrong || colors.border,
                }}>
                <Pressable
                  className="h-full w-full flex-row items-center justify-center rounded-[16px]"
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? colors.foreground + '05' : 'transparent',
                  })}
                  onPress={handleLoginWithOTP}>
                  <MaterialIcons name="smartphone" size={20} color={colors.foreground} className="mr-2" />
                  <Text
                    className="text-[16px] font-black uppercase tracking-widest"
                    style={{ color: colors.foreground }}>
                    Login with OTP
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View className="mt-auto pt-10">
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
