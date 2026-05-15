import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export function ProductSkeleton() {
  const { colors } = useTheme();

  return (
    <View className="mb-6 w-[47%]">
      <View
        className="mb-3 aspect-[4/5] rounded-[40px]"
        style={{
          backgroundColor: colors.muted,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
      <View
        className="h-4 w-3/4 rounded-full"
        style={{ backgroundColor: colors.muted }}
      />
      <View
        className="mt-2 h-3 w-1/2 rounded-full"
        style={{ backgroundColor: colors.muted }}
      />
    </View>
  );
}
