import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useCurrentDraftOrder, useCompleteDraftOrder } from '@/hooks/api/draft-orders';
import { formatCurrency } from '@/lib/utils';

export default function PaymentMethodScreen() {
  const { colors } = useTheme();
  const { data: draftOrderData } = useCurrentDraftOrder();
  const draftOrder = draftOrderData?.draft_order;
  const currencyCode = String(draftOrder?.currency_code ?? 'INR').toUpperCase();
  const total = Number(draftOrder?.total ?? 0);

  const [selectedMethod, setSelectedMethod] = useState<'upi_qr' | 'cash' | null>(null);

  const completeMutation = useCompleteDraftOrder(draftOrder?.id ?? '', {
    onSuccess: () => {
      router.dismissAll();
      router.replace('/orders');
    },
  });

  const methods = [
    { id: 'upi_qr', label: 'UPI QR Payment', icon: 'qr-code-2', desc: 'Generate dynamic QR code' },
    { id: 'cash', label: 'Cash Payment', icon: 'payments', desc: 'Receive physical currency' },
    { id: 'card', label: 'Card Payment', icon: 'credit-card', desc: 'External card terminal' },
  ];

  const handleComplete = () => {
    if (!selectedMethod) return;
    completeMutation.mutate();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} className="px-6 pt-8">
      <View className="mb-6 flex-row items-center justify-between">
        <View>
          <Text style={{ color: colors.foreground }} className="text-2xl font-black tracking-tight">
            PAYMENT
          </Text>
          <Text style={{ color: colors.fgSecondary }} className="text-sm font-bold">
            Total: {formatCurrency(total, currencyCode)}
          </Text>
        </View>
        <Pressable 
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.muted }}
        >
          <MaterialIcons name="close" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="gap-3">
          {methods.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <Pressable
                key={method.id}
                onPress={() => setSelectedMethod(method.id as any)}
                className="rounded-2xl border p-4"
                style={{ 
                  borderColor: isSelected ? colors.primary : colors.border, 
                  backgroundColor: isSelected ? colors.primary + '05' : colors.canvas 
                }}
              >
                <View className="flex-row items-center">
                  <View 
                    className="h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: isSelected ? colors.primary : colors.muted }}
                  >
                    <MaterialIcons 
                      name={method.icon as any} 
                      size={24} 
                      color={isSelected ? colors.primaryFg : colors.fgSecondary} 
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text 
                      style={{ color: colors.foreground }} 
                      className="text-[16px] font-bold"
                    >
                      {method.label}
                    </Text>
                    <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
                      {method.desc}
                    </Text>
                  </View>
                  <MaterialIcons 
                    name={isSelected ? "radio-button-checked" : "radio-button-unchecked"} 
                    size={22} 
                    color={isSelected ? colors.primary : colors.fgMuted} 
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        {selectedMethod === 'upi_qr' && (
          <View className="mt-8 items-center rounded-3xl border border-dashed p-6" style={{ borderColor: colors.borderStrong }}>
            <MaterialIcons name="qr-code-2" size={160} color={colors.foreground} />
            <Text style={{ color: colors.fgSecondary }} className="mt-4 text-center text-[13px] font-medium">
              Scan this QR with any UPI app to pay{'\n'}
              <Text className="font-bold">{formatCurrency(total, currencyCode)}</Text>
            </Text>
          </View>
        )}
      </ScrollView>

      <View className="pb-8 pt-4">
        <Pressable
          onPress={handleComplete}
          disabled={!selectedMethod || completeMutation.isPending}
          className="h-14 items-center justify-center rounded-2xl"
          style={{ 
            backgroundColor: selectedMethod ? colors.primary : colors.muted,
            opacity: completeMutation.isPending ? 0.7 : 1
          }}
        >
          {completeMutation.isPending ? (
            <ActivityIndicator color={colors.primaryFg} />
          ) : (
            <Text 
              style={{ color: selectedMethod ? colors.primaryFg : colors.mutedFg }} 
              className="text-[16px] font-bold"
            >
              {selectedMethod === 'upi_qr' ? 'Verify & Complete' : 'Complete Payment'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
