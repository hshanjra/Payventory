import {
  AdminAddDraftOrderItems,
  AdminAddDraftOrderPromotions,
  AdminDraftOrderParams,
  AdminDraftOrderPreviewResponse,
  AdminOrderResponse,
  AdminRemoveDraftOrderPromotions,
  AdminUpdateDraftOrderItem,
} from '@medusajs/types';
import { useMutation, UseMutationOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMedusaSdk } from '@/contexts/auth';
import { FetchError } from '@medusajs/js-sdk';
import { useCallback } from 'react';
import { usePosSettings } from '@/contexts/settings';
import { useAppStore } from '@/store/use-app-store';

const DRAFT_ORDER_QUERY_KEY = 'draft_order';
export const DRAFT_ORDER_DEFAULT_CUSTOMER_EMAIL = 'noreply+pos-guest@djf.in';
export const ROUND_OFF_ITEM_TITLE = 'Round off';

// ─── Concurrency Management ──────────────────────────────────────────────────

let mutationQueue = Promise.resolve();

async function enqueueMutation<T>(mutationFn: () => Promise<T>): Promise<T> {
  const result = mutationQueue.then(mutationFn);
  mutationQueue = result.catch(() => {}).then(() => {});
  return result;
}

async function safeBeginEdit(sdk: any, draftOrderId: string) {
  try {
    await sdk.admin.draftOrder.beginEdit(draftOrderId);
  } catch (error: any) {
    if (error.message?.includes('already has an existing active order change')) {
      try {
        await sdk.admin.draftOrder.cancelEdit(draftOrderId);
        await sdk.admin.draftOrder.beginEdit(draftOrderId);
      } catch (innerError) {
        throw error;
      }
    } else {
      throw error;
    }
  }
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

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
  const store = useAppStore();
  const getOrSetDefaultCustomer = useGetOrSetDefaultCustomer();

  return useCallback(async () => {
    const draftOrderId = store.draftOrderId;

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

    store.setDraftOrderId(newDraftOrder.draft_order.id);

    return newDraftOrder.draft_order.id;
  }, [
    getOrSetDefaultCustomer,
    sdk,
    settings.defaults?.region?.id,
    settings.defaults?.salesChannel?.id,
    store,
  ]);
};

/**
 * Calculates and applies the round-off adjustment within an ACTIVE edit session.
 */
async function applyRoundOffAdjustment(sdk: any, draftOrderId: string) {
  // 1. Get current state INCLUDING pending changes from the active edit
  const { draft_order } = await sdk.admin.draftOrder.retrieve(draftOrderId, {
    fields: '+total,+items.title,+items.unit_price,+items.quantity,+items.total',
  });

  const items = draft_order.items || [];
  const roundOffItem = items.find((item: any) => item.title === ROUND_OFF_ITEM_TITLE);

  // Safely calculate the current round-off amount
  const currentRoundOff = roundOffItem
    ? Number(roundOffItem.total) ||
      Number(roundOffItem.unit_price) * Number(roundOffItem.quantity) ||
      0
    : 0;

  const totalExcludingRoundOff = Number(draft_order.total || 0) - currentRoundOff;
  const roundedTotal = Math.round(totalExcludingRoundOff);
  const neededRoundOff = roundedTotal - totalExcludingRoundOff;

  // If no round off needed and no item exists, we're done
  if (Math.abs(neededRoundOff) < 0.01 && !roundOffItem) {
    return;
  }

  // Apply the correction
  if (Math.abs(neededRoundOff) < 0.01) {
    // Remove existing round off item if no longer needed
    if (roundOffItem) {
      await sdk.admin.draftOrder.removeItems(draftOrderId, [roundOffItem.id]);
    }
  } else {
    if (roundOffItem) {
      // Update existing round off item
      await sdk.admin.draftOrder.updateItem(draftOrderId, roundOffItem.id, {
        unit_price: neededRoundOff,
        quantity: 1,
      });
    } else {
      // Add new round off item
      await sdk.admin.draftOrder.addItems(draftOrderId, {
        items: [
          {
            title: ROUND_OFF_ITEM_TITLE,
            unit_price: neededRoundOff,
            quantity: 1,
          },
        ],
      });
    }
  }
}

// ─── Public Hooks ────────────────────────────────────────────────────────────

export const useCurrentDraftOrder = () => {
  const sdk = useMedusaSdk();
  const store = useAppStore();

  return useQuery({
    queryKey: [DRAFT_ORDER_QUERY_KEY],
    queryFn: async () => {
      const draftOrderId = store.draftOrderId;

      if (!draftOrderId) {
        return null;
      }

      return sdk.admin.draftOrder.retrieve(draftOrderId, {
        fields:
          '+tax_total,+discount_total,+subtotal,+total,+items.variant.options.*,+items.variant.options.option.*,+items.variant.inventory_quantity,+customer.*,+promotions.*,+promotions.application_method.*',
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
      return enqueueMutation(async () => {
        const draftOrderId = await getOrSetDraftOrderId();
        await safeBeginEdit(sdk, draftOrderId);
        try {
          await sdk.admin.draftOrder.addItems(draftOrderId, payload);
          return await sdk.admin.draftOrder.confirmEdit(draftOrderId);
        } catch (error) {
          await sdk.admin.draftOrder.cancelEdit(draftOrderId).catch(() => {});
          throw error;
        }
      });
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [DRAFT_ORDER_QUERY_KEY], exact: false });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

const debounceTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

export const useUpdateDraftOrderItem = (
  options?: Omit<
    UseMutationOptions<
      AdminDraftOrderPreviewResponse | void,
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
      if (debounceTimeouts.has(item.id)) {
        clearTimeout(debounceTimeouts.get(item.id)!);
      }

      return new Promise<AdminDraftOrderPreviewResponse | void>((resolve, reject) => {
        const timeoutId = setTimeout(async () => {
          debounceTimeouts.delete(item.id);

          enqueueMutation(async () => {
            const draftOrderId = await getOrSetDraftOrderId();
            await safeBeginEdit(sdk, draftOrderId);
            try {
              await sdk.admin.draftOrder.updateItem(draftOrderId, item.id, item.update);
              return await sdk.admin.draftOrder.confirmEdit(draftOrderId);
            } catch (error) {
              await sdk.admin.draftOrder.cancelEdit(draftOrderId).catch(() => {});
              throw error;
            }
          })
            .then((data) => resolve(data as any))
            .catch(reject);
        }, 300);

        debounceTimeouts.set(item.id, timeoutId);
      });
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [DRAFT_ORDER_QUERY_KEY], exact: false });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useRemoveDraftOrderItem = (
  options?: Omit<
    UseMutationOptions<AdminDraftOrderPreviewResponse, Error, { id: string }, unknown>,
    'mutationKey' | 'mutationFn'
  >
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();
  const getOrSetDraftOrderId = useGetOrSetDraftOrderId();

  return useMutation({
    mutationKey: [DRAFT_ORDER_QUERY_KEY, 'items', 'remove'],
    mutationFn: async ({ id }) => {
      return enqueueMutation(async () => {
        const draftOrderId = await getOrSetDraftOrderId();
        await safeBeginEdit(sdk, draftOrderId);
        try {
          await sdk.admin.draftOrder.removeActionItem(draftOrderId, id);
          return await sdk.admin.draftOrder.confirmEdit(draftOrderId);
        } catch (error) {
          await sdk.admin.draftOrder.cancelEdit(draftOrderId).catch(() => {});
          throw error;
        }
      });
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [DRAFT_ORDER_QUERY_KEY], exact: false });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useAddDraftOrderPromotions = (
  options?: Omit<
    UseMutationOptions<AdminDraftOrderPreviewResponse, FetchError, AdminAddDraftOrderPromotions>,
    'mutationKey' | 'mutationFn'
  >
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();
  const getOrSetDraftOrderId = useGetOrSetDraftOrderId();

  return useMutation({
    mutationKey: [DRAFT_ORDER_QUERY_KEY, 'promotions', 'add'],
    mutationFn: async (payload) => {
      return enqueueMutation(async () => {
        const draftOrderId = await getOrSetDraftOrderId();
        await safeBeginEdit(sdk, draftOrderId);
        try {
          await sdk.admin.draftOrder.addPromotions(draftOrderId, payload);
          return await sdk.admin.draftOrder.confirmEdit(draftOrderId);
        } catch (error) {
          await sdk.admin.draftOrder.cancelEdit(draftOrderId).catch(() => {});
          throw error;
        }
      });
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [DRAFT_ORDER_QUERY_KEY], exact: false });
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
    mutationKey: [DRAFT_ORDER_QUERY_KEY, 'promotions', 'remove'],
    mutationFn: async (payload) => {
      return enqueueMutation(async () => {
        const draftOrderId = await getOrSetDraftOrderId();
        await safeBeginEdit(sdk, draftOrderId);
        try {
          await sdk.admin.draftOrder.removePromotions(draftOrderId, payload);
          return await sdk.admin.draftOrder.confirmEdit(draftOrderId);
        } catch (error) {
          await sdk.admin.draftOrder.cancelEdit(draftOrderId).catch(() => {});
          throw error;
        }
      });
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [DRAFT_ORDER_QUERY_KEY], exact: false });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useApplyRoundOff = (
  options?: Omit<
    UseMutationOptions<AdminDraftOrderPreviewResponse | void, Error, void, unknown>,
    'mutationKey' | 'mutationFn'
  >
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();
  const getOrSetDraftOrderId = useGetOrSetDraftOrderId();

  return useMutation({
    mutationKey: [DRAFT_ORDER_QUERY_KEY, 'round-off'],
    mutationFn: async () => {
      return enqueueMutation(async () => {
        const draftOrderId = await getOrSetDraftOrderId();
        await safeBeginEdit(sdk, draftOrderId);
        try {
          await applyRoundOffAdjustment(sdk, draftOrderId);
          return await sdk.admin.draftOrder.confirmEdit(draftOrderId);
        } catch (error) {
          await sdk.admin.draftOrder.cancelEdit(draftOrderId).catch(() => {});
          throw error;
        }
      });
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [DRAFT_ORDER_QUERY_KEY], exact: false });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateDraftOrderCustomer = (
  options?: Omit<
    UseMutationOptions<
      AdminDraftOrderPreviewResponse,
      Error,
      | { id: string; email: string; phone?: string; first_name?: string; last_name?: string }
      | undefined,
      unknown
    >,
    'mutationKey' | 'mutationFn'
  >
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();
  const getOrSetDraftOrderId = useGetOrSetDraftOrderId();

  return useMutation({
    mutationKey: [DRAFT_ORDER_QUERY_KEY, 'customer', 'update'],
    mutationFn: async (data) => {
      return enqueueMutation(async () => {
        const draftOrderId = await getOrSetDraftOrderId();
        await safeBeginEdit(sdk, draftOrderId);
        try {
          await sdk.admin.draftOrder.update(draftOrderId, {
            customer_id: data?.id,
            email: data?.email,
          });
          return await sdk.admin.draftOrder.confirmEdit(draftOrderId);
        } catch (error) {
          await sdk.admin.draftOrder.cancelEdit(draftOrderId).catch(() => {});
          throw error;
        }
      });
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [DRAFT_ORDER_QUERY_KEY], exact: false });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useDeleteDraftOrder = (
  options?: Omit<UseMutationOptions<void>, 'mutationKey' | 'mutationFn'>
) => {
  const sdk = useMedusaSdk();
  const queryClient = useQueryClient();
  const store = useAppStore();

  return useMutation({
    mutationFn: async () => {
      const draftOrderId = store.draftOrderId;
      if (!draftOrderId) throw new Error('Draft order ID not found');
      store.setDraftOrderId(null);
      await sdk.admin.draftOrder.delete(draftOrderId);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData([DRAFT_ORDER_QUERY_KEY], null);
      queryClient.invalidateQueries({ queryKey: [DRAFT_ORDER_QUERY_KEY] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
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
      queryClient.invalidateQueries({ queryKey: [DRAFT_ORDER_QUERY_KEY], exact: false });
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
  const store = useAppStore();

  return useMutation({
    mutationKey: [DRAFT_ORDER_QUERY_KEY, id, 'complete'],
    mutationFn: async () => {
      if (!id) throw new Error('Draft order ID is required');

      const { draft_order } = await sdk.admin.draftOrder.retrieve(id, {
        fields:
          '+tax_total,+discount_total,+subtotal,+total,+items.variant.options.*,+customer.*,+customer.addresses.*',
      });

      const billingAddress =
        draft_order.customer?.addresses.find((a) => a.is_default_billing) ||
        draft_order.customer?.addresses[0];

      return enqueueMutation(async () => {
        await safeBeginEdit(sdk, id);
        try {
          await sdk.admin.draftOrder.update(id, {
            billing_address: billingAddress
              ? {
                  first_name: billingAddress.first_name ?? undefined,
                  last_name: billingAddress.last_name ?? undefined,
                  address_1: billingAddress.address_1 ?? undefined,
                  city: billingAddress.city ?? undefined,
                  country_code: billingAddress.country_code ?? undefined,
                  postal_code: billingAddress.postal_code ?? undefined,
                }
              : undefined,
          });
          await sdk.admin.draftOrder.confirmEdit(id);
          await sdk.admin.draftOrder.convertToOrder(id);
          await sdk.client.fetch(`/admin/orders/${id}/complete`, { method: 'POST' });
          store.setDraftOrderId(null);
        } catch (error) {
          await sdk.admin.draftOrder.cancelEdit(id).catch(() => {});
          throw error;
        }
      });
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData([DRAFT_ORDER_QUERY_KEY], null);
      queryClient.invalidateQueries({ queryKey: [DRAFT_ORDER_QUERY_KEY] });
      options?.onSuccess?.(data as any, variables, onMutateResult, context);
    },
  });
};
