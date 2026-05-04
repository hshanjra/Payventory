import { useMedusaSdk } from '@/contexts/auth';
import { queryKeysFactory } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import {
  AdminSalesChannelListParams,
  AdminSalesChannelListResponse,
  AdminSalesChannelResponse,
} from '@medusajs/types';
import {
  InfiniteData,
  QueryKey,
  UndefinedInitialDataInfiniteOptions,
  useInfiniteQuery,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

const SALES_CHANNELS_QUERY_KEY = 'sales-channels';
export const salesChannelsQueryKeys = queryKeysFactory(SALES_CHANNELS_QUERY_KEY);

const PER_PAGE = 20;

export const useSalesChannel = (
  id: string,
  options?: Omit<
    UseQueryOptions<AdminSalesChannelResponse, FetchError, AdminSalesChannelResponse, QueryKey>,
    'queryFn' | 'queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  return useQuery({
    queryKey: salesChannelsQueryKeys.detail(id),
    queryFn: async () => sdk.admin.salesChannel.retrieve(id),
    ...options,
  });
};

export const useSalesChannels = (
  query?: Omit<AdminSalesChannelListParams, 'limit' | 'offset'>,
  limit = PER_PAGE,
  options?: Omit<
    UndefinedInitialDataInfiniteOptions<
      AdminSalesChannelListResponse,
      unknown,
      InfiniteData<AdminSalesChannelListResponse>,
      readonly unknown[],
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'
  >
) => {
  const sdk = useMedusaSdk();

  return useInfiniteQuery({
    queryKey: salesChannelsQueryKeys.list(query),
    queryFn: async ({ pageParam = 1 }) => {
      return sdk.admin.salesChannel.list({
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
