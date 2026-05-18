import { useMedusaSdk } from '@/contexts/auth';
import { queryKeysFactory } from '@/lib/query-keys-factory';
import {
  AdminCreatePromotion,
  AdminGetPromotionsParams,
  AdminPromotionListResponse,
  AdminPromotionResponse,
  AdminUpdatePromotion,
} from '@medusajs/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
  UndefinedInitialDataInfiniteOptions,
  InfiniteData,
} from '@tanstack/react-query';

const PROMOTIONS_QUERY_KEY = 'promotions';

const promotionQueryKeys = queryKeysFactory(PROMOTIONS_QUERY_KEY);

export const usePromotions = (
  query?: Omit<AdminGetPromotionsParams, 'limit' | 'offset'>,
  limit = 50,
  options?: Omit<
    UndefinedInitialDataInfiniteOptions<
      AdminPromotionListResponse,
      unknown,
      InfiniteData<AdminPromotionListResponse>,
      readonly unknown[],
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'
  >
) => {
  const sdk = useMedusaSdk();

  return useInfiniteQuery({
    queryKey: promotionQueryKeys.list(query),
    queryFn: async ({ pageParam = 1 }) => {
      return await sdk.admin.promotion.list({
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

export const useCreatePromotion = (
  options?: UseMutationOptions<AdminPromotionResponse, Error, AdminCreatePromotion, unknown>
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      return await sdk.admin.promotion.create(payload);
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: promotionQueryKeys.all });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdatePromotion = (
  id: string,
  options?: UseMutationOptions<AdminPromotionResponse, Error, AdminUpdatePromotion, unknown>
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      return await sdk.admin.promotion.update(id, payload);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: promotionQueryKeys.all });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};
