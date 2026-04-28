import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, ImageBackground, Animated } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const BG_IMAGE = require('@/assets/onboarding-bg.png');

const FEATURES = [
  { icon: 'bolt' as const,      label: 'Lightning-fast checkout' },
  { icon: 'bar-chart' as const, label: 'Real-time analytics' },
  { icon: 'security' as const,  label: 'Bank-grade security' },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();

  const logoAnim  = useRef(new Animated.Value(0)).current;
  const textAnim  = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const btnAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(180, [
      Animated.spring(logoAnim,  { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.spring(textAnim,  { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.spring(badgeAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.spring(btnAnim,   { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
    ]).start();
  }, []);

  const slide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [32, 0] }) }],
  });

  return (
    <ImageBackground source={BG_IMAGE} className="flex-1 bg-[#020617]" resizeMode="cover">
      <LinearGradient
        colors={['rgba(2,6,23,0.35)', 'rgba(2,6,23,0.55)', 'rgba(2,6,23,0.92)']}
        className="absolute inset-0"
        locations={[0, 0.45, 1]}
      />

      <View
        className="flex-1 items-center px-6 gap-7"
        style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }}
      >
        {/* Logo badge */}
        <Animated.View className="items-center gap-2.5" style={slide(logoAnim)}>
          <View
            className="w-[72px] h-[72px] rounded-[22px] items-center justify-center"
            style={{ backgroundColor: 'rgba(59,130,246,0.18)', borderWidth: 1.5, borderColor: 'rgba(59,130,246,0.4)' }}
          >
            <MaterialIcons name="point-of-sale" size={32} color="#93c5fd" />
          </View>
          <Text
            className="text-[13px] font-semibold tracking-[1.2px] uppercase"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Payventory POS
          </Text>
        </Animated.View>

        <View className="flex-1" />

        {/* Hero copy */}
        <Animated.View className="w-full gap-3" style={slide(textAnim)}>
          <Text className="text-[44px] font-extrabold text-white leading-[52px] tracking-[-0.5px]">
            Sell smarter,{'\n'}close faster.
          </Text>
          <Text
            className="text-[16px] leading-6 font-normal"
            style={{ color: 'rgba(255,255,255,0.62)' }}
          >
            A modern point-of-sale built for teams that mean business.
          </Text>
        </Animated.View>

        {/* Feature badges */}
        <Animated.View className="flex-row flex-wrap gap-2 w-full" style={slide(badgeAnim)}>
          {FEATURES.map((f) => (
            <View
              key={f.label}
              className="flex-row items-center gap-1.5 rounded-full px-3 py-[7px]"
              style={{ backgroundColor: 'rgba(255,255,255,0.09)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <MaterialIcons name={f.icon} size={13} color="rgba(255,255,255,0.78)" />
              <Text className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.78)' }}>
                {f.label}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View className="w-full gap-3" style={slide(btnAnim)}>
          <Pressable
            className="h-14 rounded-2xl bg-primary items-center justify-center"
            style={({ pressed }) => [
              { boxShadow: '0 8px 32px rgba(26,86,219,0.45)' },
              pressed && { opacity: 0.88, transform: [{ scale: 0.975 }] },
            ]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text className="text-[16px] font-bold text-primary-fg tracking-[0.3px]">
              Let's Get Started
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}
