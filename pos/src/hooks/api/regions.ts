import { useMedusaSdk } from '@/contexts/auth';
import { queryKeysFactory, UseQueryOptionsWrapper } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import { AdminRegion, AdminRegionFilters, AdminRegionListResponse } from '@medusajs/types';
import {
  InfiniteData,
  QueryKey,
  UndefinedInitialDataInfiniteOptions,
  useInfiniteQuery,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

const REGIONS_QUERY_KEY = 'regions';
export const regionsQueryKeys = queryKeysFactory(REGIONS_QUERY_KEY);

const PER_PAGE = 20;

export const useRegion = (
  id: string,
  query?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<{ region: AdminRegion }, FetchError, { region: AdminRegion }, QueryKey>,
    'queryFn' | 'queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  const { data, ...rest } = useQuery({
    queryKey: regionsQueryKeys.detail(id, query),
    queryFn: async () => sdk.admin.region.retrieve(id, query),
    ...options,
  });

  return { ...data, ...rest };
};

export const useRegions = (
  query?: Omit<AdminRegionFilters, 'limit' | 'offset'>,
  limit = PER_PAGE,
  options?: Omit<
    UndefinedInitialDataInfiniteOptions<
      AdminRegionListResponse,
      unknown,
      InfiniteData<AdminRegionListResponse>,
      readonly unknown[],
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'
  >
) => {
  const sdk = useMedusaSdk();
  return useInfiniteQuery({
    queryKey: regionsQueryKeys.list(query),
    queryFn: async ({ pageParam = 1 }) => {
      return sdk.admin.region.list({
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
