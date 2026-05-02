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
import { QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query';

const PRODUCTS_QUERY_KEY = 'products';
export const productsQueryKeys = queryKeysFactory(PRODUCTS_QUERY_KEY);

const PRODUCT_VARIANT_QUERY_KEY = 'product_variant';
export const productVariantQueryKeys = queryKeysFactory(PRODUCT_VARIANT_QUERY_KEY);

const PRODUCT_TAGS_QUERY_KEY = 'product_tags';
export const productTagsQueryKeys = queryKeysFactory(PRODUCT_TAGS_QUERY_KEY);

export const useProducts = (
  query?: AdminProductListParams,
  options?: Omit<UseQueryOptionsWrapper<AdminProductListResponse>, 'queryKey' | 'queryFn'>
) => {
  const sdk = useMedusaSdk();
  return useQuery({
    queryKey: productsQueryKeys.list(query),
    queryFn: () => sdk.admin.product.list(query),
    ...options,
  });
};

export const useProductVariants = (
  query?: Record<string, any>,
  options?: UseQueryOptions<
    AdminProductVariantListResponse,
    FetchError,
    AdminProductVariantListResponse,
    QueryKey
  >
) => {
  const sdk = useMedusaSdk();
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.productVariant.list(query),
    queryKey: productVariantQueryKeys.list(query),
    ...options,
  });

  return { ...data, ...rest };
};

export const useProductTags = (
  query?: AdminProductTagListParams,
  options?: Omit<UseQueryOptionsWrapper<AdminProductTagListResponse>, 'queryKey' | 'queryFn'>
) => {
  const sdk = useMedusaSdk();
  return useQuery({
    queryKey: productTagsQueryKeys.list(query),
    queryFn: () => sdk.admin.productTag.list(query),
    ...options,
  });
};
