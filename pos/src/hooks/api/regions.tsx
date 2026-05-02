import { useMedusaSdk } from '@/contexts/auth';
import { queryKeysFactory, UseQueryOptionsWrapper } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import { AdminRegion, AdminRegionListResponse } from '@medusajs/types';
import { QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query';

const REGIONS_QUERY_KEY = 'regions';
export const regionsQueryKeys = queryKeysFactory(REGIONS_QUERY_KEY);

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
  query?: Record<string, any>,
  options?: Omit<UseQueryOptionsWrapper<AdminRegionListResponse>, 'queryFn' | 'queryKey'>
) => {
  const sdk = useMedusaSdk();
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.region.list(query),
    queryKey: regionsQueryKeys.list(query),
    ...options,
  });

  return { ...data, ...rest };
};
