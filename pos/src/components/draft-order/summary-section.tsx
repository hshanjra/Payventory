import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { formatCurrency } from '@/lib/utils';

interface SummarySectionProps {
  discount: string;
  setDiscount: (val: string) => void;
  onApplyDiscount?: () => void;
  subtotal: number;
  total: number;
  currencyCode: string;
}

export function SummarySection({
  discount,
  setDiscount,
  onApplyDiscount,
  subtotal,
  total,
  currencyCode,
}: SummarySectionProps) {
  const { colors } = useTheme();

  return (
    <View
      className="rounded-3xl border p-5 gap-5"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
      
      {/* Discount Input */}
      <View className="flex-row items-center gap-2">
        <View 
          className="flex-1 h-14 flex-row items-center rounded-2xl px-4 border" 
          style={{ backgroundColor: colors.canvas, borderColor: colors.border }}>
          <MaterialIcons name="local-offer" size={20} color={colors.fgMuted} />
          <TextInput
            placeholder="Discount (%)"
            placeholderTextColor={colors.fgMuted}
            keyboardType="number-pad"
            value={discount}
            onChangeText={setDiscount}
            className="flex-1 ml-3 text-[15px] font-bold"
            style={{ color: colors.foreground }}
            maxLength={3}
          />
          <Text className="text-[15px] font-black mr-2" style={{ color: colors.fgMuted }}>
            %
          </Text>
        </View>
        <Pressable
          onPress={onApplyDiscount}
          className="h-14 px-6 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.primary }}>
          <Text className="text-[15px] font-black" style={{ color: colors.primaryFg }}>
            Apply
          </Text>
        </Pressable>
      </View>

      <View style={{ height: 1, backgroundColor: colors.border }} />

      {/* Totals info */}
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-[15px] font-medium" style={{ color: colors.fgSecondary }}>
            Subtotal
          </Text>
          <Text className="text-[15px] font-bold" style={{ color: colors.foreground }}>
            {formatCurrency(subtotal, currencyCode)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-[15px] font-medium" style={{ color: colors.fgSecondary }}>
            Tax
          </Text>
          <Text className="text-[15px] font-bold" style={{ color: colors.foreground }}>
            Included
          </Text>
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          <Text
            className="text-[18px] font-black tracking-tight"
            style={{ color: colors.foreground }}>
            TOTAL DUE
          </Text>
          <Text
            className="text-[24px] font-black tracking-tight"
            style={{ color: colors.primary }}>
            {formatCurrency(total, currencyCode)}
          </Text>
        </View>
      </View>
    </View>
  );
}
