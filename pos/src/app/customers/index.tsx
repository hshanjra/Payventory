import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useCustomers } from '@/hooks/api/customers';
import { SafeAreaView } from '@/components/ui/safe-area-view';

export default function CustomersScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data: customersData, isLoading } = useCustomers({}, 50);
  const customers = customersData?.pages.flatMap((page) => page.customers) ?? [];

  const TypedFlashList = FlashList as any;

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.canvas }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-6 pb-6 pt-4">
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable 
            onPress={() => router.back()}
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.surface }}
          >
            <MaterialIcons name="arrow-back-ios-new" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={{ color: colors.foreground }} className="text-2xl font-black tracking-tight">
            CUSTOMERS
          </Text>
          <View className="h-12 w-12" />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <TypedFlashList
          data={customers}
          keyExtractor={(item: any) => item.id}
          estimatedItemSize={100}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <MaterialIcons name="people" size={64} color={colors.muted} />
              <Text style={{ color: colors.fgSecondary }} className="mt-4 text-[16px] font-bold text-center">
                No customers registered yet
              </Text>
            </View>
          }
          renderItem={({ item: customer }: any) => (
            <Pressable
              className="mb-3 rounded-2xl border p-4"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <View className="flex-row items-center">
                <View 
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.primary + '10' }}
                >
                  <Text style={{ color: colors.primary }} className="text-[16px] font-black">
                    {customer.first_name?.[0]}{customer.last_name?.[0]}
                  </Text>
                </View>
                <View className="ml-4 flex-1">
                  <Text style={{ color: colors.foreground }} className="text-[16px] font-black">
                    {customer.first_name} {customer.last_name}
                  </Text>
                  <Text style={{ color: colors.fgSecondary }} className="text-[13px] font-medium">
                    {customer.email}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.fgMuted} />
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
