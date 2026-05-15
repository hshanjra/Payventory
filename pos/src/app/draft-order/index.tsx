import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useTheme } from '@/theme/useTheme';
import { 
  useCurrentDraftOrder, 
  useUpdateDraftOrderItem, 
  useUpdateDraftOrderCustomer,
  useDeleteDraftOrder,
  DRAFT_ORDER_DEFAULT_CUSTOMER_EMAIL 
} from '@/hooks/api/draft-orders';

import { OrderItemRow } from '@/components/draft-order/order-item-row';
import { CustomerSlot } from '@/components/draft-order/customer-slot';
import { SummarySection } from '@/components/draft-order/summary-section';
import { EmptyCart } from '@/components/draft-order/empty-cart';

export default function DraftOrderScreen() {
  const { colors } = useTheme();
  const [discount, setDiscount] = useState('');

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data: draftOrderData, isLoading } = useCurrentDraftOrder();
  const draftOrder = draftOrderData?.draft_order;

  const {
    mutate: updateItem,
    isPending: isUpdatePending,
    variables: updateVariables,
  } = useUpdateDraftOrderItem();
  const { mutate: updateCustomer, isPending: isUpdatingCustomer } = useUpdateDraftOrderCustomer();
  const { mutate: deleteDraftOrder, isPending: isDeleting } = useDeleteDraftOrder();

  // ── Derived values ─────────────────────────────────────────────────────────
  const items = (draftOrder?.items ?? []) as any[];
  const currencyCode = String(draftOrder?.currency_code ?? 'INR').toUpperCase();
  const subtotal = Number(draftOrder?.subtotal ?? 0);
  const total = Number(draftOrder?.total ?? 0);

  const customer = draftOrder?.customer;
  const isGuest = !customer || customer.email === DRAFT_ORDER_DEFAULT_CUSTOMER_EMAIL;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDecrement = (itemId: string, newQty: number) => {
    updateItem({ id: itemId, update: { quantity: Math.max(0, newQty) } });
  };

  const handleIncrement = (itemId: string, newQty: number) => {
    updateItem({ id: itemId, update: { quantity: newQty } });
  };

  const handleRemoveCustomer = () => {
    router.push('/draft-order/customer-lookup');
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This will remove all items and reset the cart.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            deleteDraftOrder(undefined, {
              onSuccess: () => router.replace('/(tabs)'),
            });
          },
        },
      ]
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      className="flex-1"
      style={{ backgroundColor: colors.canvas }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-6 pb-4 pt-4">
        <View className="flex-row items-center justify-center">
          <Pressable
            onPress={() => router.back()}
            className="absolute left-0 h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.surface }}>
            <MaterialIcons name="arrow-back-ios-new" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={{ color: colors.foreground }} className="text-2xl font-black tracking-tight">
            CHECKOUT
          </Text>
        </View>
      </View>

      {isLoading || isDeleting || isUpdatingCustomer ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          {isUpdatingCustomer && (
            <Text className="mt-4 text-[15px] font-bold" style={{ color: colors.fgSecondary }}>
              Updating Customer...
            </Text>
          )}
        </View>
      ) : !draftOrder || (items.length === 0 && !isUpdatePending) ? (
        <EmptyCart />
      ) : (
        <KeyboardAwareScrollView
          bottomOffset={20}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, gap: 20 }}>
          <CustomerSlot
            customer={customer}
            isGuest={isGuest}
            onRemoveCustomer={handleRemoveCustomer}
          />

          <View className="flex-row items-center justify-between">
            <Text
              className="text-[12px] font-black uppercase tracking-[2px]"
              style={{ color: colors.mutedFg }}>
              ITEMS · {items.length}
            </Text>
          </View>

          {items.map((item: any) => (
            <OrderItemRow
              key={item.id}
              item={item}
              currencyCode={currencyCode}
              onDecrement={handleDecrement}
              onIncrement={handleIncrement}
              isUpdatingItem={isUpdatePending}
              updateVariables={updateVariables}
            />
          ))}

          <SummarySection
            discount={discount}
            setDiscount={setDiscount}
            subtotal={subtotal}
            total={total}
            currencyCode={currencyCode}
          />

          {/* Action Row: Cancel and Checkout */}
          <View className="mt-2 flex-row gap-4">
            <Pressable
              onPress={handleCancelOrder}
              disabled={isDeleting}
              className="h-16 flex-1 items-center justify-center rounded-2xl border-2"
              style={{ borderColor: colors.error + '40', backgroundColor: colors.error + '05' }}>
              {isDeleting ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Text
                  className="text-[15px] font-black tracking-widest"
                  style={{ color: colors.error }}>
                  CANCEL
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push('/draft-order/payment-method')}
              className="h-16 flex-[2] items-center justify-center rounded-2xl shadow-lg"
              style={{
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 5,
              }}>
              <Text
                className="text-[17px] font-black tracking-widest"
                style={{ color: colors.primaryFg }}>
                CHECKOUT
              </Text>
            </Pressable>
          </View>
        </KeyboardAwareScrollView>
      )}
    </SafeAreaView>
  );
}
