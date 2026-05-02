import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, Vibration } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@/theme/useTheme';
import { cn } from '@/lib/utils';
import { useAuthCtx } from '@/contexts/auth';
import * as SecureStore from 'expo-secure-store';

const PIN_LENGTH = 4;
const pinFormSchema = z.object({
  pin: z
    .string()
    .regex(/^\d+$/, 'PIN must contain only digits')
    .length(PIN_LENGTH, `PIN must be ${PIN_LENGTH} digits`),
});
type PinFormValues = z.infer<typeof pinFormSchema>;
const NUMPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

export default function AppLockScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { unlockApp, logout } = useAuthCtx();

  const [error, setError] = useState('');
  const [method, setMethod] = useState<string | null>(null);
  const [methodResolved, setMethodResolved] = useState(false);
  const { setValue, getValues, reset } = useForm<PinFormValues>({
    resolver: zodResolver(pinFormSchema),
    defaultValues: { pin: '' },
  });

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkMethod = async () => {
      const storedMethod = await SecureStore.getItemAsync('appLockMethod');
      if (storedMethod === 'biometric' || storedMethod === 'pin') {
        setMethod(storedMethod);
      } else {
        // Fallback to PIN when lock method is missing or invalid.
        setMethod('pin');
      }
      setMethodResolved(true);
      if (storedMethod === 'biometric') {
        handleBiometric();
      }
    };
    checkMethod();
  }, []);

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

  const handleNumpad = async (key: string) => {
    if (key === '') return;
    const currentPin = getValues('pin');

    if (key === '⌫') {
      setValue('pin', currentPin.slice(0, -1), { shouldValidate: false });
      setError('');
      return;
    }

    const next = `${currentPin}${key}`.slice(0, PIN_LENGTH);
    setValue('pin', next, { shouldValidate: false });
    setError('');

    if (next.length === PIN_LENGTH) {
      const parsedPin = pinFormSchema.safeParse({ pin: next });
      if (!parsedPin.success) {
        shake();
        reset({ pin: '' });
        setError(parsedPin.error.issues[0]?.message ?? 'Invalid PIN.');
        return;
      }

      const success = await unlockApp(next);
      if (!success) {
        shake();
        reset({ pin: '' });
        setError('Incorrect PIN. Please try again.');
      }
    }
  };

  const handleBiometric = async () => {
    const success = await unlockApp();
    if (!success) {
      setError('Biometric authentication failed.');
    }
  };

  const gradientColors: [string, string] = isDark
    ? ['#020617', '#0d1b35']
    : ['#eef2ff', colors.canvas];
  const isBiometric = method === 'biometric';
  const isPin = method === 'pin';
  const pin = getValues('pin');

  return (
    <View className="flex-1" style={{ backgroundColor: colors.canvas }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={gradientColors} className="absolute inset-0" />

      <View
        style={{
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 24,
          flex: 1,
        }}
        className="px-5">
        
        <View className="mb-12 items-center gap-4">
          <View
            className="h-20 w-20 items-center justify-center rounded-[24px]"
            style={{ backgroundColor: colors.primary + '1e' }}>
            <MaterialIcons name="lock" size={40} color={colors.primary} />
          </View>
          <View className="items-center gap-1">
            <Text
              className="text-center text-[28px] font-extrabold tracking-[-0.5px]"
              style={{ color: colors.foreground }}>
              App Locked
            </Text>
            <Text className="text-center text-[15px]" style={{ color: colors.fgSecondary }}>
              {isBiometric ? 'Use local authentication to continue' : 'Enter your PIN to continue'}
            </Text>
          </View>
        </View>

        {methodResolved && isPin && (
          <Animated.View
            className="mb-8 flex-row justify-center gap-4"
            style={{ transform: [{ translateX: shakeAnim }] }}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                className="h-[20px] w-[20px] rounded-full border-2"
                style={{
                  backgroundColor: i < pin.length ? colors.primary : colors.muted,
                  borderColor: i < pin.length ? colors.primary : colors.borderStrong,
                  transform: [{ scale: i < pin.length ? 1.15 : 1 }],
                }}
              />
            ))}
          </Animated.View>
        )}

        {!!error && (
          <Text className="mb-8 text-center text-[14px] font-medium" style={{ color: colors.error }}>
            {error}
          </Text>
        )}

        {methodResolved && isBiometric && (
          <Pressable
            onPress={handleBiometric}
            className="mb-8 h-14 w-14 self-center items-center justify-center rounded-full"
            style={{ backgroundColor: colors.muted }}>
            <MaterialIcons name="fingerprint" size={32} color={colors.primary} />
          </Pressable>
        )}

        {methodResolved && isPin && (
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
        )}

        <Pressable
          onPress={() => logout()}
          className="mt-8 self-center">
          <Text className="text-[14px] font-semibold" style={{ color: colors.error }}>
            Log out of account
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
