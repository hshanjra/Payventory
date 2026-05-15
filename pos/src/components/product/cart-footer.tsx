import React, { useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { QuantityStepper } from '@/components/product/quantity-stepper';
import { formatCurrency } from '@/lib/utils';
import type { AdminProductVariant } from '@medusajs/types';

export interface CartFooterProps {
  cartItem?: { id: string; quantity: number } | null;
  currencyCode?: string;
  onAddToCart: () => void;
  onIncrement: (itemId: string, qty: number) => void;
  onDecrement: (itemId: string, qty: number) => void;
  isAddPending: boolean;
  isUpdatePending: boolean;
  isOutOfStock: boolean;
  selectedVariant: AdminProductVariant | null;
}

export function CartFooter({
  cartItem,
  currencyCode,
  onAddToCart,
  onIncrement,
  onDecrement,
  isAddPending,
  isUpdatePending,
  isOutOfStock,
  selectedVariant,
}: CartFooterProps) {
  const { colors, isDark } = useTheme();

  const isInCart = !!cartItem;

  const price = useMemo(() => {
    if (!selectedVariant) return null;
    const prices = (selectedVariant as any)?.prices ?? [];
    const match = currencyCode
      ? prices.find((p: any) => p.currency_code?.toLowerCase() === currencyCode.toLowerCase())
      : prices[0];
    return match ? match.amount : null;
  }, [selectedVariant, currencyCode]);

  const priceLabel = price != null ? formatCurrency(price, currencyCode ?? 'INR') : null;

  const buttonDisabled = !selectedVariant || isAddPending || isOutOfStock;

  const buttonLabel = !selectedVariant
    ? 'Select a variant'
    : isOutOfStock
      ? 'OUT OF STOCK'
      : `ADD TO CART${priceLabel ? `  ·  ${priceLabel}` : ''}`;

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}>
      {isInCart && cartItem ? (
        <View style={{ gap: 16 }}>
          <View className="flex-row items-center justify-between">
            <Text
              className="text-[12px] font-black uppercase tracking-widest"
              style={{ color: colors.mutedFg }}>
              ITEM IN CART
            </Text>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: colors.primary + '15',
              }}>
              <Text className="text-[14px] font-black" style={{ color: colors.primary }}>
                {cartItem.quantity} UNIT{cartItem.quantity > 1 ? 'S' : ''}
              </Text>
            </View>
          </View>

          <QuantityStepper
            quantity={cartItem.quantity}
            onIncrement={() => onIncrement(cartItem.id, cartItem.quantity + 1)}
            onDecrement={() => onDecrement(cartItem.id, cartItem.quantity - 1)}
            isPending={isUpdatePending}
          />
        </View>
      ) : (
        <Pressable
          onPress={onAddToCart}
          disabled={buttonDisabled}
          style={({ pressed }) => ({
            height: 64,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            backgroundColor: isOutOfStock
              ? colors.error
              : !selectedVariant || isAddPending
                ? colors.surfaceEl
                : pressed
                  ? isDark
                    ? '#E2E8F0'
                    : colors.primary + 'dd'
                  : isDark
                    ? '#FFFFFF'
                    : colors.primary,
            opacity: isAddPending ? 0.7 : 1,
            elevation: pressed ? 0 : 4,
            shadowColor: isOutOfStock ? colors.error : isDark ? '#FFFFFF' : colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDark ? 0.3 : 0.2,
            shadowRadius: 10,
          })}>
          {isAddPending ? (
            <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : colors.primaryFg} />
          ) : (
            <Text
              style={{
                fontSize: 16,
                fontWeight: '900',
                letterSpacing: 0.5,
                color: isOutOfStock
                  ? '#FFFFFF'
                  : !selectedVariant || isAddPending
                    ? colors.fgSecondary
                    : isDark
                      ? '#FFFFFF'
                      : colors.primaryFg,
              }}>
              {buttonLabel}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}
