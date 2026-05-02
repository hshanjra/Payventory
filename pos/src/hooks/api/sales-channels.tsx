import { useMedusaSdk } from '@/contexts/auth';
import { queryKeysFactory } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import {
  AdminSalesChannelListParams,
  AdminSalesChannelListResponse,
  AdminSalesChannelResponse,
} from '@medusajs/types';
import { QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query';

const SALES_CHANNELS_QUERY_KEY = 'sales-channels';
export const salesChannelsQueryKeys = queryKeysFactory(SALES_CHANNELS_QUERY_KEY);

export const useSalesChannel = (
  id: string,
  options?: Omit<
    UseQueryOptions<AdminSalesChannelResponse, FetchError, AdminSalesChannelResponse, QueryKey>,
    'queryFn' | 'queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  const { data, ...rest } = useQuery({
    queryKey: salesChannelsQueryKeys.detail(id),
    queryFn: async () => sdk.admin.salesChannel.retrieve(id),
    ...options,
  });

  return { ...data, ...rest };
};

export const useSalesChannels = (
  query?: AdminSalesChannelListParams,
  options?: Omit<
    UseQueryOptions<
      AdminSalesChannelListResponse,
      FetchError,
      AdminSalesChannelListResponse,
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.salesChannel.list({ ...query }),
    queryKey: salesChannelsQueryKeys.list(query),
    ...options,
  });

  return { ...data, ...rest };
};
