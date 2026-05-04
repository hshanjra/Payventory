import * as SecureStore from 'expo-secure-store';
import {
  AdminAddDraftOrderItems,
  AdminAddDraftOrderPromotions,
  AdminCustomer,
  AdminDraftOrderListParams,
  AdminDraftOrderParams,
  AdminDraftOrderPreviewResponse,
  AdminDraftOrderResponse,
  AdminOrderResponse,
  AdminRemoveDraftOrderPromotions,
  AdminUpdateDraftOrder,
  AdminUpdateDraftOrderItem,
} from '@medusajs/types';
import {
  MutationOptions,
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useMedusaSdk } from '@/contexts/auth';
import { FetchError } from '@medusajs/js-sdk';
import { useCallback } from 'react';
import { usePosSettings } from '@/contexts/settings';

const DRAFT_ORDER_QUERY_KEY = 'draft_order';

const DRAFT_ORDER_ID_STORAGE_KEY = 'draft_order_id';
export const DRAFT_ORDER_DEFAULT_CUSTOMER_EMAIL = 'noreply+pos-guest@djf.in';

const useGetOrSetDefaultCustomer = () => {
  const sdk = useMedusaSdk();

  return useCallback(async () => {
    const existingCustomer = await sdk.admin.customer.list({
      email: DRAFT_ORDER_DEFAULT_CUSTOMER_EMAIL,
      fields: 'id',
      limit: 1,
    });

    if (existingCustomer.customers.length > 0) {
      return existingCustomer.customers[0].id;
    }

    const newCustomer = await sdk.admin.customer.create(
      {
        email: DRAFT_ORDER_DEFAULT_CUSTOMER_EMAIL,
      },
      {
        fields: 'id',
      }
    );

    return newCustomer.customer.id;
  }, [sdk]);
};

const useGetOrSetDraftOrderId = () => {
  const sdk = useMedusaSdk();
  const settings = usePosSettings();
  const getOrSetDefaultCustomer = useGetOrSetDefaultCustomer();

  return useCallback(async () => {
    const draftOrderId = await SecureStore.getItemAsync(DRAFT_ORDER_ID_STORAGE_KEY);

    if (draftOrderId) {
      return draftOrderId;
    }

    if (!settings.defaults?.region?.id) {
      throw new Error('Region ID is not set in settings');
    }

    if (!settings.defaults.salesChannel?.id) {
      throw new Error('Sales Channel ID is not set in settings');
    }

    const defaultCustomerId = await getOrSetDefaultCustomer();

    const newDraftOrder = await sdk.admin.draftOrder.create({
      region_id: settings.defaults?.region?.id,
      sales_channel_id: settings.defaults?.salesChannel?.id,
      customer_id: defaultCustomerId,
    });

    await SecureStore.setItemAsync(DRAFT_ORDER_ID_STORAGE_KEY, newDraftOrder.draft_order.id);

    return newDraftOrder.draft_order.id;
  }, [
    getOrSetDefaultCustomer,
    sdk,
    settings.defaults?.region?.id,
    settings.defaults?.salesChannel?.id,
  ]);
};

export const useDraftOrderOrOrder = (
  id: string,
  query?: AdminDraftOrderListParams,
  options?: Omit<
    UseQueryOptions<
      AdminDraftOrderResponse | AdminOrderResponse,
      FetchError,
      AdminDraftOrderResponse | AdminOrderResponse,
      QueryKey
    >,
    'queryFn | queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  return useQuery({
    queryKey: [DRAFT_ORDER_QUERY_KEY, id],
    queryFn: async () => {
      return sdk.admin.draftOrder.retrieve(id, query).catch(async () => {
        return sdk.admin.order.retrieve(id, query);
      });
    },
    ...options,
  });
};

export const useCurrentDraftOrder = () => {
  const sdk = useMedusaSdk();

  return useQuery({
    queryKey: [DRAFT_ORDER_QUERY_KEY],
    queryFn: async () => {
      const draftOrderId = await SecureStore.getItemAsync(DRAFT_ORDER_ID_STORAGE_KEY);

      if (!draftOrderId) {
        return null;
      }

      return sdk.admin.draftOrder.retrieve(draftOrderId, {
        fields:
          '+tax_total,+discount_total,+subtotal,+total,+items.variant.options.*,+items.variant.options.option.*,+items.variant.inventory_quantity,+customer.*',
      });
    },
  });
};

export const useAddToDraftOrder = (
  options?: UseMutationOptions<AdminDraftOrderPreviewResponse, FetchError, AdminAddDraftOrderItems>
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();
  const getOrSetDraftOrderId = useGetOrSetDraftOrderId();

  return useMutation({
    mutationKey: [DRAFT_ORDER_QUERY_KEY, 'items', 'add'],
    mutationFn: async (payload) => {
      const draftOrderId = await getOrSetDraftOrderId();
      await sdk.admin.draftOrder.beginEdit(draftOrderId);
      await sdk.admin.draftOrder.addItems(draftOrderId, payload).catch(async (error) => {
        await sdk.admin.draftOrder.cancelEdit(draftOrderId);
        throw error;
      });
      return sdk.admin.draftOrder.confirmEdit(draftOrderId);
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [DRAFT_ORDER_QUERY_KEY],
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useAddDraftOrderPromotions = (
  options?: Omit<
    MutationOptions<AdminDraftOrderPreviewResponse, FetchError, AdminAddDraftOrderPromotions>,
    'mutationKey' | 'mutationFn'
  >
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();
  const getOrSetDraftOrderId = useGetOrSetDraftOrderId();

  return useMutation({
    mutationFn: async (payload) => {
      const draftOrderId = await getOrSetDraftOrderId();
      await sdk.admin.draftOrder.beginEdit(draftOrderId);
      await sdk.admin.draftOrder.addPromotions(draftOrderId, payload).catch(async (error) => {
        await sdk.admin.draftOrder.cancelEdit(draftOrderId);
        throw error;
      });
      return sdk.admin.draftOrder.confirmEdit(draftOrderId);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [DRAFT_ORDER_QUERY_KEY],
        exact: false,
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useRemoveDraftOrderPromotions = (
  options?: Omit<
    UseMutationOptions<
      AdminDraftOrderPreviewResponse,
      Error,
      AdminRemoveDraftOrderPromotions,
      unknown
    >,
    'mutationKey' | 'mutationFn'
  >
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();
  const getOrSetDraftOrderId = useGetOrSetDraftOrderId();

  return useMutation({
    mutationFn: async (payload) => {
      const draftOrderId = await getOrSetDraftOrderId();
      await sdk.admin.draftOrder.beginEdit(draftOrderId);
      await sdk.admin.draftOrder.removePromotions(draftOrderId, payload).catch(async (error) => {
        await sdk.admin.draftOrder.cancelEdit(draftOrderId);
        throw error;
      });
      return sdk.admin.draftOrder.confirmEdit(draftOrderId);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [DRAFT_ORDER_QUERY_KEY],
        exact: false,
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDraftOrderPromotions = (codes: string[]) => {
  const sdk = useMedusaSdk();

  return useQuery({
    queryKey: ['promotions', ...codes],
    queryFn: async () => {
      return sdk.admin.promotion.list({
        code: codes,
        limit: codes.length,
      });
    },
    enabled: codes.length > 0,
  });
};

export const useConvertDraftOrder = (
  id: string,
  options?: UseMutationOptions<AdminOrderResponse, FetchError, AdminDraftOrderParams>
) => {
  const sdk = useMedusaSdk();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sdk.admin.draftOrder.convertToOrder(id),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [DRAFT_ORDER_QUERY_KEY],
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateDraftOrder = (
  options?: UseMutationOptions<AdminDraftOrderResponse, FetchError, AdminUpdateDraftOrder>
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();
  const getOrSetDraftOrderId = useGetOrSetDraftOrderId();

  return useMutation({
    mutationFn: async (payload) => {
      const draftOrderId = await getOrSetDraftOrderId();

      return await sdk.admin.draftOrder.update(draftOrderId, payload);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [DRAFT_ORDER_QUERY_KEY],
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateDraftOrderCustomer = (
  options?: Omit<
    UseMutationOptions<AdminDraftOrderPreviewResponse, Error, AdminCustomer | undefined, unknown>,
    'mutationKey' | 'mutationFn'
  >
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();
  const getOrSetDraftOrderId = useGetOrSetDraftOrderId();

  return useMutation({
    mutationKey: [DRAFT_ORDER_QUERY_KEY, 'customer', 'update'],
    mutationFn: async (data) => {
      const draftOrderId = await getOrSetDraftOrderId();
      await sdk.admin.draftOrder.beginEdit(draftOrderId);
      await sdk.admin.draftOrder
        .update(draftOrderId, { customer_id: data?.id, email: data?.email })
        .catch(async (error) => {
          await sdk.admin.draftOrder.cancelEdit(draftOrderId);
          throw error;
        });
      return sdk.admin.draftOrder.confirmEdit(draftOrderId);
    },
    ...options,
    onMutate(variables, context) {
      options?.onMutate?.(variables, context);

      const cachedDraftOrder = queryClient.getQueryData<AdminDraftOrderResponse>([
        DRAFT_ORDER_QUERY_KEY,
      ]);

      if (cachedDraftOrder) {
        const updatedDraftOrder: AdminDraftOrderResponse = {
          ...cachedDraftOrder,
          draft_order: {
            ...cachedDraftOrder.draft_order,
            email: variables?.email ?? null,
            customer_id: variables?.id ?? null,
            customer: variables,
          },
        };

        queryClient.setQueryData([DRAFT_ORDER_QUERY_KEY], updatedDraftOrder);

        return { previousDraftOrder: cachedDraftOrder };
      }

      return { previousDraftOrder: undefined };
    },
    onError(error, variables, onMutateResult, context) {
      queryClient.setQueryData([DRAFT_ORDER_QUERY_KEY], onMutateResult?.previousDraftOrder);
      if (queryClient.isMutating({ mutationKey: [DRAFT_ORDER_QUERY_KEY], exact: false }) === 1) {
        queryClient.invalidateQueries({
          queryKey: [DRAFT_ORDER_QUERY_KEY],
          exact: false,
        });
      }

      return options?.onError?.(error, variables, onMutateResult, context);
    },
    onSettled: async (...args) => {
      if (queryClient.isMutating({ mutationKey: [DRAFT_ORDER_QUERY_KEY], exact: false }) === 1) {
        await queryClient.invalidateQueries({
          queryKey: [DRAFT_ORDER_QUERY_KEY],
          exact: false,
        });
      }

      return options?.onSettled?.(...args);
    },
  });
};

const updateChains = new Map<
  string,
  {
    promise: Promise<void>;
    abortController: AbortController;
  }
>();
const debounceTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

class UpdateDraftOrderItemAborted extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpdateDraftOrderItemAborted';
  }
}

export const useUpdateDraftOrderItem = (
  options?: Omit<
    UseMutationOptions<
      void,
      Error,
      { id: string; update: Pick<AdminUpdateDraftOrderItem, 'quantity'> },
      unknown
    >,
    'mutationKey' | 'mutationFn'
  >
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();
  const getOrSetDraftOrderId = useGetOrSetDraftOrderId();

  return useMutation({
    mutationKey: [DRAFT_ORDER_QUERY_KEY, 'items', 'update'],
    mutationFn: async (item: {
      id: string;
      update: Pick<AdminUpdateDraftOrderItem, 'quantity'>;
    }) => {
      // Clear existing timeout for this item
      if (debounceTimeouts.has(item.id)) {
        clearTimeout(debounceTimeouts.get(item.id)!);
        debounceTimeouts.delete(item.id);
      }

      // Cancel any existing update for this item
      const existingChain = updateChains.get(item.id);
      if (existingChain) {
        existingChain.abortController.abort();
      }

      // Create new abort controller for this update
      const abortController = new AbortController();

      // Create a new promise that chains after the existing one (if any)
      const previousPromise = existingChain?.promise ?? Promise.resolve();

      const updatePromise = previousPromise
        .catch(() => {
          // Ignore errors from previous updates in the chain
        })
        .then(async () => {
          // Wait for debounce period
          await new Promise<void>((debounceResolve) => {
            const timeoutId = setTimeout(() => {
              debounceTimeouts.delete(item.id);
              debounceResolve();
            }, 300);

            debounceTimeouts.set(item.id, timeoutId);

            // Handle abortion during debounce
            if (abortController.signal.aborted) {
              clearTimeout(timeoutId);
              debounceTimeouts.delete(item.id);
              throw new UpdateDraftOrderItemAborted(
                `Update for item ${item.id} with ${item.update.quantity} quantity aborted`
              );
            }

            abortController.signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
              debounceTimeouts.delete(item.id);
              debounceResolve(); // Resolve to allow chain to continue
            });
          });

          // Check if aborted after debounce
          if (abortController.signal.aborted) {
            throw new UpdateDraftOrderItemAborted(
              `Update for item ${item.id} with ${item.update.quantity} quantity aborted`
            );
          }

          // Perform the actual update
          const draftOrderId = await getOrSetDraftOrderId();
          await sdk.admin.draftOrder.beginEdit(draftOrderId);

          try {
            await sdk.admin.draftOrder.updateItem(draftOrderId, item.id, item.update);
            await sdk.admin.draftOrder.confirmEdit(draftOrderId);
          } catch (error) {
            await sdk.admin.draftOrder.cancelEdit(draftOrderId);
            throw error;
          }
        })
        .catch((error) => {
          // Only reject if not aborted (aborted updates should resolve silently)
          if (!(error instanceof UpdateDraftOrderItemAborted)) {
            throw error;
          }
        })
        .finally(() => {
          // Clean up chain if this was the latest update
          const currentChain = updateChains.get(item.id);
          if (currentChain?.abortController === abortController) {
            updateChains.delete(item.id);
          }
        });

      // Store the new chain
      updateChains.set(item.id, {
        promise: updatePromise,
        abortController,
      });

      return updatePromise;
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [DRAFT_ORDER_QUERY_KEY],
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDeleteDraftOrder = (
  options?: Omit<UseMutationOptions<void>, 'mutationKey' | 'mutationFn'>
) => {
  const sdk = useMedusaSdk();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const draftOrderId = await SecureStore.getItemAsync(DRAFT_ORDER_ID_STORAGE_KEY);

      if (!draftOrderId) {
        throw new Error('Draft order ID not found');
      }

      await SecureStore.deleteItemAsync(DRAFT_ORDER_ID_STORAGE_KEY);
      await sdk.admin.draftOrder.delete(draftOrderId);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [DRAFT_ORDER_QUERY_KEY],
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useCompleteDraftOrder = (
  id: string,
  options?: Omit<UseMutationOptions<void, Error, void, unknown>, 'mutationKey' | 'mutationFn'>
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();
  const settings = usePosSettings();

  return useMutation({
    mutationKey: [DRAFT_ORDER_QUERY_KEY, id, 'complete'],
    mutationFn: async () => {
      if (!id) {
        throw new Error('Draft order ID is required to complete the order');
      }

      const { draft_order } = await sdk.admin.draftOrder.retrieve(id, {
        fields:
          '+tax_total,+discount_total,+subtotal,+total,+items.variant.options.*,+items.variant.options.option.*,+items.variant.inventory_quantity,+customer.*,+customer.addresses.*',
      });

      const stockLocation = settings.defaults?.stockLocation;

      const billingAddress =
        draft_order.customer?.addresses.find(
          (address) =>
            address.is_default_billing ||
            address.id === draft_order.customer?.default_billing_address_id
        ) || draft_order.customer?.addresses[0];

      await sdk.admin.draftOrder.beginEdit(id);
      await sdk.admin.draftOrder.update(id, {
        billing_address: billingAddress
          ? {
              first_name: billingAddress.first_name ?? undefined,
              last_name: billingAddress.last_name ?? undefined,
              company: billingAddress.company ?? undefined,
              address_1: billingAddress.address_1 ?? undefined,
              address_2: billingAddress.address_2 ?? undefined,
              postal_code: billingAddress.postal_code ?? undefined,
              city: billingAddress.city ?? undefined,
              province: billingAddress.province ?? undefined,
              country_code: billingAddress.country_code ?? undefined,
              phone: billingAddress.phone ?? undefined,
            }
          : undefined,
        shipping_address: stockLocation
          ? {
              company: stockLocation.name,
              address_1: stockLocation.address?.address_1 ?? undefined,
              address_2: stockLocation.address?.address_2 ?? undefined,
              postal_code: stockLocation.address?.postal_code ?? undefined,
              city: stockLocation.address?.city ?? undefined,
              province: stockLocation.address?.province ?? undefined,
              country_code: stockLocation.address?.country_code ?? undefined,
              phone: stockLocation.address?.phone ?? undefined,
            }
          : undefined,
      });
      await sdk.admin.draftOrder.confirmEdit(id);

      await sdk.admin.draftOrder.convertToOrder(id);

      //   TODO: Implement Payment Methods

      await sdk.client.fetch(`/admin/orders/${id}/complete`, {
        method: 'POST',
      });
      await SecureStore.deleteItemAsync(DRAFT_ORDER_ID_STORAGE_KEY);
    },
    ...options,
    onSettled: async (...args) => {
      await queryClient.invalidateQueries({
        queryKey: [DRAFT_ORDER_QUERY_KEY],
        exact: false,
      });

      return options?.onSettled?.(...args);
    },
  });
};
