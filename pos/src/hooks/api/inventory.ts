import { useMedusaSdk } from '@/contexts/auth';
import { AdminInventoryLevelFilters, AdminInventoryLevelListResponse } from '@medusajs/types';
import {
  InfiniteData,
  UndefinedInitialDataInfiniteOptions,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { queryKeysFactory } from '@/lib/query-keys-factory';

const INVENTORY_LEVEL_QUERY_KEY = 'inventory_level';

const inventoryLevelQueryKeys = queryKeysFactory(INVENTORY_LEVEL_QUERY_KEY);

const PER_PAGE = 20;
export const useInventoryItemLocationLevels = (
  inventory_item_id: string,
  query?: Omit<AdminInventoryLevelFilters, 'limit' | 'offset'>,
  limit = PER_PAGE,
  options?: Omit<
    UndefinedInitialDataInfiniteOptions<
      AdminInventoryLevelListResponse,
      unknown,
      InfiniteData<AdminInventoryLevelListResponse>,
      readonly unknown[],
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'
  >
) => {
  const sdk = useMedusaSdk();

  return useInfiniteQuery({
    queryKey: inventoryLevelQueryKeys.list({ inventory_item_id, ...query }),
    queryFn: async ({ pageParam = 1 }) => {
      return await sdk.admin.inventoryItem.listLevels(inventory_item_id, {
        ...query,
        limit,
        offset: (pageParam - 1) * limit,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.count > lastPage.offset + lastPage.limit) {
        return lastPage.offset + lastPage.limit;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage.offset > 0) {
        return firstPage.offset - limit;
      }
      return undefined;
    },
    ...options,
  });
};
