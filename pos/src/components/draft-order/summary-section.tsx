import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { formatCurrency } from '@/lib/utils';
import { router } from 'expo-router';

interface SummarySectionProps {
  subtotal: number;
  total: number;
  discountTotal?: number;
  roundOffAmount?: number;
  currencyCode: string;
  promotions?: any[];
  onRemovePromotion?: (code: string) => void;
  isLoading?: boolean;
}

export function SummarySection({
  subtotal,
  total,
  discountTotal = 0,
  roundOffAmount = 0,
  currencyCode,
  promotions = [],
  onRemovePromotion,
  isLoading = false,
}: SummarySectionProps) {
  const { colors } = useTheme();

  const hasPromotions = promotions.length > 0;

  return (
    <View
      className="gap-5 rounded-3xl border p-5"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
      
      {/* Promotion Section ... */}
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text
            className="text-[12px] font-black uppercase tracking-[1px]"
            style={{ color: colors.fgMuted }}>
            DISCOUNTS
          </Text>
          {hasPromotions && (
            <Pressable onPress={() => router.push('/draft-order/promotions')}>
              <Text className="text-[12px] font-bold uppercase" style={{ color: colors.primary }}>
                Edit
              </Text>
            </Pressable>
          )}
        </View>

        {hasPromotions ? (
          /* Applied Promotions List */
          <View className="gap-2">
            {promotions.map((promo) => (
              <View
                key={promo.id}
                className="flex-row items-center justify-between rounded-2xl border px-4 py-3"
                style={{ 
                  backgroundColor: colors.canvas, 
                  borderColor: colors.border,
                  opacity: isLoading ? 0.6 : 1
                }}>
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: colors.primary + '15' }}>
                    <MaterialIcons name="local-offer" size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text className="text-[15px] font-bold" style={{ color: colors.foreground }}>
                      {promo.code}
                    </Text>
                    <Text className="text-[13px] font-medium" style={{ color: colors.fgSecondary }}>
                      {promo.application_method?.value}% Discount
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => onRemovePromotion?.(promo.code)}
                  disabled={isLoading}
                  className="h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: colors.muted }}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.foreground} />
                  ) : (
                    <MaterialIcons name="delete-outline" size={22} color={colors.error || '#EF4444'} />
                  )}
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          /* Add Discount Button */
          <Pressable
            onPress={() => router.push('/draft-order/promotions')}
            disabled={isLoading}
            className="flex-row items-center justify-between rounded-2xl border px-5 py-5"
            style={{ 
              backgroundColor: colors.canvas, 
              borderColor: colors.border,
              opacity: isLoading ? 0.6 : 1 
            }}>
            <Text className="text-[16px] font-bold" style={{ color: colors.fgSecondary }}>
              Add discount
            </Text>
            <MaterialIcons name="local-offer" size={24} color={colors.fgMuted} />
          </Pressable>
        )}
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

        {discountTotal > 0 && (
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] font-medium" style={{ color: colors.fgSecondary }}>
              Discount
            </Text>
            <Text className="text-[15px] font-bold" style={{ color: colors.error || '#EF4444' }}>
              -{formatCurrency(discountTotal, currencyCode)}
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <Text className="text-[15px] font-medium" style={{ color: colors.fgSecondary }}>
            Tax
          </Text>
          <Text className="text-[15px] font-bold" style={{ color: colors.foreground }}>
            Included
          </Text>
        </View>

        {Math.abs(roundOffAmount) > 0 && (
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] font-medium" style={{ color: colors.fgSecondary }}>
              Round off
            </Text>
            <Text className="text-[15px] font-bold" style={{ color: colors.foreground }}>
              {roundOffAmount > 0 ? '+' : ''}{formatCurrency(roundOffAmount, currencyCode)}
            </Text>
          </View>
        )}

        <View className="mt-2 flex-row items-center justify-between">
          <Text
            className="text-[18px] font-black tracking-tight"
            style={{ color: colors.foreground }}>
            TOTAL DUE
          </Text>
          <Text className="text-[24px] font-black tracking-tight" style={{ color: colors.primary }}>
            {formatCurrency(total, currencyCode)}
          </Text>
        </View>
      </View>
    </View>
  );
}
