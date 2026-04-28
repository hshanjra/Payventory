import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';

export function SearchBar() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View
      style={{ backgroundColor: colors.surface }}
      className="flex-row items-center gap-3 px-4 py-3">
      <Pressable
        onPress={() => router.push('/search')}
        style={{ backgroundColor: colors.canvas, borderColor: colors.border }}
        className="h-[52px] flex-1 flex-row items-center rounded-2xl border px-4">
        <MaterialIcons name="search" size={22} color={colors.icon} />
        <Text style={{ color: colors.fgMuted }} className="ml-3 flex-1 text-[15px] font-medium">
          Search products, orders…
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/scan')}
        style={{ backgroundColor: colors.primary }}
        className="h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl">
        <MaterialIcons name="qr-code-scanner" size={22} color={colors.primaryFg} />
      </Pressable>
    </View>
  );
}
