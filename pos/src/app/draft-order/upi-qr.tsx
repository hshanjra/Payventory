import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useCurrentDraftOrder, useCompleteDraftOrder } from '@/hooks/api/draft-orders';
import { formatCurrency } from '@/lib/utils';

export default function UpiQrScreen() {
  const { colors, isDark } = useTheme();
  const { data: draftOrderData } = useCurrentDraftOrder();
  const draftOrder = draftOrderData?.draft_order;
  const total = Number(draftOrder?.total ?? 0);
  const currencyCode = String(draftOrder?.currency_code ?? 'INR').toUpperCase();

  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const completeMutation = useCompleteDraftOrder(draftOrder?.id ?? '', {
    onSuccess: (orderId) => {
      const idToPass = orderId || draftOrder?.id;
      router.push(`/draft-order/order-result?status=success&orderId=${idToPass}&draftOrderId=${draftOrder?.id}`);
    },
    onError: (error) => {
      console.error('Payment completion failed:', error);
      router.push('/draft-order/order-result?status=failed');
    }
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = () => {
    completeMutation.mutate();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} className="px-6 pt-8">
      <View className="mb-6 flex-row items-center justify-between">
        <View>
          <Text style={{ color: colors.foreground }} className="text-2xl font-black tracking-tight">
            UPI PAYMENT
          </Text>
          <Text style={{ color: colors.fgSecondary }} className="text-sm font-bold">
            Scan & Pay {formatCurrency(total, currencyCode)}
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

      <View className="flex-1 items-center justify-center">
        <View 
          className="items-center rounded-3xl border border-dashed p-8" 
          style={{ 
            borderColor: colors.borderStrong,
            backgroundColor: isDark ? colors.muted + '20' : colors.canvas
          }}
        >
          <MaterialIcons name="qr-code-2" size={200} color={colors.foreground} />
          
          <View 
            className="mt-6 flex-row items-center rounded-full px-4 py-2"
            style={{ backgroundColor: colors.muted }}
          >
            <MaterialIcons name="timer" size={16} color={colors.fgSecondary} />
            <Text 
              style={{ color: colors.fgSecondary }} 
              className="ml-2 text-[14px] font-bold"
            >
              Expires in {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        <Text 
          style={{ color: colors.fgSecondary }} 
          className="mt-8 text-center text-[14px]"
        >
          Please keep this screen open until the payment{'\n'}is confirmed by the customer.
        </Text>
      </View>

      <View className="pb-8 pt-4">
        <Pressable
          onPress={handleVerify}
          disabled={completeMutation.isPending || timeLeft <= 0}
          className="h-14 items-center justify-center rounded-2xl"
          style={{ 
            backgroundColor: colors.primary,
            opacity: (completeMutation.isPending || timeLeft <= 0) ? 0.7 : 1
          }}
        >
          {completeMutation.isPending ? (
            <ActivityIndicator color={colors.primaryFg} />
          ) : (
            <Text 
              style={{ color: colors.primaryFg }} 
              className="text-[16px] font-bold"
            >
              {timeLeft <= 0 ? 'QR Expired' : 'Verify Payment'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
