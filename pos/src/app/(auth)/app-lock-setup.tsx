import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Animated, Vibration } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { cn } from '@/lib/utils';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthCtx } from '@/contexts/auth';

type LockMethod = 'pin' | 'biometric';

const PIN_LENGTH = 4;
const NUMPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

export default function AppLockSetupScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { setupAppLock } = useAuthCtx();

  const [method, setMethod] = useState<LockMethod>('pin');
  const [step, setStep] = useState<'choose' | 'set' | 'confirm'>('choose');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
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

  // Shake on error
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shake = () => {
    Vibration.vibrate(80);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleNumpad = (key: string) => {
    if (key === '') return;
    if (key === '⌫') {
      if (step === 'set') setPin((p) => p.slice(0, -1));
      if (step === 'confirm') setConfirmPin((p) => p.slice(0, -1));
      setError('');
      return;
    }
    if (step === 'set') {
      const next = pin + key;
      setPin(next);
      if (next.length === PIN_LENGTH) setTimeout(() => setStep('confirm'), 300);
    } else if (step === 'confirm') {
      const next = confirmPin + key;
      setConfirmPin(next);
      if (next.length === PIN_LENGTH) {
        if (next === pin) {
          setupAppLock('pin', next).then(() => {
            setTimeout(() => setSuccess(true), 250);
          });
        } else {
          shake();
          setTimeout(() => {
            setStep('set');
            setPin('');
            setConfirmPin('');
            setError("PINs don't match. Try again.");
          }, 200);
        }
      }
    }
  };

  const gradientColors: [string, string] = isDark
    ? ['#020617', '#0d1b35']
    : ['#eef2ff', colors.canvas];

  const currentPin = step === 'confirm' ? confirmPin : pin;

  const cardEntrance = {
    opacity: cardAnim,
    transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
  };

  // ── Success state ───────────────────────────────────────────────────
  if (success) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.canvas }}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={gradientColors} className="absolute inset-0" />
        <View className="flex-1 items-center justify-center gap-5 px-8">
          <Animated.View style={{ transform: [{ scale: cardAnim }] }}>
            <View
              className="h-24 w-24 items-center justify-center rounded-[28px]"
              style={{ backgroundColor: colors.primary + '1e' }}>
              <MaterialIcons name="check-circle" size={48} color={colors.primary} />
            </View>
          </Animated.View>
          <Text
            className="text-center text-[32px] font-extrabold tracking-[-0.5px]"
            style={{ color: colors.foreground }}>
            You're all set!
          </Text>
          <Text className="text-center text-[16px] leading-6" style={{ color: colors.fgSecondary }}>
            Your app PIN has been configured. You're ready to start selling.
          </Text>
          <Pressable
            className="w-full overflow-hidden rounded-2xl"
            style={({ pressed }) => (pressed ? { opacity: 0.88 } : {})}
            onPress={() => router.replace('/(tabs)')}>
            <LinearGradient
              colors={['#2563eb', colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-14 items-center justify-center">
              <Text className="text-[16px] font-bold tracking-[0.3px] text-white">Continue →</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Main flow ───────────────────────────────────────────────────────
  return (
    <View className="flex-1" style={{ backgroundColor: colors.canvas }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={gradientColors} className="absolute inset-0" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          flexGrow: 1,
        }}
        className="flex-grow px-5"
        showsVerticalScrollIndicator={false}>
        {/* Page header */}
        <View className="mb-7 items-center gap-2 py-2">
          <View
            className="mb-1 h-16 w-16 items-center justify-center rounded-[20px]"
            style={{ backgroundColor: colors.primary + '1e' }}>
            <MaterialIcons name="lock-outline" size={32} color={colors.primary} />
          </View>
          <Text
            className="text-center text-[28px] font-extrabold tracking-[-0.4px]"
            style={{ color: colors.foreground }}>
            Secure your app
          </Text>
          <Text
            className="text-center text-[15px] leading-[22px]"
            style={{ color: colors.fgSecondary }}>
            Set up a lock screen to keep your data safe
          </Text>
        </View>

        {/* ── Step: choose method ── */}
        {step === 'choose' && (
          <Animated.View
            className="gap-4 rounded-3xl border p-6"
            style={[
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                boxShadow: isDark
                  ? '0 16px 48px rgba(0,0,0,0.55)'
                  : '0 8px 40px rgba(26,86,219,0.1)',
              },
              cardEntrance,
            ]}>
            <Text
              className="text-[13px] font-semibold uppercase tracking-wider"
              style={{ color: colors.fgMuted }}>
              Choose lock method
            </Text>

            {/* PIN option */}
            <Pressable
              className="flex-row items-center justify-between gap-3 rounded-2xl border-[1.5px] p-4"
              style={{
                backgroundColor: method === 'pin' ? colors.primary + '1a' : colors.muted,
                borderColor: method === 'pin' ? colors.primary : colors.border,
              }}
              onPress={() => setMethod('pin')}>
              <View className="flex-1 flex-row items-center gap-3.5">
                <View
                  className="h-12 w-12 items-center justify-center rounded-[14px]"
                  style={{ backgroundColor: colors.primary + '26' }}>
                  <MaterialIcons name="dialpad" size={24} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text
                    className="mb-0.5 text-[15px] font-bold"
                    style={{ color: colors.foreground }}>
                    PIN Code
                  </Text>
                  <Text className="text-[13px]" style={{ color: colors.fgSecondary }}>
                    6-digit numeric PIN
                  </Text>
                </View>
              </View>
              <View
                className="h-[22px] w-[22px] items-center justify-center rounded-full border-2"
                style={{ borderColor: method === 'pin' ? colors.primary : colors.fgMuted }}>
                {method === 'pin' && (
                  <View
                    className="h-[11px] w-[11px] rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                )}
              </View>
            </Pressable>

            {/* Biometric option */}
            <Pressable
              className="flex-row items-center justify-between gap-3 rounded-2xl border-[1.5px] p-4"
              style={{
                backgroundColor: method === 'biometric' ? colors.primary + '1a' : colors.muted,
                borderColor: method === 'biometric' ? colors.primary : colors.border,
              }}
              onPress={() => setMethod('biometric')}>
              <View className="flex-1 flex-row items-center gap-3.5">
                <View
                  className="h-12 w-12 items-center justify-center rounded-[14px]"
                  style={{ backgroundColor: colors.success + '26' }}>
                  <MaterialIcons name="fingerprint" size={26} color={colors.success} />
                </View>
                <View className="flex-1">
                  <Text
                    className="mb-0.5 text-[15px] font-bold"
                    style={{ color: colors.foreground }}>
                    Phone Password / Biometric
                  </Text>
                  <Text className="text-[13px]" style={{ color: colors.fgSecondary }}>
                    Face ID, fingerprint, or device PIN
                  </Text>
                </View>
              </View>
              <View
                className="h-[22px] w-[22px] items-center justify-center rounded-full border-2"
                style={{ borderColor: method === 'biometric' ? colors.primary : colors.fgMuted }}>
                {method === 'biometric' && (
                  <View
                    className="h-[11px] w-[11px] rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                )}
              </View>
            </Pressable>

            {/* Continue button */}
            <Pressable
              className="mt-1 overflow-hidden rounded-2xl"
              style={({ pressed }) => (pressed ? { opacity: 0.88 } : {})}
              onPress={async () => {
                setError('');
                if (method === 'pin') {
                  setStep('set');
                } else {
                  // Attempt authentication (will use Biometric if available, otherwise fallback to device PIN)
                  const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Authenticate to secure your app',
                    fallbackLabel: 'Use Device Passcode',
                  });

                  if (result.success) {
                    await setupAppLock('biometric');
                    setSuccess(true);
                  } else if (
                    result.error === 'not_enrolled' ||
                    result.error === 'passcode_not_set'
                  ) {
                    setError('No device lock (PIN/Biometric) is configured on this device.');
                  }
                }
              }}>
              <LinearGradient
                colors={['#2563eb', colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-14 items-center justify-center">
                <Text className="text-[16px] font-bold tracking-[0.3px] text-white">
                  Continue →
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => router.replace('/(tabs)')} className="self-center py-1">
              <Text className="text-[14px]" style={{ color: colors.fgMuted }}>
                Skip for now
              </Text>
            </Pressable>

            {!!error && (
              <Text className="text-center text-[14px] font-medium" style={{ color: colors.error }}>
                {error}
              </Text>
            )}
          </Animated.View>
        )}

        {/* ── Step: set / confirm PIN ── */}
        {(step === 'set' || step === 'confirm') && (
          <View className="gap-8">
            {/* Instruction */}
            <View className="items-center gap-1.5">
              <Text
                className="text-center text-[24px] font-extrabold tracking-[-0.3px]"
                style={{ color: colors.foreground }}>
                {step === 'set' ? 'Create your PIN' : 'Confirm your PIN'}
              </Text>
              <Text
                className="text-center text-[15px] leading-[22px]"
                style={{ color: colors.fgSecondary }}>
                {step === 'set'
                  ? `Enter a 6-digit PIN you'll remember`
                  : 'Re-enter the PIN to confirm'}
              </Text>
            </View>

            {/* PIN dots */}
            <Animated.View
              className="flex-row justify-center gap-3.5"
              style={{ transform: [{ translateX: shakeAnim }] }}>
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <View
                  key={i}
                  className="h-[18px] w-[18px] rounded-full border-2"
                  style={{
                    backgroundColor: i < currentPin.length ? colors.primary : colors.muted,
                    borderColor: i < currentPin.length ? colors.primary : colors.borderStrong,
                    transform: [{ scale: i < currentPin.length ? 1.15 : 1 }],
                  }}
                />
              ))}
            </Animated.View>

            {/* Error message */}
            {!!error && (
              <Text className="text-center text-[14px] font-medium" style={{ color: colors.error }}>
                {error}
              </Text>
            )}

            {/* Numpad */}
            <View
              className={cn('mt-auto w-full overflow-hidden rounded-[24px] border')}
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              {NUMPAD_ROWS.map((row, rowIndex) => (
                <View
                  key={rowIndex}
                  className="h-[76px] w-full flex-row"
                  style={{
                    borderBottomWidth: rowIndex === 3 ? 0 : 1,
                    borderColor: colors.border,
                  }}>
                  {row.map((key, colIndex) => (
                    <Pressable
                      key={colIndex}
                      className="flex-1 items-center justify-center"
                      style={({ pressed }) => ({
                        backgroundColor: pressed && key ? colors.muted : 'transparent',
                        borderRightWidth: colIndex === 2 ? 0 : 1,
                        borderColor: colors.border,
                      })}
                      onPress={() => handleNumpad(key)}
                      disabled={key === ''}>
                      {key === '⌫' ? (
                        <MaterialIcons name="backspace" size={26} color={colors.primary} />
                      ) : (
                        <Text
                          className="text-[28px] font-medium"
                          style={{ color: colors.foreground }}>
                          {key}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>

            {/* Back link */}
            <Pressable
              onPress={() => {
                setStep('choose');
                setPin('');
                setConfirmPin('');
                setError('');
              }}
              className="self-center">
              <Text className="text-[14px]" style={{ color: colors.fgMuted }}>
                ← Change method
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
