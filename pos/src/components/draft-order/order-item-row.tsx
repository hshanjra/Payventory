import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { formatCurrency } from '@/lib/utils';
import { router } from 'expo-router';

export interface OrderItem {
  id: string;
  title?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  total?: number | null;
  thumbnail?: string | null;
  variant?: {
    id?: string;
    product_id?: string;
    options?: { value: string; option?: { title?: string } }[];
  } | null;
}

interface OrderItemRowProps {
  item: OrderItem;
  currencyCode: string;
  onDecrement: (itemId: string, qty: number) => void;
  onIncrement: (itemId: string, qty: number) => void;
  isUpdatingItem?: boolean;
  updateVariables?: { id: string; update: { quantity: number } } | null;
}

export function OrderItemRow({
  item,
  currencyCode,
  onDecrement,
  onIncrement,
  isUpdatingItem,
  updateVariables,
}: OrderItemRowProps) {
  const { colors } = useTheme();

  const qty = item.quantity ?? 0;

  const variantLabel = item.variant?.options
    ?.map((o) => o.value)
    .filter(Boolean)
    .join(' / ');

  // Determine if THIS item is being incremented or decremented
  const isTargetedUpdate = isUpdatingItem && updateVariables?.id === item.id;

  const isIncrementing = isTargetedUpdate && (updateVariables?.update.quantity ?? 0) > qty;
  const isDecrementing = isTargetedUpdate && (updateVariables?.update.quantity ?? 0) < qty;

  const handleIncrementPress = async () => {
    const productId = item.variant?.product_id;

    if (!productId) {
      onIncrement(item.id, qty + 1);
      return;
    }

    router.push(`/product/${productId}/variant-select`);
  };

  return (
    <View
      className="rounded-2xl border p-4"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
      <View className="flex-row items-center gap-4">
        {/* Left: Thumbnail */}
        {item.thumbnail ? (
          <Image
            source={{ uri: item.thumbnail }}
            style={{ width: 72, height: 72, borderRadius: 12 }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              backgroundColor: colors.muted,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialIcons name="inventory-2" size={24} color={colors.mutedFg} />
          </View>
        )}

        {/* Center: Details (Column) */}
        <View className="flex-1 gap-1">
          <Text
            style={{ color: colors.foreground }}
            className="text-[16px] font-black"
            numberOfLines={1}>
            {item.title ?? 'Item'}
          </Text>
          {variantLabel ? (
            <Text style={{ color: colors.fgSecondary }} className="text-[13px] font-medium">
              {variantLabel}
            </Text>
          ) : null}
          <View className="flex-row items-center gap-2">
            <Text style={{ color: colors.fgMuted }} className="text-[13px] font-bold">
              QTY: {qty}
            </Text>
            <View
              style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.fgMuted }}
            />
            <Text style={{ color: colors.primary }} className="text-[14px] font-black">
              {formatCurrency(Number((item.unit_price ?? 0) * (item.quantity ?? 0)), currencyCode)}
            </Text>
          </View>
        </View>

        {/* Right: Vertical Quantity controls with rounded background */}
        <View
          className="items-center rounded-2xl border p-1"
          style={{
            backgroundColor: colors.primary + '08',
            borderColor: colors.border,
            minWidth: 44,
          }}>
          {/* Increment */}
          <Pressable
            onPress={handleIncrementPress}
            disabled={isUpdatingItem}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.muted : 'transparent',
            })}>
            {isIncrementing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <MaterialIcons name="add" size={20} color={colors.foreground} />
            )}
          </Pressable>

          <View
            style={{ height: 1, width: 20, backgroundColor: colors.border, marginVertical: 4 }}
          />

          {/* Decrement */}
          <Pressable
            onPress={() => onDecrement(item.id, qty - 1)}
            disabled={isUpdatingItem}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.muted : 'transparent',
            })}>
            {isDecrementing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <MaterialIcons name="remove" size={20} color={colors.foreground} />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
