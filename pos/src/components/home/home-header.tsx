import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';

interface HomeHeaderProps {
  storeName?: string;
  storeAddress?: string;
}

export function HomeHeader({ storeName, storeAddress }: HomeHeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center justify-between px-6 pb-1 pt-4">
      <Pressable onPress={() => router.push('/store-select')} className="flex-1">
        <View className="flex-row items-center gap-1">
          <Text
            style={{ color: colors.primary }}
            className="text-[26px] font-black leading-[36px] tracking-tighter"
            numberOfLines={1}>
            {storeName || 'Select Store'}
          </Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={24}
            color={colors.foreground}
            style={{ marginTop: 4 }}
          />
        </View>
        <Text
          style={{ color: colors.fgSecondary }}
          className="mt-[-2px] text-[13px] font-bold uppercase tracking-[1px]"
          numberOfLines={1}>
          {storeAddress || 'Set store location'}
        </Text>
      </Pressable>

      <Pressable
        className="h-12 w-12 items-center justify-center rounded-2xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
        <MaterialIcons name="notifications-none" size={26} color={colors.foreground} />
        <View
          className="absolute right-3.5 top-3.5 h-2 w-2 rounded-full"
          style={{ backgroundColor: colors.error }}
        />
      </Pressable>
    </View>
  );
}
