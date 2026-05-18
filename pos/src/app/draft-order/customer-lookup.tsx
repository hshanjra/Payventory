import { useState } from 'react';
import { View, Text, Pressable, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Layout } from '@/components/ui/layout';
import { useTheme } from '@/theme/useTheme';
import { useCustomers } from '@/hooks/api/customers';
import { useUpdateDraftOrderCustomer } from '@/hooks/api/draft-orders';

export default function SelectCustomerScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const { data, isLoading, isFetching } = useCustomers({ q: query, order: '-created_at' });

  const customers = data?.pages?.flatMap((page) => page.customers || []) || [];

  const setCustomer = useUpdateDraftOrderCustomer();

  return (
    <Layout className="px-0 pt-0">
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
            Select Customer
          </Text>
          <Pressable
            onPress={() => router.push('/draft-order/create-customer')}
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.surface }}>
            <MaterialIcons name="person-add" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        <View
          className="flex-row items-center rounded-xl border px-3"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          {isFetching ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialIcons name="search" size={18} color={colors.fgMuted} />
          )}
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search customer by name/email"
            placeholderTextColor={colors.fgMuted}
            className="h-12 flex-1 px-2 text-[14px]"
            style={{ color: colors.foreground }}
            autoFocus
          />
        </View>
      </View>

      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 8 }}
        ListEmptyComponent={
          !isLoading ? (
            <View className="mt-20 items-center px-4">
              <MaterialIcons name="person-search" size={64} color={colors.muted} />
              <Text
                style={{ color: colors.fgSecondary }}
                className="mt-4 text-center text-[16px] font-bold">
                {query
                  ? `No customers found matching "${query}"`
                  : 'Start searching for a customer'}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }: { item: any }) => {
          const fullName =
            [item?.first_name, item?.last_name].filter(Boolean).join(' ') || 'Unnamed';
          return (
            <Pressable
              onPress={async () => {
                await setCustomer.mutateAsync({
                  id: item.id,
                  email: item?.email,
                  first_name: item?.first_name,
                  last_name: item?.last_name,
                  phone: item?.phone,
                });
                router.back();
              }}
              className="rounded-xl border px-3 py-2.5"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <Text style={{ color: colors.foreground }} className="text-[14px] font-semibold">
                {fullName}
              </Text>
              <Text style={{ color: colors.fgSecondary }} className="mt-0.5 text-[12px]">
                {item?.email || '--'}
              </Text>
            </Pressable>
          );
        }}
      />

      {isLoading && customers.length === 0 && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </Layout>
  );
}
