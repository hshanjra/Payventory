import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { router } from 'expo-router';

export function EmptyCart() {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center gap-6 px-8">
      <Text
        className="text-[20px] font-black tracking-tight"
        style={{ color: colors.foreground }}>
        Cart is empty
      </Text>
      
      <View className="w-full gap-3">
        <Pressable
          onPress={() => router.push('/scan')}
          className="h-16 w-full flex-row items-center justify-center gap-3 rounded-2xl"
          style={{ backgroundColor: colors.primary }}>
          <MaterialIcons name="qr-code-scanner" size={24} color={colors.primaryFg} />
          <Text className="text-[17px] font-black" style={{ color: colors.primaryFg }}>
            Barcode Scan
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/search')}
          className="h-16 w-full flex-row items-center justify-center gap-3 rounded-2xl border-2"
          style={{ borderColor: colors.primary }}>
          <MaterialIcons name="search" size={24} color={colors.primary} />
          <Text className="text-[17px] font-black" style={{ color: colors.primary }}>
            Search Product
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
