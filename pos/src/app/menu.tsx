import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useAuthCtx } from '@/contexts/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Prompt } from '@/components/ui/prompt';

export default function MenuScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { logout, state } = useAuthCtx();
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  const menuItems = [
    { label: 'Orders', icon: 'receipt-long', route: '/orders' },
    { label: 'Customers', icon: 'people-alt', route: '/customers' },
    { label: 'Reports', icon: 'bar-chart', route: '/reports' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  const handleNavigate = (route: string) => {
    // Using replace instead of push to avoid the "menu close -> home -> settings" sequence.
    // This makes it feel like a direct transition from the menu's state to the new screen.
    router.replace(route as any);
  };

  return (
    <View style={styles.container}>
      {/* Logout Confirmation Prompt */}
      <Prompt
        visible={showLogoutPrompt}
        title="Sign Out?"
        submitText="Sign Out"
        cancelText="Cancel"
        description="Are you sure you want to sign out of your account? You will need to log in again to access the POS."
        onSubmit={() => {
          setShowLogoutPrompt(false);
          router.back();
          logout();
        }}
        onClose={() => setShowLogoutPrompt(false)}
      />

      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={StyleSheet.absoluteFill}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => router.back()}
        />
      </Animated.View>

      {/* Floating Menu Content */}
      <Animated.View
        entering={SlideInLeft.duration(300)}
        exiting={SlideOutLeft.duration(250)}
        style={[
          styles.menuContent,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOpacity: isDark ? 0.5 : 0.15,
          },
        ]}>
        <SafeAreaView edges={['top', 'bottom']} className="flex-1">
          <View className="flex-1 px-6 py-6">
            {/* Header */}
            <View className="mb-8 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View
                  className="h-12 w-12 items-center justify-center overflow-hidden rounded-2xl"
                  style={{ backgroundColor: colors.primary + '10' }}>
                  <Image
                    source={require('@/assets/icon.png')}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="contain"
                  />
                </View>
                <View>
                  <Text
                    style={{ color: colors.primary }}
                    className="text-lg font-black tracking-tight">
                    POS
                  </Text>
                  <Text
                    style={{ color: colors.fgSecondary }}
                    className="text-[9px] font-black uppercase tracking-widest">
                    Enterprise
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.back()}
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.muted }}>
                <MaterialIcons name="close" size={18} color={colors.foreground} />
              </Pressable>
            </View>

            {/* User Profile Card - Restored to Top */}
            <View
              className="mb-6 items-center rounded-[28px] p-6"
              style={{
                backgroundColor: colors.canvas,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
              <Text
                style={{ color: colors.primary }}
                className="text-[17px] font-black"
                numberOfLines={1}>
                {state.status === 'authenticated' ? state.user.name : 'Guest User'}
              </Text>
              <Text
                style={{ color: colors.fgSecondary }}
                className="mt-1 text-[14px] font-medium"
                numberOfLines={1}>
                {state.status === 'authenticated' ? state.user.email : 'Login to access features'}
              </Text>
            </View>

            {/* Reachability Spacer: Pushes navigation items to the bottom */}
            <View className="flex-1" />

            {/* Navigation Items - Anchored at Bottom */}
            <View className="mb-6 flex-none">
              <View className="gap-4">
                {menuItems.map((item) => {
                  const isActive = pathname === item.route;
                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => handleNavigate(item.route)}
                      style={({ pressed }) => [
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 18,
                          paddingHorizontal: 20,
                          borderRadius: 22,
                          backgroundColor: isActive ? colors.primary + '10' : 'transparent',
                        },
                        pressed && { opacity: 0.7 },
                      ]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons
                          name={item.icon as any}
                          size={26}
                          color={isActive ? colors.primary : colors.fgSecondary}
                        />
                        <Text
                          style={{
                            color: isActive ? colors.primary : colors.foreground,
                            fontWeight: isActive ? '900' : '700',
                          }}
                          className="ml-4 text-[17px] tracking-wider">
                          {item.label}
                        </Text>
                        {isActive && (
                          <View
                            className="ml-4 h-2 w-2 rounded-full"
                            style={{ backgroundColor: colors.primary }}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Footer */}
            <View className="pt-6">
              <Pressable
                onPress={() => setShowLogoutPrompt(true)}
                className="h-14 flex-row items-center justify-center rounded-2xl border"
                style={{
                  backgroundColor: colors.errorBg + '15',
                  borderColor: colors.error + '30',
                }}>
                <MaterialIcons name="logout" size={20} color={colors.error} />
                <Text
                  style={{ color: colors.error }}
                  className="ml-2.5 text-[15px] font-black uppercase tracking-widest">
                  SIGN OUT
                </Text>
              </Pressable>
              <Text
                style={{ color: colors.primary }}
                className="mt-6 text-center text-[9px] font-black uppercase tracking-[3px]">
                DIVYA JYOTI FOUNDATION
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  menuContent: {
    width: '75%',
    height: '100%',
    borderRightWidth: 1,
    shadowOffset: { width: 4, height: 0 },
    shadowRadius: 20,
    elevation: 24,
  },
});
