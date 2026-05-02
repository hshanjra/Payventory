import { useMedusaSdk } from '@/contexts/auth';
import { queryClient } from '@/lib/query-client';
import { queryKeysFactory, TQueryKey } from '@/lib/query-keys-factory';
import { FetchError } from '@medusajs/js-sdk';
import {
  AdminAddDraftOrderItems,
  AdminAddDraftOrderPromotions,
  AdminAddDraftOrderShippingMethod,
  AdminCreateDraftOrder,
  AdminDraftOrderListParams,
  AdminDraftOrderListResponse,
  AdminDraftOrderParams,
  AdminDraftOrderPreviewResponse,
  AdminDraftOrderResponse,
  AdminOrderChangesResponse,
  AdminOrderFilters,
  AdminOrderLineItemsListResponse,
  AdminOrderListResponse,
  AdminOrderResponse,
  AdminRemoveDraftOrderPromotions,
  AdminUpdateDraftOrder,
  AdminUpdateDraftOrderActionShippingMethod,
  AdminUpdateDraftOrderItem,
  AdminUpdateDraftOrderShippingMethod,
  AdminUpdateOrder,
} from '@medusajs/types';
import {
  MutationOptions,
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { readPosDefaultsFromStore } from '@/lib/pos-defaults-storage';

const ORDERS_QUERY_KEY = 'orders' as const;
const _orderKeys = queryKeysFactory(ORDERS_QUERY_KEY) as TQueryKey<'orders'> & {
  preview: (orderId: string) => any;
  changes: (orderId: string) => any;
  lineItems: (orderId: string) => any;
};

_orderKeys.preview = function (id: string) {
  return [this.detail(id), 'preview'];
};

_orderKeys.changes = function (id: string) {
  return [this.detail(id), 'changes'];
};

_orderKeys.lineItems = function (id: string) {
  return [this.detail(id), 'lineItems'];
};

export const ordersQueryKeys = _orderKeys;

const DRAFT_ORDER_QUERY_KEY = 'draft_order';

export const draftOrderQueryKeys = queryKeysFactory(DRAFT_ORDER_QUERY_KEY);

export const useOrder = (
  id: string,
  query?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<AdminOrderResponse, FetchError, AdminOrderResponse, QueryKey>,
    'queryFn' | 'queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.order.retrieve(id, query),
    queryKey: ordersQueryKeys.detail(id, query),
    ...options,
  });

  return { ...data, ...rest };
};

export const useUpdateOrder = (
  id: string,
  options?: UseMutationOptions<AdminOrderResponse, FetchError, AdminUpdateOrder>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: (payload: AdminUpdateOrder) => sdk.admin.order.update(id, payload),
    onSuccess: (data: any, variables: any, onMutateResult, context: any) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.changes(id),
      });

      // TODO: enable when needed
      // queryClient.invalidateQueries({
      //   queryKey: ordersQueryKeys.lists(),
      // })

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useOrders = (
  query?: AdminOrderFilters,
  limit?: 20,
  options?: Omit<
    UseQueryOptions<AdminOrderListResponse, FetchError, AdminOrderListResponse, QueryKey>,
    'queryFn' | 'queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  return useQuery({
    queryFn: () => sdk.admin.order.list({ limit, ...query }),
    queryKey: ordersQueryKeys.list(query),
    ...options,
  });
};

export const useOrderChanges = (
  id: string,
  options?: Omit<
    UseQueryOptions<AdminOrderChangesResponse, FetchError, AdminOrderChangesResponse, QueryKey>,
    'queryFn' | 'queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  return useQuery({
    queryFn: () => sdk.admin.order.listChanges(id),
    queryKey: ordersQueryKeys.changes(id),
    ...options,
  });
};

export const useOrderLineItems = (
  id: string,
  query?: Record<string, string | number>,
  options?: Omit<
    UseQueryOptions<
      AdminOrderLineItemsListResponse,
      FetchError,
      AdminOrderLineItemsListResponse,
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  return useQuery({
    queryFn: () => sdk.admin.order.listLineItems(id, query),
    queryKey: ordersQueryKeys.lineItems(id),
    ...options,
  });
};

// TODO: Don't need for this proejct, will be handled only single draft order till its not converted to regular order.
export const useDraftOrders = (
  query?: AdminDraftOrderListParams,
  options?: Omit<
    UseQueryOptions<AdminDraftOrderListResponse, FetchError, AdminDraftOrderListResponse, QueryKey>,
    'queryFn | queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  return useQuery({
    queryKey: draftOrderQueryKeys.list(query),
    queryFn: () => sdk.admin.draftOrder.list(query),
    ...options,
  });
};

export const useDraftOrder = (
  id: string,
  query?: AdminDraftOrderListParams,
  options?: Omit<
    UseQueryOptions<AdminDraftOrderResponse, FetchError, AdminDraftOrderResponse, QueryKey>,
    'queryFn | queryKey'
  >
) => {
  const sdk = useMedusaSdk();
  return useQuery({
    queryKey: draftOrderQueryKeys.detail(id),
    queryFn: () => sdk.admin.draftOrder.retrieve(id, query),
    ...options,
  });
};

export const useCreateDraftOrder = (
  options?: UseMutationOptions<AdminDraftOrderResponse, FetchError, AdminCreateDraftOrder>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: (payload: AdminCreateDraftOrder) => sdk.admin.draftOrder.create(payload),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.list(),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useAddDraftOrderItems = (
  id: string,
  options?: UseMutationOptions<AdminDraftOrderPreviewResponse, FetchError, AdminAddDraftOrderItems>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: (payload: AdminAddDraftOrderItems) => sdk.admin.draftOrder.addItems(id, payload),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export type AddVariantToDraftInput = {
  variantId: string;
  email: string;
};

export type AddVariantToDraftResult = {
  draftOrderId: string;
  created: boolean;
};

/** Uses `activeDraftOrderId` in SecureStore when set; otherwise creates a new draft order. */
export const useAddVariantToActiveDraftElseCreate = (
  options?: UseMutationOptions<AddVariantToDraftResult, FetchError, AddVariantToDraftInput>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: async ({ variantId, email }) => {
      const items = [{ variant_id: variantId, quantity: 1 }];
      const existingId = await SecureStore.getItemAsync('activeDraftOrderId');
      if (existingId) {
        await sdk.admin.draftOrder.addItems(existingId, { items });
        return { draftOrderId: existingId, created: false };
      }
      const posDefaults = await readPosDefaultsFromStore();
      if (!posDefaults) {
        throw new Error(
          'Configure POS defaults (sales channel, region, store) before adding items.'
        );
      }
      const res = await sdk.admin.draftOrder.create({
        email,
        sales_channel_id: posDefaults.salesChannelId,
        region_id: posDefaults.regionId,
        items,
      });
      const draftOrderId = res.draft_order?.id;
      if (!draftOrderId) throw new Error('Failed to create draft order');
      await SecureStore.setItemAsync('activeDraftOrderId', draftOrderId);
      return { draftOrderId, created: true };
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: draftOrderQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: draftOrderQueryKeys.detail(data.draftOrderId) });
      queryClient.invalidateQueries({ queryKey: ['active-draft-order-id'] });
      queryClient.invalidateQueries({ queryKey: ['active-draft-order'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useAddDraftOrderPromotions = (
  id: string,
  options?: MutationOptions<
    AdminDraftOrderPreviewResponse,
    FetchError,
    AdminAddDraftOrderPromotions
  >
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: (payload: AdminAddDraftOrderPromotions) =>
      sdk.admin.draftOrder.addPromotions(id, payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useRemoveDraftOrderPromotions = (
  id: string,
  options?: MutationOptions<
    AdminDraftOrderPreviewResponse,
    FetchError,
    AdminRemoveDraftOrderPromotions
  >
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: (payload: AdminRemoveDraftOrderPromotions) =>
      sdk.admin.draftOrder.removePromotions(id, payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useAddDraftOrderShippingMethod = (
  id: string,
  options?: MutationOptions<any, FetchError, AdminAddDraftOrderShippingMethod>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: (payload: AdminAddDraftOrderShippingMethod) =>
      sdk.admin.draftOrder.addShippingMethod(id, payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useConfirmEditDraftOrder = (
  id: string,
  options?: MutationOptions<AdminDraftOrderPreviewResponse, FetchError, null>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: () => sdk.admin.draftOrder.confirmEdit(id),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

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
  return useMutation({
    mutationFn: () => sdk.admin.draftOrder.convertToOrder(id),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useCreateDraftOrderEdit = (
  id: string,
  options?: UseMutationOptions<AdminDraftOrderPreviewResponse, FetchError, null>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: () => sdk.admin.draftOrder.beginEdit(id),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDraftOrderRequestEdit = (
  id: string,
  options?: UseMutationOptions<AdminDraftOrderPreviewResponse, FetchError, null>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: () => sdk.admin.draftOrder.requestEdit(id),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateDraftOrder = (
  id: string,
  options?: UseMutationOptions<AdminDraftOrderResponse, FetchError, AdminUpdateDraftOrder>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: (payload: AdminUpdateDraftOrder) => sdk.admin.draftOrder.update(id, payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateDraftOrderItem = (
  id: string,
  itemId: string,
  options?: UseMutationOptions<
    AdminDraftOrderPreviewResponse,
    FetchError,
    AdminUpdateDraftOrderItem
  >
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: (payload: AdminUpdateDraftOrderItem) =>
      sdk.admin.draftOrder.updateItem(id, itemId, payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateDraftOrderNewItem = (
  id: string,
  actionId: string,
  options?: UseMutationOptions<
    AdminDraftOrderPreviewResponse,
    FetchError,
    AdminUpdateDraftOrderItem
  >
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: (payload: AdminUpdateDraftOrderItem) =>
      sdk.admin.draftOrder.updateItem(id, actionId, payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateDraftOrderNewShippingMethod = (
  id: string,
  actionId: string,
  options?: UseMutationOptions<
    AdminDraftOrderPreviewResponse,
    FetchError,
    AdminUpdateDraftOrderActionShippingMethod
  >
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: (payload: AdminUpdateDraftOrderActionShippingMethod) =>
      sdk.admin.draftOrder.updateActionShippingMethod(id, actionId, payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDeleteDraftOrderNewShippingMethod = (
  id: string,
  actionId: string,
  options?: UseMutationOptions<AdminDraftOrderPreviewResponse, FetchError, any>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: () => sdk.admin.draftOrder.removeActionShippingMethod(id, actionId),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateDraftOrderShippingMethod = (
  id: string,
  methodId: string,
  options?: UseMutationOptions<
    AdminDraftOrderPreviewResponse,
    FetchError,
    AdminUpdateDraftOrderShippingMethod
  >
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: (payload: AdminUpdateDraftOrderShippingMethod) =>
      sdk.admin.draftOrder.updateShippingMethod(id, methodId, payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDeleteDraftOrderShippingMethod = (
  id: string,
  methodId: string,
  options?: UseMutationOptions<AdminDraftOrderPreviewResponse, FetchError, any>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: () => sdk.admin.draftOrder.removeShippingMethod(id, methodId),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useCancelDraftOrderEdit = (
  id: string,
  options?: UseMutationOptions<any, FetchError, any>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: () => sdk.admin.draftOrder.cancelEdit(id),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDeleteDraftOrder = (
  id: string,
  options?: UseMutationOptions<any, FetchError, any>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: () => sdk.admin.draftOrder.delete(id),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDeleteDraftOrderItem = (
  id: string,
  actionId: string,
  options?: UseMutationOptions<AdminDraftOrderPreviewResponse, FetchError, any>
) => {
  const sdk = useMedusaSdk();
  return useMutation({
    mutationFn: () => sdk.admin.draftOrder.removeActionItem(id, actionId),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrderQueryKeys.detail(id),
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};
