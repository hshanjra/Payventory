import { useMedusaSdk } from '@/contexts/auth';
import { queryKeysFactory, UseQueryOptionsWrapper } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import {
  AdminCurrencyListParams,
  AdminCurrencyListResponse,
  AdminCurrencyResponse,
} from '@medusajs/types';
import { QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query';

const CURRENCIES_QUERY_KEY = 'currencies';
export const currenciesQueryKeys = queryKeysFactory(CURRENCIES_QUERY_KEY);

const sdk = useMedusaSdk();

export const useCurrencies = (
  query?: AdminCurrencyListParams,
  limit = 20,
  options?: Omit<
    UseQueryOptions<AdminCurrencyListResponse, FetchError, AdminCurrencyListResponse, QueryKey>,
    'queryFn' | 'queryKey'
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.currency.list({ limit, ...query }),
    queryKey: currenciesQueryKeys.list({ limit, ...query }),
    ...options,
  });

  return { ...data, ...rest };
};

export const useCurrency = (
  id: string,
  query?: Omit<AdminCurrencyListParams, 'limit' | 'offset'>,
  options?: Omit<
    UseQueryOptions<AdminCurrencyResponse, FetchError, AdminCurrencyResponse, QueryKey>,
    'queryFn' | 'queryKey'
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: currenciesQueryKeys.detail(id),
    queryFn: () => sdk.admin.currency.retrieve(id, query),
    ...options,
  });

  return { ...data, ...rest };
};
