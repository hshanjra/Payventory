import { useMemo, useCallback, useState } from 'react';
import { useOrders } from '@/hooks/api/orders';
import { useProducts } from '@/hooks/api/products';
import { useAuthenticated } from '@/contexts/auth';
import { usePosSettings } from '@/contexts/settings';
import { useQueryClient } from '@tanstack/react-query';

export function useHomeData() {
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

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    firstName,
    store,
    dashboardData,
    products,
    isProductsLoading,
    refreshing,
    onRefresh,
    onEndReached,
  };
}
