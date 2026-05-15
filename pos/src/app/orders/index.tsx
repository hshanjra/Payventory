import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useOrders } from '@/hooks/api/orders';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function OrdersScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data: ordersQuery, isLoading } = useOrders({ order: '-created_at' } as any, 50);
  const orders = ordersQuery?.pages.flatMap((page) => page.orders) ?? [];

  const TypedFlashList = FlashList as any;

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.canvas }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-6 pb-6 pt-4">
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable 
            onPress={() => router.back()}
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.surface }}
          >
            <MaterialIcons name="arrow-back-ios-new" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={{ color: colors.foreground }} className="text-2xl font-black tracking-tight">
            ORDERS
          </Text>
          <View className="h-12 w-12" />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <TypedFlashList
          data={orders}
          keyExtractor={(item: any) => item.id}
          estimatedItemSize={100}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <MaterialIcons name="receipt" size={64} color={colors.muted} />
              <Text style={{ color: colors.fgSecondary }} className="mt-4 text-[16px] font-bold text-center">
                No orders found yet
              </Text>
            </View>
          }
          renderItem={({ item: order }: any) => {
            const statusColor = order.status === 'completed' ? colors.success : 
                              order.status === 'pending' ? colors.warning : colors.fgSecondary;
            const statusBg = order.status === 'completed' ? colors.successBg : 
                             order.status === 'pending' ? colors.warningBg : colors.muted;

            return (
              <Pressable
                onPress={() => router.push(`/orders/${order.id}`)}
                className="mb-3 rounded-2xl border p-4"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text style={{ color: colors.foreground }} className="text-[16px] font-black">
                      #{order.display_id}
                    </Text>
                    <Text style={{ color: colors.fgSecondary }} className="text-[12px] font-medium">
                      {formatDate(order.created_at)}
                    </Text>
                  </View>
                  <View className="rounded-lg px-2 py-1" style={{ backgroundColor: statusBg }}>
                    <Text style={{ color: statusColor }} className="text-[10px] font-black uppercase">
                      {order.status}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text style={{ color: colors.fgSecondary }} className="text-[13px] font-bold">
                    {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                  </Text>
                  <Text style={{ color: colors.primary }} className="text-[16px] font-black">
                    {formatCurrency(Number(order.total ?? 0), order.currency_code)}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
