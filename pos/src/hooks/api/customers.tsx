import { useMedusaSdk } from '@/contexts/auth';
import { queryKeysFactory } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import {
  AdminCreateCustomer,
  AdminCustomer,
  AdminCustomerDeleteResponse,
  AdminCustomerFilters,
  AdminCustomerListResponse,
  AdminCustomerResponse,
  AdminUpdateCustomer,
  SelectParams,
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

const CUSTOMERS_QUERY_KEY = 'customers';
export const customersQueryKeys = queryKeysFactory(CUSTOMERS_QUERY_KEY);

const PER_PAGE = 20;

export const useCustomers = (
  query?: Omit<AdminCustomerFilters, 'limit' | 'offset'>,
  limit = PER_PAGE,
  options?: Omit<
    UndefinedInitialDataInfiniteOptions<
      AdminCustomerListResponse,
      unknown,
      InfiniteData<AdminCustomerListResponse>,
      readonly unknown[],
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'
  >
) => {
  const sdk = useMedusaSdk();
  return useInfiniteQuery({
    queryKey: customersQueryKeys.list(query),
    queryFn: async ({ pageParam = 1 }) => {
      return sdk.admin.customer.list({
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

export const useCustomer = (
  id: string,
  query?: SelectParams,
  options?: Omit<UseQueryOptions<AdminCustomerResponse, FetchError>, 'queryFn' | 'queryKey'>
) => {
  const sdk = useMedusaSdk();

  return useQuery({
    queryKey: customersQueryKeys.detail(id),
    queryFn: () => sdk.admin.customer.retrieve(id, query),
    ...options,
  });
};

export const useCreateCustomer = (
  options?: UseMutationOptions<{ customer: AdminCustomer }, FetchError, AdminCreateCustomer>
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminCreateCustomer) => sdk.admin.customer.create(payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({
        queryKey: customersQueryKeys.list(),
        exact: false,
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateCustomer = (
  id: string,
  options?: UseMutationOptions<{ customer: AdminCustomer }, FetchError, AdminUpdateCustomer>
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => sdk.admin.customer.update(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: customersQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: customersQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDeleteCustomer = (
  id: string,
  options?: UseMutationOptions<AdminCustomerDeleteResponse, FetchError, void>
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sdk.admin.customer.delete(id),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: customersQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: customersQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};
