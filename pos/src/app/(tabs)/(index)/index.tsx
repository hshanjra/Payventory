import React, { useState, useEffect, useMemo } from 'react';
import { Text, View, Animated, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useQuery } from '@tanstack/react-query';
import { useScrollHandler } from '@/contexts/tab-scroll-context';
import { useTheme } from '@/theme/useTheme';
import { useAuthenticated, useMedusaSdk } from '@/contexts/auth';
import { usePosSettings } from '@/contexts/settings';
import { useStockLocations } from '@/hooks/api/stock-locations';
import type { AdminStockLocation } from '@medusajs/types';

import { Header } from '@/components/home/header';
import { SearchBar } from '@/components/home/search-bar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useRouter } from 'expo-router';
import { formatCurrency, formatDate } from '@/lib/utils';

let hasShownStoreSelector = false;

type HomeStore = { id: string; name: string; address: string };

function formatStockLocationAddress(loc: AdminStockLocation): string {
  const a = loc.address;
  if (!a) return '';
  return [a.address_1, a.city, a.province, a.country_code].filter(Boolean).join(', ');
}

function stockLocationToHomeStore(loc: AdminStockLocation): HomeStore {
  return {
    id: loc.id,
    name: loc.name,
    address: formatStockLocationAddress(loc) || '—',
  };
}

export default function IndexScreen() {
  const router = useRouter();
  const tabScrollHandler = useScrollHandler();
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();
  const sdk = useMedusaSdk();
  const authState = useAuthenticated();
  const { defaults, setDefaults, isComplete: posDefaultsReady } = usePosSettings();

  const locationsQuery = useStockLocations(
    {
      limit: 100,
      ...(defaults?.salesChannelId ? { sales_channel_id: defaults.salesChannelId } : {}),
    },
    { enabled: posDefaultsReady }
  );

  const storeOptions = useMemo(() => {
    const rows = locationsQuery.stock_locations ?? [];
    return rows.map(stockLocationToHomeStore);
  }, [locationsQuery.stock_locations]);

  const scrollHandler = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
    listener: tabScrollHandler,
  });

  const stickyOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0, 0.15],
    extrapolate: 'clamp',
  });
  const stickyElevation = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0, 8],
    extrapolate: 'clamp',
  });

  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [storeDrawerVisible, setStoreDrawerVisible] = useState(false);
  const firstName = authState.user.name?.split(' ')[0] || 'there';

  const activeStore: HomeStore = useMemo(() => {
    if (!storeOptions.length) {
      return { id: '', name: 'Loading stores…', address: '' };
    }
    const match = activeStoreId ? storeOptions.find((s) => s.id === activeStoreId) : undefined;
    return match ?? storeOptions[0];
  }, [storeOptions, activeStoreId]);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['home-dashboard-orders'],
    queryFn: async () => {
      const response = await sdk.admin.order.list({
        limit: 50,
        order: '-created_at',
      } as any);

      const orders = ((response as any)?.orders ?? []) as Array<any>;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter((order) => {
        const createdAt = order?.created_at ? new Date(order.created_at) : null;
        return createdAt && !Number.isNaN(createdAt.getTime()) && createdAt >= today;
      });

      const totalSalesToday = todayOrders.reduce((sum, order) => {
        const amount = Number(order?.total ?? order?.summary?.total ?? 0);
        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0);

      const completedCount = orders.filter(
        (order) =>
          order?.status === 'completed' ||
          order?.payment_status === 'captured' ||
          order?.fulfillment_status === 'fulfilled'
      ).length;
      const pendingCount = orders.filter(
        (order) => order?.status === 'pending' || order?.payment_status === 'awaiting'
      ).length;
      const refundedCount = orders.filter((order) => order?.status === 'canceled').length;

      return {
        orders,
        totalSalesToday,
        completedCount,
        pendingCount,
        refundedCount,
      };
    },
  });

  const recentOrders = dashboardData?.orders?.slice(0, 5) ?? [];

  useEffect(() => {
    if (!storeOptions.length) return;

    let cancelled = false;

    (async () => {
      let nextId: string | null = null;

      if (
        defaults?.stockLocationId &&
        storeOptions.some((s) => s.id === defaults.stockLocationId)
      ) {
        nextId = defaults.stockLocationId;
      }

      if (!nextId) {
        try {
          const legacy = await SecureStore.getItemAsync('selectedStoreId');
          if (legacy && storeOptions.some((s) => s.id === legacy)) {
            nextId = legacy;
          }
        } catch {
          /* ignore */
        }
      }

      if (!nextId) {
        nextId = storeOptions[0].id;
      }

      if (cancelled) return;
      setActiveStoreId(nextId);

      if (defaults && nextId && defaults.stockLocationId !== nextId) {
        try {
          await setDefaults({ ...defaults, stockLocationId: nextId });
        } catch {
          /* ignore */
        }
      }

      try {
        await SecureStore.setItemAsync('selectedStoreId', nextId);
      } catch {
        /* ignore */
      }

      if (!hasShownStoreSelector) {
        setStoreDrawerVisible(true);
        hasShownStoreSelector = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storeOptions, defaults, setDefaults]);

  const handleStoreSelect = async (store: HomeStore) => {
    setActiveStoreId(store.id);
    setStoreDrawerVisible(false);
    try {
      await SecureStore.setItemAsync('selectedStoreId', store.id);
      if (defaults) {
        await setDefaults({ ...defaults, stockLocationId: store.id });
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}>
        <Header store={activeStore} onStorePress={() => setStoreDrawerVisible(true)} />

        {/* Sticky search bar */}
        <Animated.View
          style={{
            backgroundColor: colors.surface,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: stickyOpacity as any,
            shadowRadius: 8,
            elevation: stickyElevation as any,
            zIndex: 10,
          }}>
          <SearchBar />
        </Animated.View>

        {/* Dashboard */}
        <View className="mt-2 px-4">
          <Text
            style={{ color: colors.foreground }}
            className="mb-4 text-[22px] font-bold tracking-tight">
            Welcome, {firstName}
          </Text>

          {/* Row 1 */}
          <View className="flex-row gap-3">
            {/* Sales card */}
            <View
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="h-36 flex-1 rounded-2xl border px-4 py-3">
              <View className="flex-row items-start justify-between">
                <Text
                  style={{ color: colors.mutedFg }}
                  className="text-[11px] font-semibold uppercase tracking-widest">
                  Total Sales
                </Text>
                <View
                  style={{ backgroundColor: colors.successBg }}
                  className="rounded-full px-2 py-0.5">
                  <Text style={{ color: colors.success }} className="text-[10px] font-bold">
                    +12.4%
                  </Text>
                </View>
              </View>
              <Text
                style={{ color: colors.foreground }}
                className="mt-2 text-2xl font-extrabold tracking-tight">
                {isLoading ? '--' : formatCurrency(dashboardData?.totalSalesToday ?? 0)}
              </Text>
              <Text style={{ color: colors.mutedFg }} className="text-[11px]">
                Today • INR
              </Text>
              <MaterialIcons
                name="trending-up"
                size={20}
                color={colors.success}
                style={{ marginTop: 'auto' }}
              />
            </View>

            {/* Scan card */}
            <Pressable
              onPress={() => router.push('/scan')}
              style={{ backgroundColor: colors.primary }}
              className="h-36 w-36 shrink-0 items-center justify-center gap-2 rounded-2xl">
              <MaterialIcons name="qr-code-2" size={46} color={colors.primaryFg} />
              <Text
                style={{ color: colors.primaryFg }}
                className="text-[13px] font-bold tracking-wide">
                Scan Code
              </Text>
            </Pressable>
          </View>

          {/* Row 2 — mini stat cards */}
          <View className="mt-3 flex-row gap-3">
            {[
              {
                label: 'Completed',
                value: String(dashboardData?.completedCount ?? 0),
                color: colors.foreground,
              },
              {
                label: 'Pending',
                value: String(dashboardData?.pendingCount ?? 0),
                color: colors.warning,
              },
              {
                label: 'Refunds',
                value: String(dashboardData?.refundedCount ?? 0),
                color: colors.error,
              },
            ].map((item) => (
              <View
                key={item.label}
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                className="flex-1 rounded-2xl border px-4 py-3">
                <Text
                  style={{ color: colors.mutedFg }}
                  className="text-[11px] font-semibold uppercase tracking-widest">
                  {item.label}
                </Text>
                <Text style={{ color: item.color }} className="mt-1 text-xl font-extrabold">
                  {item.value}
                </Text>
                <Text style={{ color: colors.mutedFg }} className="text-[11px]">
                  Today
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-5">
            <View className="mb-3 flex-row items-center justify-between">
              <Text
                style={{ color: colors.foreground }}
                className="text-[18px] font-bold tracking-tight">
                Recent orders
              </Text>
              <Pressable onPress={() => router.push('/(tabs)/(index)/recent-orders')}>
                <Text style={{ color: colors.primary }} className="text-[13px] font-semibold">
                  View all
                </Text>
              </Pressable>
            </View>

            <View
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="overflow-hidden rounded-2xl border">
              {recentOrders.length === 0 ? (
                <View className="px-4 py-5">
                  <Text style={{ color: colors.fgSecondary }} className="text-[14px]">
                    No recent orders found.
                  </Text>
                </View>
              ) : (
                recentOrders.map((order, index) => (
                  <Pressable
                    key={order.id}
                    onPress={() => router.push(`/(tabs)/orders/${order.id}`)}
                    style={{
                      borderBottomWidth: index === recentOrders.length - 1 ? 0 : 1,
                      borderColor: colors.border,
                    }}
                    className="flex-row items-center justify-between px-4 py-3.5">
                    <View>
                      <Text
                        style={{ color: colors.foreground }}
                        className="text-[14px] font-semibold">
                        #{order.display_id}
                      </Text>
                      <Text style={{ color: colors.fgSecondary }} className="mt-0.5 text-[12px]">
                        {formatDate(order.created_at)}
                      </Text>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Store drawer */}
      <BottomSheet
        visible={storeDrawerVisible}
        onClose={() => setStoreDrawerVisible(false)}
        title="Select Store">
        <View className="mb-6 gap-3">
          {locationsQuery.isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : storeOptions.length === 0 ? (
            <Text style={{ color: colors.fgSecondary }} className="text-center text-[14px]">
              No stock locations for this sales channel. Check POS setup or Medusa inventory.
            </Text>
          ) : (
            storeOptions.map((store) => {
              const isActive = activeStore.id === store.id;
              return (
                <Pressable
                  key={store.id}
                  onPress={() => handleStoreSelect(store)}
                  style={{
                    backgroundColor: isActive ? colors.primary + '14' : colors.surface,
                    borderColor: isActive ? colors.primary + '55' : colors.border,
                  }}
                  className="flex-row items-center justify-between rounded-2xl border p-4">
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{ backgroundColor: isActive ? colors.primary : colors.muted }}
                      className="rounded-full p-2">
                      <MaterialIcons
                        name="store"
                        size={20}
                        color={isActive ? colors.primaryFg : colors.mutedFg}
                      />
                    </View>
                    <View>
                      <Text
                        style={{ color: isActive ? colors.primary : colors.foreground }}
                        className="font-bold">
                        {store.name}
                      </Text>
                      <Text style={{ color: colors.mutedFg }} className="mt-0.5 text-xs">
                        {store.address}
                      </Text>
                    </View>
                  </View>
                  {isActive && (
                    <MaterialIcons name="check-circle" size={22} color={colors.primary} />
                  )}
                </Pressable>
              );
            })
          )}
        </View>
      </BottomSheet>
    </View>
  );
}
