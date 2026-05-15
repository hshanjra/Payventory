import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface InventoryStatusProps {
  availableQuantity: number;
  isLoading?: boolean;
}

export const InventoryStatus = ({ availableQuantity, isLoading }: InventoryStatusProps) => {
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View className="flex-row items-center gap-2">
        <View className="h-4 w-24 overflow-hidden rounded-full bg-muted/20">
          <View className="h-full w-1/2 bg-muted/40" />
        </View>
      </View>
    );
  }

  const isOutOfStock = availableQuantity <= 0;

  return (
    <View className="flex-row items-center gap-2">
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: isOutOfStock ? colors.error : colors.success,
        }}
      />
      <Text
        style={{
          fontSize: 14,
          fontWeight: '800',
          color: isOutOfStock ? colors.error : colors.success,
          letterSpacing: 0.5,
        }}>
        {isOutOfStock ? 'OUT OF STOCK' : `${availableQuantity} UNITS IN STOCK`}
      </Text>
    </View>
  );
};
