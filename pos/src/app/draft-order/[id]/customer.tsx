import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, FlatList } from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/theme/useTheme';
import { useMedusaSdk } from '@/contexts/auth';

export default function SelectCustomerScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const sdk = useMedusaSdk();
  const medusa = sdk as any;
  const queryClient = useQueryClient();

  const [query, setQuery] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', query],
    queryFn: async () => {
      if (medusa.admin?.customer?.list) {
        const response = await medusa.admin.customer.list({
          limit: 100,
          q: query || undefined,
        });
        return response?.customers ?? [];
      }
      const response = await medusa.client.fetch('/admin/customers', {
        method: 'GET',
        query: { limit: 100, q: query || undefined },
      });
      return response?.customers ?? [];
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async () => {
      const name = newCustomerName.trim();
      const email = newCustomerEmail.trim();
      if (!email) throw new Error('Email is required');
      const [first_name, ...rest] = name.split(' ');
      const last_name = rest.join(' ');

      if (medusa.admin?.customer?.create) {
        const response = await medusa.admin.customer.create({
          first_name: first_name || undefined,
          last_name: last_name || undefined,
          email,
        });
        return response?.customer;
      }

      const response = await medusa.client.fetch('/admin/customers', {
        method: 'POST',
        body: { first_name: first_name || undefined, last_name: last_name || undefined, email },
      });
      return response?.customer;
    },
    onSuccess: () => {
      setNewCustomerName('');
      setNewCustomerEmail('');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const filteredCustomers = useMemo(() => {
    if (!query.trim()) return customers;
    const q = query.toLowerCase();
    return customers.filter((customer: any) => {
      const fullName = `${customer?.first_name ?? ''} ${customer?.last_name ?? ''}`.toLowerCase();
      const email = String(customer?.email ?? '').toLowerCase();
      return fullName.includes(q) || email.includes(q);
    });
  }, [customers, query]);

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
        data={filteredCustomers}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 180, gap: 8 }}
        renderItem={({ item }: { item: any }) => {
          const fullName = [item?.first_name, item?.last_name].filter(Boolean).join(' ') || 'Unnamed';
          return (
            <Pressable
              onPress={async () => {
                await queryClient.setQueryData(['selected-customer'], item);
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
          style={{ borderColor: colors.border, color: colors.foreground, backgroundColor: colors.canvas }}
        />
        <TextInput
          value={newCustomerEmail}
          onChangeText={setNewCustomerEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.fgMuted}
          className="mb-3 h-11 rounded-xl border px-3"
          style={{ borderColor: colors.border, color: colors.foreground, backgroundColor: colors.canvas }}
        />
        <Pressable
          onPress={() => createCustomerMutation.mutate()}
          className="h-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: colors.primary }}>
          <Text style={{ color: colors.primaryFg }} className="text-[14px] font-bold">
            Create customer
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
