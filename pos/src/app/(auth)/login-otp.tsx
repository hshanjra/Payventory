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

export default function LoginOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const { validateOtp } = useAuthCtx();

  // Card entrance animation
  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 55, friction: 8 }).start();
  }, []);

  const handleOtpChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val.replace(/[^0-9]/g, '').slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  
  const handleOtpKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const gradientColors: [string, string] = isDark
    ? ['#020617', '#0d1b35']
    : ['#eef2ff', colors.canvas];

  const cardAnim_style = {
    opacity: cardAnim,
    transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [48, 0] }) }],
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
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
            <MaterialIcons name="smartphone" size={32} color={colors.primary} />
          </View>
          <Text className="text-[28px] font-extrabold tracking-[-0.4px] text-center"
            style={{ color: colors.foreground }}>
            Enter OTP
          </Text>
          <Text className="text-[15px] text-center leading-[22px]"
            style={{ color: colors.fgSecondary }}>
            We've sent a 6-digit code to{'\n'}
            <Text className="font-semibold" style={{ color: colors.foreground }}>{email}</Text>
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
          <View className="gap-3">
            <Text className="text-[14px] leading-5 text-center mb-2" style={{ color: colors.fgSecondary }}>
              Enter your code below
            </Text>
            <View className="flex-row gap-2.5 justify-center">
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(r) => { otpRefs.current[i] = r; }}
                  className="w-11 h-14 rounded-[12px] border-[1.5px] text-[22px] font-bold text-center"
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
            <Pressable className="self-center mt-3">
              <Text className="text-[13px] font-medium" style={{ color: colors.primary }}>
                Resend code
              </Text>
            </Pressable>
            
            {/* Sign in button */}
            <Pressable
              className="rounded-2xl overflow-hidden mt-3"
              style={({ pressed }) => (pressed || loading) ? { opacity: 0.88, transform: [{ scale: 0.975 }] } : {}}
              disabled={loading}
              onPress={async () => {
                const otpString = otp.join('');
                if (otpString.length < 6) return;
                setLoading(true);
                try {
                  await validateOtp(email, otpString);
                } catch (err: any) {
                  Alert.alert('Validation Failed', err?.message || 'Check your code and try again.');
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
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
