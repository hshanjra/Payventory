import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { Layout } from '@/components/ui/layout';
import { useOrder, useOrders } from '@/hooks/api/orders';
import { formatCurrency } from '@/lib/utils';

export default function OrderResultScreen() {
  const { colors, isDark } = useTheme();
  const { status, orderId, draftOrderId } = useLocalSearchParams<{
    status: 'success' | 'failed';
    orderId?: string;
    draftOrderId?: string;
  }>();

  const isSuccess = status === 'success';

  // 1. Try to fetch order directly if we have an ID
  const { order: directOrder, isLoading: isDirectLoading } = useOrder(
    orderId && orderId !== 'undefined' ? orderId : '',
    { fields: '+items.*,+shipping_address.*,+billing_address.*' },
    { enabled: !!orderId && orderId !== 'undefined' && isSuccess }
  );

  // 2. Fallback: Search for order by draftOrderId if direct fetch fails or is not possible
  const { data: searchData, isLoading: isSearchLoading } = useOrders(
    {}, // Default list
    10,
    { enabled: isSuccess && !directOrder && !!draftOrderId }
  );

  const order = useMemo(() => {
    if (directOrder) return directOrder;
    if (!searchData) return null;

    // Flatten pages and find the order
    const allOrders = searchData.pages.flatMap((page) => page.orders || []);
    return allOrders.find((o: any) => o.draft_order_id === draftOrderId) || allOrders[0];
  }, [directOrder, searchData, draftOrderId]);

  const isLoading = isDirectLoading || isSearchLoading;
  const currentOrderId = order?.id || orderId;

  return (
    <Layout className="px-0 pt-0">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 40, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}>
        <View className="items-center justify-center">
          <View
            className="mb-6 h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: isSuccess ? '#22c55e20' : '#ef444420' }}>
            <MaterialIcons
              name={isSuccess ? 'check-circle' : 'error'}
              size={60}
              color={isSuccess ? '#22c55e' : '#ef4444'}
            />
          </View>

          <Text
            style={{ color: colors.foreground }}
            className="mb-2 text-center text-3xl font-black tracking-tighter">
            {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
          </Text>

          <Text
            style={{ color: colors.fgSecondary }}
            className="mb-8 px-4 text-center text-[15px] font-medium leading-5">
            {isSuccess
              ? 'The transaction has been completed successfully.'
              : 'Something went wrong while processing the payment. Please try again.'}
          </Text>

          {isSuccess && (
            <View
              className="mb-8 w-full rounded-3xl border p-6"
              style={{
                backgroundColor: isDark ? colors.muted + '10' : colors.canvas,
                borderColor: colors.border,
              }}>
              <View
                className="mb-4 flex-row items-center justify-between border-b pb-4"
                style={{ borderColor: colors.border }}>
                <Text style={{ color: colors.foreground }} className="text-[16px] font-black">
                  Order Overview
                </Text>
                {currentOrderId && (
                  <Text style={{ color: colors.primary }} className="text-[13px] font-bold">
                    #{currentOrderId.slice(-6).toUpperCase()}
                  </Text>
                )}
              </View>

              {isLoading ? (
                <ActivityIndicator color={colors.primary} className="my-4" />
              ) : order ? (
                <View>
                  <View className="mb-4 gap-3">
                    {order.items?.map((item: any) => (
                      <View key={item.id} className="flex-row items-center justify-between">
                        <Text style={{ color: colors.fgSecondary }} className="flex-1 text-[14px]">
                          {item.title} <Text className="font-bold">× {item.quantity}</Text>
                        </Text>
                        <Text
                          style={{ color: colors.foreground }}
                          className="ml-2 text-[14px] font-bold">
                          {formatCurrency(
                            item.total || item.unit_price * item.quantity,
                            order.currency_code
                          )}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View className="border-t pt-4" style={{ borderColor: colors.border }}>
                    <View className="flex-row items-center justify-between">
                      <Text style={{ color: colors.foreground }} className="text-[17px] font-black">
                        Total
                      </Text>
                      <Text style={{ color: colors.primary }} className="text-[20px] font-black">
                        {formatCurrency(order.total, order.currency_code)}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View className="items-center py-4">
                  <Text style={{ color: colors.fgMuted }} className="mb-2 text-center italic">
                    Details are being processed...
                  </Text>
                </View>
              )}
            </View>
          )}

          <View className="w-full gap-3">
            {isSuccess && currentOrderId && currentOrderId !== 'undefined' && (
              <Pressable
                onPress={() => {
                  router.dismissAll();
                  router.push(`/orders/${currentOrderId}`);
                }}
                className="h-14 w-full flex-row items-center justify-center rounded-[20px]"
                style={{ backgroundColor: colors.primary }}>
                <MaterialIcons
                  name="receipt"
                  size={20}
                  color={colors.primaryFg}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{ color: colors.primaryFg }}
                  className="text-[16px] font-black tracking-wide">
                  Go to Order
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => {
                router.dismissAll();
                router.replace('/');
              }}
              className="h-14 w-full items-center justify-center rounded-[20px] border"
              style={{
                borderColor: colors.border,
                backgroundColor: isSuccess ? 'transparent' : colors.primary,
              }}>
              <Text
                style={{ color: isSuccess ? colors.foreground : colors.primaryFg }}
                className="text-[16px] font-black tracking-wide">
                Go to Home
              </Text>
            </Pressable>

            {!isSuccess && (
              <Pressable
                onPress={() => router.back()}
                className="h-14 w-full items-center justify-center rounded-[20px] border"
                style={{ borderColor: colors.border }}>
                <Text
                  style={{ color: colors.foreground }}
                  className="text-[16px] font-black tracking-wide">
                  Try Again
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => {
                router.dismissAll();
                router.replace('/search');
              }}
              className="h-14 w-full items-center justify-center rounded-[20px]">
              <Text style={{ color: colors.fgSecondary }} className="text-[15px] font-bold">
                Search Products
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
}
