import React from 'react';
import { View, Text, Pressable, ActivityIndicator, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useCurrentDraftOrder, useCompleteDraftOrder } from '@/hooks/api/draft-orders';
import { formatCurrency } from '@/lib/utils';
import { TextField } from '@/components/form/text-input';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layout } from '@/components/ui/layout';

const cashSchema = z.object({
  receivedAmount: z.string().min(1, 'Amount is required'),
});

type CashFormData = z.infer<typeof cashSchema>;

export default function CashCollectionScreen() {
  const { colors, isDark } = useTheme();
  const { data: draftOrderData } = useCurrentDraftOrder();
  const draftOrder = draftOrderData?.draft_order;
  const total = Number(draftOrder?.total ?? 0);
  const currencyCode = String(draftOrder?.currency_code ?? 'INR').toUpperCase();

  const methods = useForm<CashFormData>({
    resolver: zodResolver(cashSchema),
    defaultValues: {
      receivedAmount: '',
    },
    mode: 'onChange',
  });

  const { watch, setValue } = methods;
  const receivedAmount = watch('receivedAmount');
  const received = parseFloat(receivedAmount) || 0;
  const change = Math.max(0, received - total);
  const isEnough = received >= total;

  const completeMutation = useCompleteDraftOrder(draftOrder?.id ?? '', {
    onSuccess: (orderId) => {
      const idToPass = (orderId as unknown as string) || draftOrder?.id;
      router.push(
        `/draft-order/order-result?status=success&orderId=${idToPass}&draftOrderId=${draftOrder?.id}`
      );
    },
    onError: (error) => {
      console.error('Cash completion failed:', error);
      router.push('/draft-order/order-result?status=failed');
    },
  });

  const handleComplete = () => {
    Keyboard.dismiss();
    completeMutation.mutate();
  };

  const quickAmounts = [
    total,
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 500) * 500,
    Math.ceil(total / 1000) * 1000,
  ].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <Layout>
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <FormProvider {...methods}>
          <KeyboardAwareScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View className="mb-8 flex-row items-center justify-between">
              <View>
                <Text
                  style={{ color: colors.foreground }}
                  className="text-2xl font-black tracking-tight">
                  CASH COLLECTION
                </Text>
                <Text style={{ color: colors.fgSecondary }} className="text-sm font-bold">
                  Total to collect: {formatCurrency(total, currencyCode)}
                </Text>
              </View>
              <Pressable
                onPress={() => router.back()}
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.muted }}>
                <MaterialIcons name="close" size={20} color={colors.foreground} />
              </Pressable>
            </View>

            <View className="gap-6">
              <TextField
                name="receivedAmount"
                label="Amount Received"
                placeholder="0.00"
                keyboardType="numeric"
                leftIcon={<MaterialIcons name="payments" size={20} color={colors.fgMuted} />}
              />

              <View className="flex-row flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <Pressable
                    key={amount}
                    onPress={() =>
                      setValue('receivedAmount', amount.toString(), { shouldValidate: true })
                    }
                    className="rounded-full border px-4 py-2"
                    style={{
                      borderColor: colors.border,
                      backgroundColor:
                        receivedAmount === amount.toString() ? colors.primary : colors.canvas,
                    }}>
                    <Text
                      style={{
                        color:
                          receivedAmount === amount.toString()
                            ? colors.primaryFg
                            : colors.foreground,
                      }}
                      className="text-xs font-bold">
                      {formatCurrency(amount, currencyCode)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View
                className="rounded-3xl p-6"
                style={{
                  backgroundColor: isDark ? colors.muted + '20' : colors.muted + '40',
                }}>
                <View className="mb-4 flex-row items-center justify-between">
                  <Text style={{ color: colors.fgSecondary }} className="text-[14px] font-bold">
                    Change to Return
                  </Text>
                  <MaterialIcons name="keyboard-return" size={20} color={colors.fgSecondary} />
                </View>
                <Text
                  style={{ color: change > 0 ? colors.primary : colors.foreground }}
                  className="text-4xl font-black">
                  {formatCurrency(change, currencyCode)}
                </Text>
              </View>
            </View>

            <View className="mt-8">
              <Pressable
                onPress={handleComplete}
                disabled={!isEnough || completeMutation.isPending}
                className="h-16 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: isEnough ? colors.primary : colors.muted,
                  opacity: completeMutation.isPending ? 0.7 : 1,
                }}>
                {completeMutation.isPending ? (
                  <ActivityIndicator color={colors.primaryFg} />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Text
                      style={{ color: isEnough ? colors.primaryFg : colors.mutedFg }}
                      className="text-[18px] font-bold">
                      Complete Order
                    </Text>
                    {isEnough && (
                      <MaterialIcons name="check-circle" size={20} color={colors.primaryFg} />
                    )}
                  </View>
                )}
              </Pressable>
              {!isEnough && received > 0 && (
                <Text style={{ color: '#ef4444' }} className="mt-2 text-center text-xs font-bold">
                  Insufficient amount received
                </Text>
              )}
            </View>
          </KeyboardAwareScrollView>
        </FormProvider>
      </View>
    </Layout>
  );
}
