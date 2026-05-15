import { useMedusaSdk } from '@/contexts/auth';
import { queryKeysFactory } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import {
  AdminCreatePaymentCollection,
  AdminDeletePaymentCollectionResponse,
  AdminMarkPaymentCollectionAsPaid,
  AdminPaymentCollectionResponse,
} from '@medusajs/types';
import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { ordersQueryKeys } from './orders';

const PAYMENT_COLLECTION_QUERY_KEY = 'payment-collection';
export const paymentCollectionQueryKeys = queryKeysFactory(PAYMENT_COLLECTION_QUERY_KEY);

export const useCreatePaymentCollection = (
  orderId: string,
  options?: Omit<
    UseMutationOptions<AdminPaymentCollectionResponse, FetchError, AdminCreatePaymentCollection>,
    'mutationKey' | 'mutationFn'
  >
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => sdk.admin.paymentCollection.create(payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details(),
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId),
      });

      queryClient.invalidateQueries({
        queryKey: paymentCollectionQueryKeys.all,
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useMarkPaymentCollectionAsPaid = (
  orderId: string,
  paymentCollectionId: string,
  options?: Omit<
    UseMutationOptions<
      AdminPaymentCollectionResponse,
      FetchError,
      AdminMarkPaymentCollectionAsPaid
    >,
    'mutationKey' | 'mutationFn'
  >
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => sdk.admin.paymentCollection.markAsPaid(paymentCollectionId, payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details(),
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId),
      });

      queryClient.invalidateQueries({
        queryKey: paymentCollectionQueryKeys.all,
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDeletePaymentCollection = (
  orderId: string,
  options?: Omit<
    UseMutationOptions<AdminDeletePaymentCollectionResponse, FetchError, string>,
    'mutationKey' | 'mutationFn'
  >
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sdk.admin.paymentCollection.delete(id),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details(),
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId),
      });

      queryClient.invalidateQueries({
        queryKey: paymentCollectionQueryKeys.all,
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};
