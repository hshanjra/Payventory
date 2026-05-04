import { useMedusaSdk } from '@/contexts/auth';
import { queryKeysFactory } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import {
  AdminStockLocationListResponse,
  AdminStockLocationListParams,
  AdminStockLocationResponse,
} from '@medusajs/types';
import { SelectParams } from '@medusajs/types';
import {
  InfiniteData,
  QueryKey,
  UndefinedInitialDataInfiniteOptions,
  useInfiniteQuery,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

const STOCK_LOCATIONS_QUERY_KEY = 'stock_locations';
export const stockLocationsQueryKeys = queryKeysFactory(STOCK_LOCATIONS_QUERY_KEY);

const PER_PAGE = 20;

export const useStockLocation = (
  id: string,
  query?: Omit<SelectParams, 'limit' | 'offset'>,
  options?: Omit<
    UseQueryOptions<AdminStockLocationResponse, FetchError, AdminStockLocationResponse, QueryKey>,
    'queryKey' | 'queryFn'
  >
) => {
  const sdk = useMedusaSdk();
  return useQuery({
    queryFn: () => sdk.admin.stockLocation.retrieve(id, query),
    queryKey: stockLocationsQueryKeys.detail(id, query),
    ...options,
  });
};

export const useStockLocations = (
  query?: AdminStockLocationListParams,
  limit = PER_PAGE,
  options?: Omit<
    UndefinedInitialDataInfiniteOptions<
      AdminStockLocationListResponse,
      FetchError,
      InfiniteData<AdminStockLocationListResponse>,
      QueryKey,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'
  >
) => {
  const sdk = useMedusaSdk();
  return useInfiniteQuery({
    queryKey: stockLocationsQueryKeys.list(query),
    queryFn: async ({ pageParam = 1 }) => {
      return await sdk.admin.stockLocation.list({
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
