import { useMedusaSdk } from '@/contexts/auth';
import { queryKeysFactory } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import {
  AdminStockLocationListResponse,
  AdminStockLocationListParams,
  AdminStockLocationResponse,
} from '@medusajs/types';
import { SelectParams } from '@medusajs/types';
import { QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query';

const STOCK_LOCATIONS_QUERY_KEY = 'stock_locations';
export const stockLocationsQueryKeys = queryKeysFactory(STOCK_LOCATIONS_QUERY_KEY);

export const useStockLocation = (
  id: string,
  query?: Omit<SelectParams, 'limit' | 'offset'>,
  options?: Omit<
    UseQueryOptions<AdminStockLocationResponse, FetchError, AdminStockLocationResponse, QueryKey>,
    'queryKey' | 'queryFn'
  >
) => {
  const sdk = useMedusaSdk();
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.stockLocation.retrieve(id, query),
    queryKey: stockLocationsQueryKeys.detail(id, query),
    ...options,
  });

  return { ...data, ...rest };
};

export const useStockLocations = (
  query?: AdminStockLocationListParams,
  options?: Omit<
    UseQueryOptions<
      AdminStockLocationListResponse,
      FetchError,
      AdminStockLocationListResponse,
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.stockLocation.list({ ...query }),
    queryKey: stockLocationsQueryKeys.list(query),
    ...options,
  });

  return { ...data, ...rest };
};
