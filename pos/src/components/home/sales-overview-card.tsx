import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { formatCurrency } from '@/lib/utils';

interface SalesOverviewCardProps {
  totalSalesToday: number;
  ordersCount: number;
}

export function SalesOverviewCard({ totalSalesToday, ordersCount }: SalesOverviewCardProps) {
  const { colors } = useTheme();

  return (
    <View className="px-6 pb-6 pt-2">
      <View
        className="flex-row items-center justify-between rounded-[32px] p-7"
        style={{ backgroundColor: colors.primary }}>
        <View>
          <Text
            style={{ color: colors.primaryFg }}
            className="text-[12px] font-black uppercase tracking-widest opacity-80">
            Today's Sales
          </Text>
          <Text
            style={{ color: colors.primaryFg }}
            className="mt-1 text-[32px] font-black tracking-tighter">
            {formatCurrency(totalSalesToday)}
          </Text>
        </View>
        <View className="items-end">
          <View className="flex-row items-center gap-1 rounded-full bg-white/20 px-3 py-1.5">
            <MaterialIcons name="trending-up" size={14} color={colors.primaryFg} />
            <Text style={{ color: colors.primaryFg }} className="text-[12px] font-black">
              {ordersCount} Orders
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
