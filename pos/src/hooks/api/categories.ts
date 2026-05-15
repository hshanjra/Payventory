import { useMedusaSdk } from '@/contexts/auth';
import { queryKeysFactory } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import {
  AdminCreateProductCategory,
  AdminProductCategoryListParams,
  AdminProductCategoryListResponse,
  AdminProductCategoryResponse,
  AdminUpdateProductCategory,
} from '@medusajs/types';
import {
  InfiniteData,
  QueryKey,
  UndefinedInitialDataInfiniteOptions,
  useInfiniteQuery,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
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
  options?: Omit<
    UndefinedInitialDataInfiniteOptions<
      AdminProductCategoryListResponse,
      unknown,
      InfiniteData<AdminProductCategoryListResponse>,
      readonly unknown[],
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'
  >
) => {
  const sdk = useMedusaSdk();

  return useInfiniteQuery({
    queryKey: categoriesQueryKeys.list({ limit, ...query }),
    queryFn: async ({ pageParam = 1 }) => {
      return sdk.admin.productCategory.list({
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

export const useCreateProductCategory = (
  options?: UseMutationOptions<AdminProductCategoryResponse, FetchError, AdminCreateProductCategory>
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();

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
  const queryClient = useQueryClient();

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
  const queryClient = useQueryClient();

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
