import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrder } from '@/hooks/api/orders';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { order, isLoading } = useOrder(id!);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.canvas }}>
        <Text style={{ color: colors.foreground }}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.canvas }}>
        <Text style={{ color: colors.foreground }}>Order not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 px-4 py-2 rounded-xl" style={{ backgroundColor: colors.primary }}>
          <Text style={{ color: colors.primaryFg }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const statusColor = order.status === 'completed' ? colors.success :
                     order.status === 'pending' ? colors.warning : colors.fgSecondary;

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.canvas }}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: `Order #${order.display_id}`,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.foreground,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
        )
      }} />
      
      <ScrollView className="flex-1 px-4 py-6">
        <View className="mb-6 rounded-3xl p-6" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ color: colors.fgSecondary }} className="text-[14px] font-bold uppercase tracking-wider">
              Status
            </Text>
            <View className="rounded-lg px-3 py-1" style={{ backgroundColor: statusColor + '20' }}>
              <Text style={{ color: statusColor }} className="text-[12px] font-black uppercase">
                {order.status}
              </Text>
            </View>
          </View>
          
          <View className="mb-4">
            <Text style={{ color: colors.fgSecondary }} className="text-[14px] font-bold uppercase tracking-wider mb-1">
              Customer
            </Text>
            <Text style={{ color: colors.foreground }} className="text-[18px] font-black">
              {order.customer?.first_name} {order.customer?.last_name || 'Guest'}
            </Text>
            <Text style={{ color: colors.fgSecondary }} className="text-[14px]">
              {order.email}
            </Text>
          </View>

          <View>
            <Text style={{ color: colors.fgSecondary }} className="text-[14px] font-bold uppercase tracking-wider mb-1">
              Date
            </Text>
            <Text style={{ color: colors.foreground }} className="text-[16px] font-medium">
              {new Date(order.created_at).toLocaleString()}
            </Text>
          </View>
        </View>

        <View className="mb-6 rounded-3xl p-6" style={{ backgroundColor: colors.surface }}>
          <Text style={{ color: colors.foreground }} className="text-[18px] font-black mb-4">
            Items ({order.items?.length || 0})
          </Text>
          
          {order.items?.map((item: any) => (
            <View key={item.id} className="flex-row items-center justify-between mb-4">
              <View className="flex-1 mr-4">
                <Text style={{ color: colors.foreground }} className="text-[15px] font-bold" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={{ color: colors.fgSecondary }} className="text-[13px]">
                  {item.quantity} x {(item.unit_price / 100).toFixed(2)} {order.currency_code?.toUpperCase()}
                </Text>
              </View>
              <Text style={{ color: colors.foreground }} className="text-[15px] font-black">
                {((item.unit_price * item.quantity) / 100).toFixed(2)}
              </Text>
            </View>
          ))}
          
          <View className="mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
            <View className="flex-row justify-between mb-2">
              <Text style={{ color: colors.fgSecondary }} className="text-[15px]">Subtotal</Text>
              <Text style={{ color: colors.foreground }} className="text-[15px] font-medium">
                {(order.subtotal / 100).toFixed(2)} {order.currency_code?.toUpperCase()}
              </Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text style={{ color: colors.foreground }} className="text-[18px] font-black">Total</Text>
              <Text style={{ color: colors.primary }} className="text-[20px] font-black">
                {(order.total / 100).toFixed(2)} {order.currency_code?.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
