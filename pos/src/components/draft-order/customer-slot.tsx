import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { router } from 'expo-router';

interface CustomerSlotProps {
  customer?: any;
  isGuest: boolean;
  onRemoveCustomer: () => void;
}

export function CustomerSlot({ customer, isGuest, onRemoveCustomer }: CustomerSlotProps) {
  const { colors } = useTheme();

  if (isGuest) {
    return (
      <Pressable
        onPress={() => router.push('/draft-order/customer-lookup')}
        className="flex-row items-center justify-between rounded-2xl border-2 p-4"
        style={{ backgroundColor: colors.surface, borderColor: colors.primary + '20' }}>
        <View className="flex-row items-center gap-3">
          <View
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.primary + '10' }}>
            <MaterialIcons name="person" size={22} color={colors.primary} />
          </View>
          <Text className="text-[16px] font-black" style={{ color: colors.foreground }}>
            Select Customer
          </Text>
        </View>
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.primary + '10' }}>
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </View>
      </Pressable>
    );
  }

  return (
    <View
      className="flex-row items-center justify-between rounded-2xl border-2 p-4"
      style={{ backgroundColor: colors.primary + '05', borderColor: colors.primary + '30' }}>
      <View className="flex-row items-center gap-3 flex-1">
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: colors.primary }}>
          <MaterialIcons name="person" size={22} color={colors.primaryFg} />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-black" style={{ color: colors.foreground }} numberOfLines={1}>
            {customer?.first_name ? `${customer.first_name} ${customer.last_name ?? ''}` : 'Customer'}
          </Text>
          <Text className="text-[13px] font-medium" style={{ color: colors.fgSecondary }} numberOfLines={1}>
            {customer?.email}
          </Text>
        </View>
      </View>
      <Pressable 
        onPress={onRemoveCustomer}
        className="h-10 flex-row items-center px-4 rounded-xl"
        style={{ backgroundColor: colors.primary + '10' }}>
        <Text style={{ color: colors.primary }} className="text-[13px] font-black uppercase tracking-wider mr-1">
          Change
        </Text>
        <MaterialIcons name="edit" size={16} color={colors.primary} />
      </Pressable>
    </View>
  );
}
