import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { formatCurrency } from '@/lib/utils';
import type { AdminProduct, AdminProductVariant } from '@medusajs/types';

interface ProductInfoProps {
  product: AdminProduct;
  selectedVariant?: AdminProductVariant | null;
}

export function ProductInfo({ product, selectedVariant }: ProductInfoProps) {
  const { colors } = useTheme();

  const price = selectedVariant?.prices?.[0];
  
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 10, gap: 12 }}>
      {/* Title + price row */}
      <View className="flex-row items-start justify-between gap-4">
        <Text
          className="flex-1 text-[24px] font-black tracking-tight"
          style={{ color: colors.foreground }}>
          {product.title}
        </Text>
        {price != null && (
          <View className="items-end">
            <Text className="text-[22px] font-black" style={{ color: colors.primary }}>
              {formatCurrency(Number(price?.amount), price?.currency_code ?? 'INR')}
            </Text>
            <Text style={{ color: colors.fgMuted }} className="text-[11px] font-bold uppercase">
              Per Unit
            </Text>
          </View>
        )}
      </View>

      {product.description ? (
        <View className="rounded-2xl p-4" style={{ backgroundColor: colors.surfaceEl }}>
          <Text className="text-[14px] font-medium leading-[22px]" style={{ color: colors.fgSecondary }}>
            {product.description}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
