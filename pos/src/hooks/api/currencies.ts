import { useMedusaSdk } from '@/contexts/auth';
import { queryKeysFactory } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import {
  AdminCurrencyListParams,
  AdminCurrencyListResponse,
  AdminCurrencyResponse,
} from '@medusajs/types';
import {
  InfiniteData,
  QueryKey,
  UndefinedInitialDataInfiniteOptions,
  useInfiniteQuery,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

const CURRENCIES_QUERY_KEY = 'currencies';
export const currenciesQueryKeys = queryKeysFactory(CURRENCIES_QUERY_KEY);

const PER_PAGE = 20;

export const useCurrencies = (
  query?: Omit<AdminCurrencyListParams, 'limit' | 'offset'>,
  limit = PER_PAGE,
  options?: Omit<
    UndefinedInitialDataInfiniteOptions<
      AdminCurrencyListResponse,
      unknown,
      InfiniteData<AdminCurrencyListResponse>,
      readonly unknown[],
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'
  >
) => {
  const sdk = useMedusaSdk();

  return useInfiniteQuery({
    queryKey: currenciesQueryKeys.list(query),
    queryFn: async ({ pageParam = 1 }) => {
      return sdk.admin.currency.list({
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

export const useCurrency = (
  id: string,
  query?: Omit<AdminCurrencyListParams, 'limit' | 'offset'>,
  options?: Omit<
    UseQueryOptions<AdminCurrencyResponse, FetchError, AdminCurrencyResponse, QueryKey>,
    'queryFn' | 'queryKey'
  >
) => {
  const sdk = useMedusaSdk();

  return useQuery({
    queryKey: currenciesQueryKeys.detail(id),
    queryFn: () => sdk.admin.currency.retrieve(id, query),
    ...options,
  });
};
