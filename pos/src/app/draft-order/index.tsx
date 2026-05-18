import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Layout } from '@/components/ui/layout';
import { useTheme } from '@/theme/useTheme';
import {
  useCurrentDraftOrder,
  useUpdateDraftOrderItem,
  useUpdateDraftOrderCustomer,
  useDeleteDraftOrder,
  DRAFT_ORDER_DEFAULT_CUSTOMER_EMAIL,
  useRemoveDraftOrderPromotions,
} from '@/hooks/api/draft-orders';

import { OrderItemRow } from '@/components/draft-order/order-item-row';
import { CustomerSlot } from '@/components/draft-order/customer-slot';
import { SummarySection } from '@/components/draft-order/summary-section';
import { EmptyCart } from '@/components/draft-order/empty-cart';
import { Prompt } from '@/components/ui/prompt';

export default function DraftOrderScreen() {
  const { colors, isDark } = useTheme();
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

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
  const { mutateAsync: removePromotion, isPending: isRemovingPromotion } = useRemoveDraftOrderPromotions();

  // ── Derived values ─────────────────────────────────────────────────────────
  const items = (draftOrder?.items ?? []) as any[];
  const currencyCode = String(draftOrder?.currency_code ?? 'INR').toUpperCase();
  const subtotal = Number(draftOrder?.subtotal ?? 0);
  const total = Number(draftOrder?.total ?? 0);
  const discountTotal = Number(draftOrder?.discount_total ?? 0);
  const appliedPromotions = (draftOrder as any)?.promotions ?? [];

  const customer = draftOrder?.customer;
  const isGuest = !customer || customer.email === DRAFT_ORDER_DEFAULT_CUSTOMER_EMAIL;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleRemovePromotion = async (promoCode: string) => {
    try {
      await removePromotion({ promo_codes: [promoCode] });
    } catch (error) {
      console.error('Error removing promotion:', error);
    }
  };

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
    setShowCancelPrompt(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout className="px-0 pt-0">
      <Stack.Screen options={{ headerShown: false }} />

      <Prompt
        visible={showCancelPrompt}
        title="Cancel Order?"
        submitText="Yes, Cancel"
        cancelText="No"
        onSubmit={() => {
          setShowCancelPrompt(false);
          deleteDraftOrder(undefined, {
            onSuccess: () => router.replace('/'),
          });
        }}
        onClose={() => setShowCancelPrompt(false)}>
        <Text style={{ color: colors.fgSecondary }} className="mb-4 text-center">
          Are you sure you want to cancel this order? This will remove all items and reset the cart.
        </Text>
      </Prompt>

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
            Checkout
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
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140, gap: 20 }}>
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
            subtotal={subtotal}
            total={total}
            discountTotal={discountTotal}
            currencyCode={currencyCode}
            promotions={appliedPromotions}
            onRemovePromotion={handleRemovePromotion}
            isLoading={isRemovingPromotion}
          />
        </KeyboardAwareScrollView>
      )}

      {/* Floating Action Bar */}
      {!isLoading && !isDeleting && !isUpdatingCustomer && draftOrder && items.length > 0 && (
        <View
          className="absolute bottom-10 left-6 right-6 h-[76px] flex-row gap-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: isDark ? 0.4 : 0.08,
            shadowRadius: 30,
            elevation: 20,
          }}>
          <View
            className="h-full flex-1 rounded-[38px]"
            style={{
              backgroundColor: colors.muted,
            }}>
            <Pressable
              onPress={handleCancelOrder}
              disabled={isDeleting}
              className="h-full w-full items-center justify-center rounded-[38px]"
              style={() => ({
                opacity: isDeleting ? 0.7 : 1,
              })}>
              {isDeleting ? (
                <ActivityIndicator size="small" color={colors.foreground} />
              ) : (
                <MaterialIcons name="close" size={24} color={colors.foreground} />
              )}
            </Pressable>
          </View>

          <View
            className="h-full flex-[3] rounded-[38px]"
            style={{
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOpacity: isDark ? 0.6 : 0.4,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 8 },
              elevation: 10,
            }}>
            <Pressable
              onPress={() => router.push('/draft-order/payment-method')}
              className="h-full w-full items-center justify-center rounded-[38px]"
              style={({ pressed }) => ({
                backgroundColor: pressed ? colors.primaryFg + '15' : 'transparent',
              })}>
              <Text
                className="text-[17px] font-black tracking-widest"
                style={{ color: colors.primaryFg }}>
                Checkout
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </Layout>
  );
}
