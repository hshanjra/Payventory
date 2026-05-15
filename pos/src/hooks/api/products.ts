import { useMedusaSdk } from '@/contexts/auth';
import { queryKeysFactory, UseQueryOptionsWrapper } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import {
  AdminProductListParams,
  AdminProductListResponse,
  AdminProductTagListParams,
  AdminProductTagListResponse,
  AdminProductVariantListResponse,
} from '@medusajs/types';
import { BaseProductVariantParams } from '@medusajs/types/dist/http/product/common';
import {
  InfiniteData,
  QueryKey,
  UndefinedInitialDataInfiniteOptions,
  useInfiniteQuery,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

const PRODUCTS_QUERY_KEY = 'products';
export const productsQueryKeys = queryKeysFactory(PRODUCTS_QUERY_KEY);

const PRODUCT_VARIANT_QUERY_KEY = 'product_variant';
export const productVariantQueryKeys = queryKeysFactory(PRODUCT_VARIANT_QUERY_KEY);

const PRODUCT_TAGS_QUERY_KEY = 'product_tags';
export const productTagsQueryKeys = queryKeysFactory(PRODUCT_TAGS_QUERY_KEY);

const PER_PAGE = 20;

export const useProducts = (
  query?: Omit<AdminProductListParams, 'limit' | 'offset' | 'tags'> & {
    tag_id?: string | string[];
  },
  limit = PER_PAGE,
  options?: Omit<
    UndefinedInitialDataInfiniteOptions<
      AdminProductListResponse,
      unknown,
      InfiniteData<AdminProductListResponse>,
      readonly unknown[],
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'
  >
) => {
  const sdk = useMedusaSdk();

  return useInfiniteQuery({
    queryKey: productsQueryKeys.list(query),
    queryFn: async ({ pageParam = 1 }) => {
      return sdk.admin.product.list({
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

export const useProductVariants = (
  id: string,
  query?: BaseProductVariantParams,
  limit = PER_PAGE,
  options?: Omit<
    UndefinedInitialDataInfiniteOptions<
      AdminProductVariantListResponse,
      unknown,
      InfiniteData<AdminProductVariantListResponse>,
      readonly unknown[],
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'
  >
) => {
  const sdk = useMedusaSdk();

  return useInfiniteQuery({
    queryKey: productVariantQueryKeys.list(query),
    queryFn: async ({ pageParam = 1 }) => {
      return await sdk.admin.product.listVariants(id, {
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

export const useProductTags = (
  query?: Omit<AdminProductTagListParams, 'limit' | 'offset'>,
  limit = PER_PAGE,
  options?: Omit<
    UndefinedInitialDataInfiniteOptions<
      AdminProductTagListResponse,
      unknown,
      InfiniteData<AdminProductTagListResponse>,
      readonly unknown[],
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'
  >
) => {
  const sdk = useMedusaSdk();
  return useInfiniteQuery({
    queryKey: productTagsQueryKeys.list(query),
    queryFn: async ({ pageParam = 1 }) => {
      return sdk.admin.productTag.list({
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
