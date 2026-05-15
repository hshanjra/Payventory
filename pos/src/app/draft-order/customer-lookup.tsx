import { useState } from 'react';
import { View, Text, Pressable, TextInput, FlatList } from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Layout } from '@/components/ui/layout';
import { useTheme } from '@/theme/useTheme';
import { useCreateCustomer, useCustomers } from '@/hooks/api/customers';
import { useUpdateDraftOrderCustomer } from '@/hooks/api/draft-orders';

export default function SelectCustomerScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');

  const { data } = useCustomers({ q: query });

  const customers = data?.pages?.flatMap((page) => page.customers || []) || [];

  const setCustomer = useUpdateDraftOrderCustomer();

  const createCustomer = useCreateCustomer();

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
          <View className="h-10 w-10" />
        </View>

        <View
          className="flex-row items-center rounded-xl border px-3"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <MaterialIcons name="search" size={18} color={colors.fgMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search customer by name/email"
            placeholderTextColor={colors.fgMuted}
            className="h-12 flex-1 px-2 text-[14px]"
            style={{ color: colors.foreground }}
          />
        </View>
      </View>

      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 180, gap: 8 }}
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

      <View
        className="absolute bottom-0 left-0 right-0 border-t px-4 pb-6 pt-3"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <Text style={{ color: colors.foreground }} className="mb-2 text-[14px] font-semibold">
          Create New Customer
        </Text>
        <TextInput
          value={newCustomerName}
          onChangeText={setNewCustomerName}
          placeholder="Name"
          placeholderTextColor={colors.fgMuted}
          className="mb-2 h-11 rounded-xl border px-3"
          style={{
            borderColor: colors.border,
            color: colors.foreground,
            backgroundColor: colors.canvas,
          }}
        />
        <TextInput
          value={newCustomerEmail}
          onChangeText={setNewCustomerEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.fgMuted}
          className="mb-3 h-11 rounded-xl border px-3"
          style={{
            borderColor: colors.border,
            color: colors.foreground,
            backgroundColor: colors.canvas,
          }}
        />
        <Pressable
          onPress={() =>
            createCustomer.mutate({
              email: newCustomerEmail,
              first_name: newCustomerName,
              last_name: newCustomerName,
              phone: '',
            })
          }
          className="h-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: colors.primary }}>
          <Text style={{ color: colors.primaryFg }} className="text-[14px] font-bold">
            Create customer
          </Text>
        </Pressable>
      </View>
    </Layout>
  );
}
