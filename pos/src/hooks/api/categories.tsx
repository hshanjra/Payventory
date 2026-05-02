import { useMedusaSdk } from '@/contexts/auth';
import { queryClient } from '@/lib/query-client';
import { queryKeysFactory, UseQueryOptionsWrapper } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import {
  AdminCreateProductCategory,
  AdminProductCategoryListParams,
  AdminProductCategoryListResponse,
  AdminProductCategoryResponse,
  AdminUpdateProductCategory,
} from '@medusajs/types';
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

const CATEGORIES_QUERY_KEY = 'categories';
export const categoriesQueryKeys = queryKeysFactory(CATEGORIES_QUERY_KEY);

export const useProductCategory = (
  id: string,
  options?: Omit<
    UseQueryOptions<
      AdminProductCategoryResponse,
      FetchError,
      AdminProductCategoryResponse,
      QueryKey
    >,
    'queryKey' | 'queryFn'
  >
) => {
  const sdk = useMedusaSdk();
  return useQuery({
    queryKey: categoriesQueryKeys.detail(id),
    queryFn: () => sdk.admin.productCategory.retrieve(id),
    ...options,
  });
};

export const useProductCategories = (
  query?: Omit<AdminProductCategoryListParams, 'limit' | 'offset'>,
  limit = 20,
  options?: Omit<UseQueryOptionsWrapper<AdminProductCategoryListResponse>, 'queryKey' | 'queryFn'>
) => {
  const sdk = useMedusaSdk();
  return useQuery({
    queryKey: categoriesQueryKeys.list({ limit, ...query }),
    queryFn: () => sdk.admin.productCategory.list({ limit, ...query }),
    ...options,
  });
};

export const useCreateProductCategory = (
  options?: UseMutationOptions<AdminProductCategoryResponse, FetchError, AdminCreateProductCategory>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: (payload) => sdk.admin.productCategory.create(payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: categoriesQueryKeys.list(),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateProductCategory = (
  id: string,
  options?: UseMutationOptions<AdminProductCategoryResponse, FetchError, AdminUpdateProductCategory>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: (payload) => sdk.admin.productCategory.update(id, payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: categoriesQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: categoriesQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDeleteProductCategory = (
  id: string,
  options?: UseMutationOptions<void, FetchError, void>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: async () => {
      await sdk.admin.productCategory.delete(id);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: categoriesQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: categoriesQueryKeys.lists(),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};
