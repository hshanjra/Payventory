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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useAuthCtx } from '@/contexts/auth';
import { Alert, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginPasswordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});
type LoginPasswordFormValues = z.infer<typeof loginPasswordSchema>;

export default function LoginPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthCtx();
  const {
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<LoginPasswordFormValues>({
    resolver: zodResolver(loginPasswordSchema),
    defaultValues: { password: '' },
    mode: 'onSubmit',
  });
  const password = watch('password');

  // Card entrance animation
  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 55, friction: 8 }).start();
  }, []);

  const inputBorderColor = (focused: boolean) =>
    focused ? colors.primary : colors.border;

  const gradientColors: [string, string] = isDark
    ? ['#020617', '#0d1b35']
    : ['#eef2ff', colors.canvas];

  const cardAnim_style = {
    opacity: cardAnim,
    transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [48, 0] }) }],
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background gradient */}
      <LinearGradient colors={gradientColors} className="absolute inset-0" />

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }}
        className="flex-grow px-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <Pressable
          className="h-10 w-10 rounded-xl items-center justify-center self-start mb-6"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}
          onPress={() => router.back()}
        >
          <Text className="text-[18px]" style={{ color: colors.foreground }}>←</Text>
        </Pressable>

        {/* Header */}
        <View className="items-center gap-2 py-2 mb-6">
          <View className="w-16 h-16 rounded-[20px] items-center justify-center mb-1"
            style={{ backgroundColor: colors.primary + '1e' }}>
            <MaterialIcons name="vpn-key" size={32} color={colors.primary} />
          </View>
          <Text className="text-[28px] font-extrabold tracking-[-0.4px] text-center"
            style={{ color: colors.foreground }}>
            Enter Password
          </Text>
          <Text className="text-[15px] text-center leading-[22px]"
            style={{ color: colors.fgSecondary }}>
            Sign in as <Text className="font-semibold" style={{ color: colors.foreground }}>{email}</Text>
          </Text>
        </View>

        {/* Card */}
        <Animated.View
          className="rounded-3xl border p-6 gap-5 mb-6"
          style={[
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              boxShadow: isDark
                ? '0 16px 48px rgba(0,0,0,0.55)'
                : '0 8px 40px rgba(26,86,219,0.1)',
            },
            cardAnim_style,
          ]}
        >
          <View className="gap-2">
            <Text className="text-[13px] font-semibold uppercase tracking-wider"
              style={{ color: colors.fgMuted }}>
              Password
            </Text>
            <View>
              <TextInput
                className="h-[52px] rounded-[14px] border-[1.5px] px-4 text-[15px] font-medium pr-[52px]"
                style={{
                  backgroundColor: colors.muted,
                  borderColor: inputBorderColor(passwordFocused),
                  color: colors.foreground,
                }}
                placeholder="Enter your password"
                placeholderTextColor={colors.fgMuted}
                value={password}
                onChangeText={(value) => setValue('password', value, { shouldValidate: false })}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={async () => {
                  setPasswordFocused(false);
                  await trigger('password');
                }}
                autoFocus
              />
              <Pressable
                className="absolute right-3.5 top-0 bottom-0 justify-center"
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
              >
                <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={22} color={colors.fgMuted} />
              </Pressable>
            </View>
            <Pressable className="self-end mt-1">
              <Text className="text-[13px] font-medium" style={{ color: colors.primary }}>
                Forgot password?
              </Text>
            </Pressable>
            {!!errors.password?.message && (
              <Text className="text-[13px] font-medium" style={{ color: colors.error }}>
                {errors.password.message}
              </Text>
            )}
          </View>

          {/* Sign in button */}
          <Pressable
            className="rounded-2xl overflow-hidden mt-1"
            style={({ pressed }) => (pressed || loading) ? { opacity: 0.88, transform: [{ scale: 0.975 }] } : {}}
            disabled={loading}
            onPress={async () => {
              const isValid = await trigger('password');
              if (!isValid) return;
              setLoading(true);
              try {
                await login(email, 'emailpass', password);
                // router.replace logic is handled by _layout.tsx guard
              } catch (err: any) {
                Alert.alert('Login Failed', err?.message || 'Check your credentials and try again.');
              } finally {
                setLoading(false);
              }
            }}
          >
            <LinearGradient
              colors={['#2563eb', colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-14 items-center justify-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-[16px] font-bold text-white tracking-[0.3px]">Sign In</Text>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
