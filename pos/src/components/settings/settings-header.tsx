import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';

interface SettingsHeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export const SettingsHeader = ({ title, showBack = true, rightElement }: SettingsHeaderProps) => {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View className="px-6 pb-6 pt-4">
      <View className="flex-row items-center justify-between">
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.surface }}
          >
            <MaterialIcons name="arrow-back-ios-new" size={20} color={colors.foreground} />
          </Pressable>
        ) : (
          <View className="h-12 w-12" />
        )}
        <Text style={{ color: colors.primary }} className="text-2xl font-black tracking-tight">
          {title}
        </Text>
        {rightElement ? (
          <View className="h-12 w-12 items-center justify-center">
            {rightElement}
          </View>
        ) : (
          <View className="h-12 w-12" />
        )}
      </View>
    </View>
  );
};
