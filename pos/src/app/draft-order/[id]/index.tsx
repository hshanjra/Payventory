import React from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { useMedusaSdk } from '@/contexts/auth';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import * as SecureStore from 'expo-secure-store';
import { formatCurrency } from '@/lib/utils';

export default function DraftOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const sdk = useMedusaSdk();
  const medusa = sdk as any;
  const queryClient = useQueryClient();
  const [discountDrawerVisible, setDiscountDrawerVisible] = React.useState(false);
  const [paymentMethodDrawerVisible, setPaymentMethodDrawerVisible] = React.useState(false);
  const [upiDrawerVisible, setUpiDrawerVisible] = React.useState(false);
  const [cashDrawerVisible, setCashDrawerVisible] = React.useState(false);
  const [discountInput, setDiscountInput] = React.useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string | null>(null);
  const [cashReceivedInput, setCashReceivedInput] = React.useState('');
  const [upiSeconds, setUpiSeconds] = React.useState(180);

  React.useEffect(() => {
    if (!id) return;
    SecureStore.setItemAsync('activeDraftOrderId', id).catch(() => undefined);
  }, [id]);

  React.useEffect(() => {
    if (!upiDrawerVisible) {
      setUpiSeconds(180);
      return;
    }
    const timer = setInterval(() => {
      setUpiSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [upiDrawerVisible]);

  const { data: draftOrder, isLoading } = useQuery({
    queryKey: ['draft-order', id],
    enabled: !!id,
    queryFn: async () => {
      if (medusa.admin?.draftOrder?.retrieve) {
        const response = await medusa.admin.draftOrder.retrieve(id);
        return response?.draft_order ?? null;
      }
      const response = await medusa.client.fetch(`/admin/draft-orders/${id}`, {
        method: 'GET',
      });
      return response?.draft_order ?? null;
    },
  });

  const items = draftOrder?.items ?? [];
  const currency = String(draftOrder?.currency_code || 'INR').toUpperCase();
  const total = Number(draftOrder?.total ?? draftOrder?.summary?.total ?? 0);
  const selectedCustomer = queryClient.getQueryData(['selected-customer']) as any;
  const discountAmount = Number(discountInput || 0);
  const payableTotal = Math.max(total - discountAmount * 100, 0);
  const cashReceived = Number(cashReceivedInput || 0);
  const returnableAmount = Math.max(cashReceived * 100 - payableTotal, 0);

  const completePaymentMutation = useMutation({
    mutationFn: async () => {
      if (medusa.admin?.draftOrder?.complete) {
        return medusa.admin.draftOrder.complete(id);
      }
      return medusa.client.fetch(`/admin/draft-orders/${id}/complete`, { method: 'POST' });
    },
    onSuccess: async () => {
      await SecureStore.deleteItemAsync('activeDraftOrderId');
      queryClient.invalidateQueries({ queryKey: ['active-draft-order-id'] });
      queryClient.invalidateQueries({ queryKey: ['active-draft-order'] });
      router.replace('/(tabs)/orders');
    },
  });

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
            Draft Order
          </Text>
          <Pressable
            onPress={() => router.push(`/draft-order/${id}/customer`)}
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.surface }}>
            <MaterialIcons name="person-add-alt-1" size={19} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View className="px-4 py-6">
          <Text style={{ color: colors.fgSecondary }}>Loading draft order...</Text>
        </View>
      ) : !draftOrder ? (
        <View className="px-4 py-6">
          <Text style={{ color: colors.error }}>Draft order not found.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 80,
            gap: 12,
          }}>
          <View
            className="rounded-2xl border px-4 py-3.5"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text style={{ color: colors.foreground }} className="text-[14px] font-bold">
                  Customer
                </Text>
                <Text style={{ color: colors.fgSecondary }} className="mt-0.5 text-[12px]">
                  {selectedCustomer
                    ? `${selectedCustomer?.first_name ?? ''} ${selectedCustomer?.last_name ?? ''}`.trim() ||
                      selectedCustomer?.email
                    : 'No customer selected'}
                </Text>
              </View>
              <Pressable
                onPress={() => router.push(`/draft-order/${id}/customer`)}
                className="rounded-lg px-3 py-2"
                style={{ backgroundColor: colors.primary + '14' }}>
                <Text style={{ color: colors.primary }} className="text-[12px] font-semibold">
                  Add customer
                </Text>
              </Pressable>
            </View>
          </View>

          <View
            className="rounded-2xl border px-4 py-3.5"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground }} className="text-[15px] font-bold">
              Items ({items.length})
            </Text>
            <View className="mt-2 gap-2.5">
              {items.map((item: any) => (
                <View
                  key={item.id}
                  className="flex-row items-center justify-between rounded-xl border px-3 py-2.5"
                  style={{ borderColor: colors.border }}>
                  <View className="flex-1 pr-3">
                    <Text
                      style={{ color: colors.foreground }}
                      className="text-[13px] font-semibold">
                      {item.title || 'Item'}
                    </Text>
                    <Text style={{ color: colors.fgSecondary }} className="mt-0.5 text-[12px]">
                      Qty: {item.quantity ?? 0}
                    </Text>
                  </View>
                  <Text style={{ color: colors.foreground }} className="text-[13px] font-bold">
                    {formatCurrency(Number(item.total ?? 0), currency)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View
            className="rounded-2xl border px-4 py-3.5"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <View className="mb-2 flex-row items-center justify-between">
              <Text style={{ color: colors.foreground }} className="text-[14px] font-bold">
                Discount
              </Text>
              <Pressable
                onPress={() => setDiscountDrawerVisible(true)}
                className="rounded-lg px-3 py-1.5"
                style={{ backgroundColor: colors.primary + '14' }}>
                <Text style={{ color: colors.primary }} className="text-[12px] font-semibold">
                  Add discount
                </Text>
              </Pressable>
            </View>
            <View className="flex-row items-center justify-between">
              <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
                Applied
              </Text>
              <Text style={{ color: colors.foreground }} className="text-[13px] font-semibold">
                -{formatCurrency(discountAmount * 100, currency)}
              </Text>
            </View>
          </View>

          <View
            className="rounded-2xl border px-4 py-3.5"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <View className="flex-row items-center justify-between">
              <Text style={{ color: colors.foreground }} className="text-[14px] font-bold">
                Payable total
              </Text>
              <Text style={{ color: colors.foreground }} className="text-[16px] font-extrabold">
                {formatCurrency(payableTotal, currency)}
              </Text>
            </View>
            <Pressable
              onPress={() => setPaymentMethodDrawerVisible(true)}
              className="mt-3 h-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: colors.primary }}>
              <Text style={{ color: colors.primaryFg }} className="text-[14px] font-bold">
                Continue to pay
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      <BottomSheet
        visible={discountDrawerVisible}
        onClose={() => setDiscountDrawerVisible(false)}
        title="Apply Discount">
        <View className="gap-3">
          <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
            Enter discount amount in INR
          </Text>
          <TextInput
            value={discountInput}
            onChangeText={setDiscountInput}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.fgMuted}
            className="h-12 rounded-xl border px-3"
            style={{
              borderColor: colors.border,
              color: colors.foreground,
              backgroundColor: colors.canvas,
            }}
          />
          <Pressable
            onPress={() => setDiscountDrawerVisible(false)}
            className="h-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.primary }}>
            <Text style={{ color: colors.primaryFg }} className="text-[14px] font-bold">
              Apply
            </Text>
          </Pressable>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={paymentMethodDrawerVisible}
        onClose={() => setPaymentMethodDrawerVisible(false)}
        title="Choose Payment Method">
        <View className="gap-3">
          {[
            { id: 'upi_qr', label: 'UPI QR', icon: 'qr-code-2' as const },
            { id: 'cash', label: 'Cash', icon: 'payments' as const },
          ].map((method) => (
            <Pressable
              key={method.id}
              onPress={() => {
                setSelectedPaymentMethod(method.id);
                setPaymentMethodDrawerVisible(false);
                if (method.id === 'upi_qr') setUpiDrawerVisible(true);
                if (method.id === 'cash') setCashDrawerVisible(true);
              }}
              className="flex-row items-center justify-between rounded-xl border px-3 py-3"
              style={{ borderColor: colors.border, backgroundColor: colors.canvas }}>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name={method.icon} size={20} color={colors.foreground} />
                <Text style={{ color: colors.foreground }} className="text-[14px] font-semibold">
                  {method.label}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={colors.fgMuted} />
            </Pressable>
          ))}
        </View>
      </BottomSheet>

      <BottomSheet
        visible={upiDrawerVisible}
        onClose={() => setUpiDrawerVisible(false)}
        title="UPI QR">
        <View className="items-center gap-3 pb-2">
          <View
            className="h-52 w-52 items-center justify-center rounded-2xl border"
            style={{ borderColor: colors.border, backgroundColor: colors.canvas }}>
            <MaterialIcons name="qr-code-2" size={150} color={colors.foreground} />
          </View>
          <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
            Expires in {Math.floor(upiSeconds / 60)}:{String(upiSeconds % 60).padStart(2, '0')}
          </Text>
          <Text style={{ color: colors.foreground }} className="text-[15px] font-bold">
            Amount: {formatCurrency(payableTotal, currency)}
          </Text>
          <Pressable
            onPress={() => completePaymentMutation.mutate()}
            disabled={completePaymentMutation.isPending}
            className="mt-1 h-11 w-full items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.primary }}>
            <Text style={{ color: colors.primaryFg }} className="text-[14px] font-bold">
              Mark Paid
            </Text>
          </Pressable>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={cashDrawerVisible}
        onClose={() => setCashDrawerVisible(false)}
        title="Cash Payment">
        <View className="gap-3 pb-2">
          <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
            Enter amount received from customer
          </Text>
          <TextInput
            value={cashReceivedInput}
            onChangeText={setCashReceivedInput}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.fgMuted}
            className="h-12 rounded-xl border px-3"
            style={{
              borderColor: colors.border,
              color: colors.foreground,
              backgroundColor: colors.canvas,
            }}
          />
          <View className="rounded-xl border px-3 py-2.5" style={{ borderColor: colors.border }}>
            <View className="flex-row items-center justify-between">
              <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
                Payable
              </Text>
              <Text style={{ color: colors.foreground }} className="text-[13px] font-semibold">
                {formatCurrency(payableTotal, currency)}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center justify-between">
              <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
                Returnable
              </Text>
              <Text style={{ color: colors.foreground }} className="text-[13px] font-semibold">
                {formatCurrency(returnableAmount, currency)}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => completePaymentMutation.mutate()}
            disabled={completePaymentMutation.isPending}
            className="h-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.primary }}>
            <Text style={{ color: colors.primaryFg }} className="text-[14px] font-bold">
              Confirm Cash Payment
            </Text>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}
