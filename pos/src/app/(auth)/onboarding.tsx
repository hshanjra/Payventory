import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, ImageBackground, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useTheme } from '@/theme/useTheme';

const BG_IMAGE = require('@/assets/onboarding-bg.png');

const FEATURES = [
  { icon: 'bolt' as const, label: 'Lightning-fast checkout' },
  { icon: 'bar-chart' as const, label: 'Real-time analytics' },
  { icon: 'security' as const, label: 'Bank-grade security' },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView
      edges={['all']}
      className="flex-1 bg-surface"
      style={{ backgroundColor: colors.surface }}>
      <View className="flex-1 justify-center px-8">
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="gap-8">
          {/* Brand Icon */}
          <View
            className="h-20 w-20 items-center justify-center rounded-[24px]"
            style={{ backgroundColor: colors.primary }}>
            <MaterialIcons name="point-of-sale" size={40} color={colors.primaryFg} />
          </View>

          {/* Value Prop */}
          <View className="gap-3">
            <Text
              style={{ color: colors.primary }}
              className="text-[48px] font-black leading-[56px] tracking-tight">
              SIMPLY{'\n'}SMARTER{'\n'}POS.
            </Text>
            <Text
              style={{ color: colors.fgSecondary }}
              className="text-[18px] font-medium leading-7">
              A professional point-of-sale experience built for modern enterprises.
            </Text>
          </View>

          {/* Features */}
          <View className="gap-4">
            {[
              { icon: 'security', label: 'Financial Grade Security' },
              { icon: 'speed', label: 'Lightning Fast Checkout' },
              { icon: 'analytics', label: 'Real-time Analytics' },
            ].map((f) => (
              <View key={f.label} className="flex-row items-center gap-3">
                <MaterialIcons name={f.icon as any} size={20} color={colors.primary} />
                <Text
                  style={{ color: colors.foreground }}
                  className="text-[15px] font-bold uppercase tracking-widest">
                  {f.label}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>

      {/* CTA Section */}
      <View className="px-8 pb-12">
        <Pressable
          className="h-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.primary }}
          onPress={() => router.push('/(auth)/login')}>
          <Text
            style={{ color: colors.primaryFg }}
            className="text-[16px] font-black uppercase tracking-widest">
            GET STARTED
          </Text>
        </Pressable>
        <Text
          style={{ color: colors.primary }}
          className="mt-6 text-center text-[10px] font-bold uppercase tracking-[3px]">
          DIVYA JYOTI FOUNDATION
        </Text>
      </View>
    </SafeAreaView>
  );
}
