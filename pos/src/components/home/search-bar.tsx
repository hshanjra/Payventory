import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useRouter } from 'expo-router';

export function SearchBar() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View className="px-6 py-2">
      <View
        className="flex-row items-center gap-3 rounded-[28px] border px-5 py-4"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.surface,
        }}>
        <Pressable 
          className="flex-1 flex-row items-center gap-3"
          onPress={() => router.push('/search')}
        >
          <MaterialIcons name="search" size={22} color={colors.fgMuted} />
          <Text 
            className="flex-1 text-[16px] font-medium"
            style={{ color: colors.fgMuted }}
          >
            Search products...
          </Text>
        </Pressable>
        
        <View style={{ width: 1, height: 24, backgroundColor: colors.border }} />
        
        <Pressable 
          onPress={() => router.push('/scan')}
          hitSlop={10}
        >
          <MaterialIcons name="qr-code-scanner" size={22} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}
