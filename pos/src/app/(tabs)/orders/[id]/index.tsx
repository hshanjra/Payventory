import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '@/theme/useTheme';
import { useMedusaSdk } from '@/contexts/auth';

const formatCurrency = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDateTime = (dateString?: string) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const toDisplayAmount = (value: number) => value / 100;

export default function OrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const sdk = useMedusaSdk();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-details', id],
    enabled: !!id,
    queryFn: async () => {
      const response = await sdk.admin.order.retrieve(id, { fields: 'images.*,order_summary.*' });
      return (response as any)?.order ?? null;
    },
  });

  const customerName =
    [order?.customer?.first_name, order?.customer?.last_name].filter(Boolean).join(' ') || 'Guest';
  const customerEmail = order?.email || order?.customer?.email || '--';
  const customerPhone = order?.shipping_address?.phone || order?.customer?.phone || '--';
  const paymentMethod =
    order?.payments?.[0]?.provider_id ||
    order?.payment_collections?.[0]?.payments?.[0]?.provider_id ||
    '--';
  const currency = String(order?.currency_code || 'INR').toUpperCase();
  const items = order?.items ?? [];
  const status = String(order?.status ?? 'draft').toUpperCase();
  const paymentStatus = String(order?.payment_status ?? '--').toUpperCase();
  const fulfillmentStatus = String(order?.fulfillment_status ?? '--').toUpperCase();

  const subtotal = Number(order?.subtotal ?? order?.summary?.subtotal ?? 0);
  const shipping = Number(order?.shipping_total ?? order?.summary?.shipping_total ?? 0);
  const tax = Number(order?.tax_total ?? order?.summary?.tax_total ?? 0);
  const discount = Number(order?.discount_total ?? order?.summary?.discount_total ?? 0);
  const total = Number(order?.total ?? order?.summary?.total ?? 0);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.canvas, paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-4 pb-3 pt-2">
        <View className="mb-3 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.surface }}>
            <MaterialIcons name="arrow-back" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={{ color: colors.foreground }} className="text-[18px] font-bold">
            Order Details
          </Text>
          <View className="h-10 w-10" />
        </View>
        <Text style={{ color: colors.fgSecondary }} className="text-center text-[12px]">
          #{id?.slice(0, 12).toUpperCase()}
        </Text>
      </View>

      {isLoading ? (
        <View className="px-4 py-6">
          <Text style={{ color: colors.fgSecondary }}>Loading order...</Text>
        </View>
      ) : !order ? (
        <View className="px-4 py-6">
          <Text style={{ color: colors.error }}>Order not found.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 120,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}>
          <View
            className="rounded-2xl border px-4 py-3.5"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground }} className="text-[15px] font-bold">
              Customer
            </Text>
            <Text style={{ color: colors.foreground }} className="mt-2 text-[14px] font-semibold">
              {customerName}
            </Text>
            <Text style={{ color: colors.fgSecondary }} className="mt-0.5 text-[13px]">
              {customerEmail}
            </Text>
            <Text style={{ color: colors.fgSecondary }} className="mt-0.5 text-[13px]">
              {customerPhone}
            </Text>
          </View>

          <View
            className="rounded-2xl border px-4 py-3.5"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground }} className="text-[15px] font-bold">
              Items ({items.length})
            </Text>
            <View className="mt-2 gap-2.5">
              {items.length === 0 ? (
                <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
                  No line items on this order.
                </Text>
              ) : (
                items.map((item: any) => {
                  const qty = Number(item?.quantity ?? 0);
                  const unitPrice = Number(item?.unit_price ?? 0);
                  const lineTotal = Number(item?.total ?? unitPrice * qty);
                  const thumbnail =
                    item?.thumbnail ||
                    item?.variant?.product?.thumbnail ||
                    item?.product?.thumbnail ||
                    '';
                  return (
                    <View
                      key={item.id}
                      className="rounded-xl border px-3 py-2.5"
                      style={{ borderColor: colors.border }}>
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1 flex-row items-start gap-3">
                          {thumbnail ? (
                            <Image
                              source={{ uri: thumbnail }}
                              contentFit="cover"
                              className="h-14 w-14 rounded-lg"
                            />
                          ) : (
                            <View
                              className="h-14 w-14 items-center justify-center rounded-lg"
                              style={{ backgroundColor: colors.muted }}>
                              <MaterialIcons
                                name="image-not-supported"
                                size={20}
                                color={colors.fgMuted}
                              />
                            </View>
                          )}
                          <View className="flex-1">
                            <Text
                              style={{ color: colors.foreground }}
                              className="text-[13px] font-semibold">
                              {item?.title || item?.variant_title || 'Item'}
                            </Text>
                            <Text
                              style={{ color: colors.fgSecondary }}
                              className="mt-0.5 text-[12px]">
                              Qty: {qty}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={{ color: colors.foreground }}
                          className="text-[13px] font-bold">
                          {formatCurrency(toDisplayAmount(lineTotal), currency)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          <View
            className="rounded-2xl border px-4 py-3.5"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground }} className="text-[15px] font-bold">
              Payment & Status
            </Text>
            <View className="mt-2 gap-1.5">
              <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
                Payment Method:{' '}
                <Text style={{ color: colors.foreground, textTransform: 'uppercase' }}>
                  {paymentMethod}
                </Text>
              </Text>
              <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
                Order Status: <Text style={{ color: colors.foreground }}>{status}</Text>
              </Text>
              <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
                Payment Status: <Text style={{ color: colors.foreground }}>{paymentStatus}</Text>
              </Text>
              <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
                Fulfillment: <Text style={{ color: colors.foreground }}>{fulfillmentStatus}</Text>
              </Text>
              <Text style={{ color: colors.fgMuted }} className="mt-1 text-[12px]">
                Ordered on {formatDateTime(order?.created_at)}
              </Text>
            </View>
          </View>

          <View
            className="rounded-2xl border px-4 py-3.5"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground }} className="text-[15px] font-bold">
              Summary
            </Text>
            <View className="mt-2 gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
                  Subtotal
                </Text>
                <Text style={{ color: colors.foreground }} className="text-[13px]">
                  {formatCurrency(toDisplayAmount(subtotal), currency)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
                  Shipping
                </Text>
                <Text style={{ color: colors.foreground }} className="text-[13px]">
                  {formatCurrency(toDisplayAmount(shipping), currency)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
                  Tax
                </Text>
                <Text style={{ color: colors.foreground }} className="text-[13px]">
                  {formatCurrency(toDisplayAmount(tax), currency)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
                  Discount
                </Text>
                <Text style={{ color: colors.foreground }} className="text-[13px]">
                  -{formatCurrency(toDisplayAmount(discount), currency)}
                </Text>
              </View>
              <View
                className="mt-1 flex-row items-center justify-between border-t pt-2"
                style={{ borderColor: colors.border }}>
                <Text style={{ color: colors.foreground }} className="text-[14px] font-bold">
                  Total
                </Text>
                <Text style={{ color: colors.foreground }} className="text-[16px] font-extrabold">
                  {formatCurrency(toDisplayAmount(total), currency)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
