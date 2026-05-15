import { useMemo, useCallback, useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { useAuthenticated } from '@/contexts/auth';
import { useOrders } from '@/hooks/api/orders';
import { usePosSettings } from '@/contexts/settings';
import { useProducts } from '@/hooks/api/products';
import { useQueryClient } from '@tanstack/react-query';
import { getTimeBasedGreeting } from '@/lib/utils';

// Modular Components
import { HomeHeader } from '@/components/home/home-header';
import { GreetingCard } from '@/components/home/greeting-card';
import { SalesOverviewCard } from '@/components/home/sales-overview-card';
import { ProductCard } from '@/components/home/product-card';
import { ProductGridLoader } from '@/components/home/product-grid-loader';
import { SearchBar } from '@/components/home/search-bar';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { defaults } = usePosSettings();
  const authState = useAuthenticated();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const firstName = authState.user.name?.split(' ')[0] || 'Member';
  const store = defaults?.stockLocation;

  const { data: ordersQuery } = useOrders({ order: '-created_at' } as any, 50);

  const {
    data: productsData,
    isLoading: isProductsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(
    {
      tag_id: defaults?.departmentTag?.id,
      sales_channel_id: defaults?.salesChannel?.id,
      fields: '+variants.*,+variants.prices.*',
    },
    20
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries();
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const dashboardData = useMemo(() => {
    const orders = ordersQuery?.pages.flatMap((page) => page.orders) ?? [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((order) => {
      const createdAt = order?.created_at ? new Date(order.created_at) : null;
      return createdAt && !Number.isNaN(createdAt.getTime()) && createdAt >= today;
    });

    const totalSalesToday = todayOrders.reduce((sum, order) => {
      const amount = Number(order?.total ?? (order as any)?.summary?.total ?? 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    return {
      totalSalesToday,
      ordersCount: todayOrders.length,
    };
  }, [ordersQuery?.pages]);

  const products = useMemo(
    () => productsData?.pages.flatMap((p) => p.products) ?? [],
    [productsData]
  );

  const renderHeader = () => (
    <View style={{ backgroundColor: colors.canvas }}>
      <HomeHeader storeName={store?.name} storeAddress={store?.address?.address_1} />
      <SalesOverviewCard
        totalSalesToday={dashboardData.totalSalesToday}
        ordersCount={dashboardData.ordersCount}
      />
      <GreetingCard firstName={firstName} greeting={getTimeBasedGreeting()} />
      <SearchBar />
      <View className="mb-4" />
    </View>
  );

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isProductsLoading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas }}>
        {renderHeader()}
        <ProductGridLoader />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListHeaderComponent={renderHeader}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 24 }}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListFooterComponent={<View className="h-28" />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
