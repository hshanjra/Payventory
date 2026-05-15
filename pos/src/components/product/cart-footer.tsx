import React, { useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { MaterialIcons } from '@expo/vector-icons';
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
    ? 'SELECT A VARIANT'
    : isOutOfStock
      ? 'OUT OF STOCK'
      : `ADD TO CART  ·  ${priceLabel ?? ''}`;

  // Common floating style inspired by Tab Bar
  const commonFloatingStyle = {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: isDark ? 0.5 : 0.15,
    shadowRadius: 32,
    elevation: 24,
    zIndex: 100,
  };

  if (isInCart && cartItem) {
    return (
      <View style={[
        styles.floatingContainer, 
        commonFloatingStyle,
        {
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          shadowOpacity: isDark ? 0.6 : 0.4,
        }
      ]}>
        <Pressable 
          onPress={() => onDecrement(cartItem.id, cartItem.quantity - 1)}
          disabled={isUpdatePending}
          className="h-full w-20 items-center justify-center rounded-l-full"
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.primaryFg + '15' : 'transparent',
          })}
        >
          <MaterialIcons name="remove" size={28} color={colors.primaryFg} />
        </Pressable>
        
        <View className="flex-1 items-center justify-center">
          {isUpdatePending ? (
            <ActivityIndicator size="small" color={colors.primaryFg} />
          ) : (
            <View className="items-center">
              <Text style={{ color: colors.primaryFg, fontSize: 20, fontVariant: ['tabular-nums'], fontWeight: '900' }}>
                {cartItem.quantity} UNIT{cartItem.quantity > 1 ? 'S' : ''}
              </Text>
              <Text style={{ color: colors.primaryFg, opacity: 0.8, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 }}>
                IN CART
              </Text>
            </View>
          )}
        </View>

        <Pressable 
          onPress={() => onIncrement(cartItem.id, cartItem.quantity + 1)}
          disabled={isUpdatePending}
          className="h-full w-20 items-center justify-center rounded-r-full"
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.primaryFg + '15' : 'transparent',
          })}
        >
          <MaterialIcons name="add" size={28} color={colors.primaryFg} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[
      styles.floatingContainer, 
      commonFloatingStyle,
      {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: isDark ? 0.6 : 0.4,
        opacity: buttonDisabled ? 0.5 : 1,
      }
    ]}>
      <Pressable
        onPress={onAddToCart}
        disabled={buttonDisabled}
        className="w-full h-full items-center justify-center rounded-full"
        style={({ pressed }) => ({
          backgroundColor: pressed && !buttonDisabled ? colors.primaryFg + '15' : 'transparent',
        })}
      >
        {isAddPending ? (
          <ActivityIndicator size="small" color={colors.primaryFg} />
        ) : (
          <Text 
            style={[
              styles.buttonText, 
              { color: colors.primaryFg }
            ]}
          >
            {buttonLabel}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 34,
    left: 24,
    right: 24,
    height: 72,
    borderRadius: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  }
});
