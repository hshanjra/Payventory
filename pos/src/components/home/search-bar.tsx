import React from 'react';
import { View, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

export function SearchBar() {
  const { colors } = useTheme();

  return (
    <View className="px-6 py-2">
      <View
        className="flex-row items-center gap-3 rounded-[24px] border px-5 py-3"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.surface,
        }}>
        <MaterialIcons name="search" size={22} color={colors.fgMuted} />
        <TextInput
          placeholder="Search products..."
          placeholderTextColor={colors.fgMuted}
          className="flex-1 text-[16px] font-medium"
          style={{ color: colors.foreground }}
        />
      </View>
    </View>
  );
}
