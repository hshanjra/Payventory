import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, FlatList } from 'react-native';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { useMedusaSdk } from '@/contexts/auth';

type OrderFilter = 'all' | 'pending' | 'completed' | 'canceled';

const FILTERS: { label: string; value: OrderFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Canceled', value: 'canceled' },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDateTime = (dateString?: string) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function RecentOrdersScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const sdk = useMedusaSdk();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['recent-orders-full-list'],
    queryFn: async () => {
      const response = await sdk.admin.order.list({
        limit: 100,
        order: '-created_at',
      } as any);
      return ((response as any)?.orders ?? []) as Array<any>;
    },
  });

  const filteredOrders = useMemo(() => {
    const orders = data ?? [];
    return orders.filter((order) => {
      const id = String(order?.id ?? '').toLowerCase();
      const customerName = String(order?.customer?.first_name ?? '').toLowerCase();
      const customerLastName = String(order?.customer?.last_name ?? '').toLowerCase();
      const customerEmail = String(order?.email ?? order?.customer?.email ?? '').toLowerCase();
      const status = String(order?.status ?? '').toLowerCase();
      const paymentStatus = String(order?.payment_status ?? '').toLowerCase();

      const matchesSearch =
        search.trim().length === 0 ||
        id.includes(search.trim().toLowerCase()) ||
        customerName.includes(search.trim().toLowerCase()) ||
        customerLastName.includes(search.trim().toLowerCase()) ||
        customerEmail.includes(search.trim().toLowerCase());

      const matchesFilter =
        activeFilter === 'all' ||
        status === activeFilter ||
        (activeFilter === 'completed' && paymentStatus === 'captured') ||
        (activeFilter === 'pending' && paymentStatus === 'awaiting');

      return matchesSearch && matchesFilter;
    });
  }, [data, search, activeFilter]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.canvas, paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-4 pb-3 pt-2">
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.surface }}>
            <MaterialIcons name="arrow-back" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={{ color: colors.foreground }} className="text-[18px] font-bold">
            Recent Orders
          </Text>
          <View className="h-10 w-10" />
        </View>

        <View
          className="mb-3 flex-row items-center rounded-2xl border px-3"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <MaterialIcons name="search" size={20} color={colors.fgMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by order id or customer"
            placeholderTextColor={colors.fgMuted}
            className="h-12 flex-1 px-3 text-[14px]"
            style={{ color: colors.foreground }}
          />
        </View>

        <View className="mb-1 flex-row gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <Pressable
                key={filter.value}
                onPress={() => setActiveFilter(filter.value)}
                className="rounded-full px-3.5 py-2"
                style={{
                  backgroundColor: isActive ? colors.primary + '1e' : colors.surface,
                  borderWidth: 1,
                  borderColor: isActive ? colors.primary : colors.border,
                }}>
                <Text
                  style={{ color: isActive ? colors.primary : colors.fgSecondary }}
                  className="text-[12px] font-semibold">
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 120,
          paddingTop: 8,
        }}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        ListEmptyComponent={
          <View
            className="items-center rounded-2xl border px-4 py-8"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <Text style={{ color: colors.fgSecondary }} className="text-[14px]">
              {isLoading ? 'Loading orders...' : 'No orders found for this filter.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const total = Number(item?.total ?? item?.summary?.total ?? 0);
          const customerName = [item?.customer?.first_name, item?.customer?.last_name]
            .filter(Boolean)
            .join(' ');
          return (
            <Pressable
              onPress={() => router.push(`/(tabs)/orders/${item.id}`)}
              className="rounded-2xl border px-4 py-3.5"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <View className="flex-row items-center justify-between">
                <Text style={{ color: colors.foreground }} className="text-[14px] font-bold">
                  #
                  {String(item?.display_id ?? '')
                    .slice(0, 10)
                    .toUpperCase()}
                </Text>
                <Text style={{ color: colors.foreground }} className="text-[14px] font-bold">
                  {formatCurrency(total)}
                </Text>
              </View>
              <View className="mt-1 flex-row items-center justify-between">
                <Text style={{ color: colors.fgSecondary }} className="text-[12px]">
                  {customerName || item?.email || 'Guest'}
                </Text>
                <Text style={{ color: colors.fgSecondary }} className="text-[11px] uppercase">
                  {String(item?.status ?? 'draft')}
                </Text>
              </View>
              <Text style={{ color: colors.fgMuted }} className="mt-1 text-[11px]">
                {formatDateTime(item?.created_at)}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
