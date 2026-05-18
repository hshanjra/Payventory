import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { LayoutWithKeyboardAvoidingScroll } from '@/components/ui/layout';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
    <LayoutWithKeyboardAvoidingScroll
      contentContainerClassName="px-6 pt-4 pb-8"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background gradient */}
      <LinearGradient colors={gradientColors} className="absolute inset-0" />

      {/* Back button */}
      <Pressable
        className="mb-6 h-10 w-10 items-center justify-center self-start rounded-xl"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}
        onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={20} color={colors.foreground} />
      </Pressable>

      {/* Header */}
      <View className="mb-6 items-center gap-2 py-2">
        <View className="mb-1 h-16 w-16 items-center justify-center overflow-hidden rounded-[20px]">
          <Image
            source={require('@/assets/icon.png')}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
          />
        </View>
        <Text
          className="text-center text-[28px] font-extrabold tracking-[-0.4px]"
          style={{ color: colors.primary }}>
          Welcome back
        </Text>
        <Text
          className="text-center text-[15px] leading-[22px]"
          style={{ color: colors.fgSecondary }}>
          Sign in to your Divya Jyoti Foundation account
        </Text>
      </View>

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
              <MaterialIcons
                name="smartphone"
                size={20}
                color={colors.foreground}
                className="mr-2"
              />
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
    </LayoutWithKeyboardAvoidingScroll>
  );
}
