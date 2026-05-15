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
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useAuthCtx } from '@/contexts/auth';
import { Alert, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const OTP_LENGTH = 6;
const loginOtpSchema = z.object({
  otp: z
    .string()
    .regex(/^\d+$/, 'OTP must contain only digits')
    .length(OTP_LENGTH, 'Enter the 6-digit OTP'),
});
type LoginOtpFormValues = z.infer<typeof loginOtpSchema>;

export default function LoginOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { colors, isDark } = useTheme();

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const { validateOtp } = useAuthCtx();
  const {
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<LoginOtpFormValues>({
    resolver: zodResolver(loginOtpSchema),
    defaultValues: { otp: '' },
    mode: 'onSubmit',
  });
  const otpValue = watch('otp');
  const otpDigits = Array.from({ length: OTP_LENGTH }).map((_, idx) => otpValue[idx] ?? '');

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

  const handleOtpChange = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const next = otpValue.padEnd(OTP_LENGTH, ' ').split('');
    next[idx] = digit || ' ';
    const merged = next.join('').replace(/\s/g, '').slice(0, OTP_LENGTH);
    setValue('otp', merged, { shouldValidate: false });
    if (digit && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const gradientColors: [string, string] = isDark
    ? ['#181002', colors.canvas]
    : ['#FFFBEB', colors.canvas];

  const cardAnim_style = {
    opacity: cardAnim,
    transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [48, 0] }) }],
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
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
          <View className="mb-6 items-center gap-2 py-2">
            <View
              className="mb-1 h-16 w-16 items-center justify-center rounded-[20px]"
              style={{ backgroundColor: colors.primary + '12' }}>
              <MaterialIcons name="smartphone" size={32} color={colors.primary} />
            </View>
            <Text
              className="text-center text-[28px] font-extrabold tracking-[-0.4px]"
              style={{ color: colors.primary }}>
              Enter OTP
            </Text>
            <Text
              className="text-center text-[15px] leading-[22px]"
              style={{ color: colors.fgSecondary }}>
              We've sent a 6-digit code to{'\n'}
              <Text className="font-semibold" style={{ color: colors.foreground }}>
                {email}
              </Text>
            </Text>
          </View>

          {/* Card */}
          <Animated.View
            className="mb-6 gap-5 rounded-3xl border p-6"
            style={[
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                boxShadow: isDark
                  ? '0 16px 48px rgba(0,0,0,0.55)'
                  : '0 8px 40px rgba(15,23,42,0.08)',
              },
              cardAnim_style,
            ]}>
            <View className="gap-3">
              <Text
                className="mb-2 text-center text-[14px] leading-5"
                style={{ color: colors.fgSecondary }}>
                Enter your code below
              </Text>
              <View className="flex-row justify-center gap-2.5">
                {otpDigits.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(r) => {
                      otpRefs.current[i] = r;
                    }}
                    className="h-14 w-11 rounded-[12px] border-[1.5px] text-center text-[22px] font-bold"
                    style={{
                      backgroundColor: colors.muted,
                      borderColor: digit ? colors.primary : colors.border,
                      color: colors.foreground,
                    }}
                    value={digit}
                    onChangeText={(v) => handleOtpChange(v, i)}
                    onKeyPress={(e) => handleOtpKeyPress(e, i)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    autoFocus={i === 0}
                  />
                ))}
              </View>
              <Pressable className="mt-3 self-center">
                <Text className="text-[13px] font-medium" style={{ color: colors.primary }}>
                  Resend code
                </Text>
              </Pressable>
              {!!errors.otp?.message && (
                <Text
                  className="text-center text-[13px] font-medium"
                  style={{ color: colors.error }}>
                  {errors.otp.message}
                </Text>
              )}

              {/* Sign in button */}
              <Pressable
                className="mt-3 overflow-hidden rounded-2xl"
                style={({ pressed }) =>
                  pressed || loading ? { opacity: 0.88, transform: [{ scale: 0.975 }] } : {}
                }
                disabled={loading}
                onPress={async () => {
                  const isValid = await trigger('otp');
                  if (!isValid) return;
                  setLoading(true);
                  try {
                    await validateOtp(email, otpValue);
                  } catch (err: any) {
                    Alert.alert(
                      'Validation Failed',
                      err?.message || 'Check your code and try again.'
                    );
                  } finally {
                    setLoading(false);
                  }
                }}>
                <View
                  style={{ backgroundColor: colors.primary }}
                  className="h-14 items-center justify-center">
                  {loading ? (
                    <ActivityIndicator color={colors.primaryFg} />
                  ) : (
                    <Text style={{ color: colors.primaryFg }} className="text-[16px] font-bold tracking-[0.3px]">
                      Sign In
                    </Text>
                  )}
                </View>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
