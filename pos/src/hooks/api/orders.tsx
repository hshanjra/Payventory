import { useMedusaSdk } from '@/contexts/auth';
import { queryClient } from '@/lib/query-client';
import { queryKeysFactory, TQueryKey } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import {
  AdminOrderChangesResponse,
  AdminOrderFilters,
  AdminOrderLineItemsListResponse,
  AdminOrderListResponse,
  AdminOrderResponse,
  AdminUpdateOrder,
} from '@medusajs/types';
import {
  InfiniteData,
  QueryKey,
  UndefinedInitialDataInfiniteOptions,
  useInfiniteQuery,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

const ORDERS_QUERY_KEY = 'orders' as const;
const _orderKeys = queryKeysFactory(ORDERS_QUERY_KEY) as TQueryKey<'orders'> & {
  preview: (orderId: string) => any;
  changes: (orderId: string) => any;
  lineItems: (orderId: string) => any;
};

_orderKeys.preview = function (id: string) {
  return [this.detail(id), 'preview'];
};

_orderKeys.changes = function (id: string) {
  return [this.detail(id), 'changes'];
};

_orderKeys.lineItems = function (id: string) {
  return [this.detail(id), 'lineItems'];
};

export const ordersQueryKeys = _orderKeys;

const PER_PAGE = 20;

export const useOrder = (
  id: string,
  query?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<AdminOrderResponse, FetchError, AdminOrderResponse, QueryKey>,
    'queryFn' | 'queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.order.retrieve(id, query),
    queryKey: ordersQueryKeys.detail(id, query),
    ...options,
  });

  return { ...data, ...rest };
};

export const useUpdateOrder = (
  id: string,
  options?: UseMutationOptions<AdminOrderResponse, FetchError, AdminUpdateOrder>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: (payload: AdminUpdateOrder) => sdk.admin.order.update(id, payload),
    onSuccess: (data: any, variables: any, onMutateResult, context: any) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.changes(id),
      });

      // TODO: enable when needed
      // queryClient.invalidateQueries({
      //   queryKey: ordersQueryKeys.lists(),
      // })

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useOrders = (
  query?: Omit<AdminOrderFilters, 'limit' | 'offset'>,
  limit = PER_PAGE,
  options?: Omit<
    UndefinedInitialDataInfiniteOptions<
      AdminOrderListResponse,
      unknown,
      InfiniteData<AdminOrderListResponse>,
      readonly unknown[],
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'
  >
) => {
  const sdk = useMedusaSdk();

  return useInfiniteQuery({
    queryKey: ordersQueryKeys.list(query),
    queryFn: async ({ pageParam = 1 }) => {
      return sdk.admin.order.list({
        ...query,
        limit,
        offset: (pageParam - 1) * limit,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextPage = (lastPage.offset + lastPage.limit) / limit + 1;
      return lastPage.count > lastPage.offset + lastPage.limit ? nextPage : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const prevPage = (firstPage.offset + firstPage.limit) / limit - 1;
      return prevPage >= 1 ? prevPage : undefined;
    },
    ...options,
  });
};

export const useOrderChanges = (
  id: string,
  options?: Omit<
    UseQueryOptions<AdminOrderChangesResponse, FetchError, AdminOrderChangesResponse, QueryKey>,
    'queryFn' | 'queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  return useQuery({
    queryFn: () => sdk.admin.order.listChanges(id),
    queryKey: ordersQueryKeys.changes(id),
    ...options,
  });
};

export const useOrderLineItems = (
  id: string,
  query?: Record<string, string | number>,
  options?: Omit<
    UseQueryOptions<
      AdminOrderLineItemsListResponse,
      FetchError,
      AdminOrderLineItemsListResponse,
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  return useQuery({
    queryFn: () => sdk.admin.order.listLineItems(id, query),
    queryKey: ordersQueryKeys.lineItems(id),
    ...options,
  });
};
