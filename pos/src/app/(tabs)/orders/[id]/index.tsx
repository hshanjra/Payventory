import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function OrderDetails() {
  const { id } = useLocalSearchParams();

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Text className="text-xl font-bold text-slate-900 dark:text-slate-50">Order Details</Text>
      <Text className="mt-2 text-base text-slate-500">Order ID: {id}</Text>
    </View>
  );
}
