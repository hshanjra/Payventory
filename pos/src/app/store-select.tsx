import { usePosSettings } from '@/contexts/settings';
import { useStockLocations } from '@/hooks/api/stock-locations';
import { Text, View, Pressable, ActivityIndicator, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useDeleteDraftOrder } from '@/hooks/api/draft-orders';
import * as SecureStore from 'expo-secure-store';

const DRAFT_ORDER_ID_STORAGE_KEY = 'draft_order_id';

export default function StoreSelectScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { defaults, setDefaults, isComplete: posDefaultsReady } = usePosSettings();
  const { mutateAsync: deleteDraftOrder } = useDeleteDraftOrder();

  const { data, isLoading } = useStockLocations(
    {
      sales_channel_id: defaults?.salesChannel?.id,
    },
    40,
    { enabled: posDefaultsReady }
  );

  const storeOptions = useMemo(() => {
    return data?.pages?.flatMap((page) => page.stock_locations || []) ?? [];
  }, [data?.pages]);

  const handleStoreSelect = async (store: any) => {
    const draftOrderId = await SecureStore.getItemAsync(DRAFT_ORDER_ID_STORAGE_KEY);

    const performStoreChange = async () => {
      try {
        if (draftOrderId) {
          await deleteDraftOrder();
        }

        if (defaults) {
          const fullStore = storeOptions.find((s) => s.id === store.id);
          if (fullStore) {
            await setDefaults({
              ...defaults,
              stockLocation: {
                id: fullStore.id,
                name: fullStore.name,
                address: fullStore.address
                  ? {
                      id: fullStore.address.id || '',
                      address_1: fullStore.address.address_1 || '',
                      address_2: fullStore.address.address_2 ?? null,
                      company: fullStore.address.company ?? null,
                      country_code: fullStore.address.country_code ?? null,
                      city: fullStore.address.city ?? null,
                      phone: fullStore.address.phone ?? null,
                      postal_code: fullStore.address.postal_code ?? null,
                      province: fullStore.address.province ?? null,
                    }
                  : undefined,
              },
            });
          }
        }
        router.back();
      } catch (error) {
        console.error('Failed to change store:', error);
        Alert.alert('Error', 'Failed to change store location. Please try again.');
      }
    };

    if (draftOrderId && store.id !== defaults?.stockLocation?.id) {
      Alert.alert(
        'Change Store?',
        'Changing the store location will discard your current draft order. Do you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Change Store', 
            style: 'destructive',
            onPress: performStoreChange 
          },
        ]
      );
    } else {
      await performStoreChange();
    }
  };

  const activeStoreId = defaults?.stockLocation?.id;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Fixed header — never scrolls */}
      <View className="px-8 pb-6 pt-10">
        <View className="mb-6 flex-row items-center justify-between">
          <Text style={{ color: colors.foreground }} className="text-3xl font-black tracking-tight">
            STORE
          </Text>
          <Pressable 
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.muted }}
          >
            <MaterialIcons name="close" size={20} color={colors.foreground} />
          </Pressable>
        </View>
        <Text style={{ color: colors.fgSecondary }} className="text-[15px] font-medium leading-6">
          Select the active store for processing orders and inventory management.
        </Text>
      </View>

      {/* Scrollable list */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={storeOptions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="mt-20 items-center px-10">
              <MaterialIcons name="store-mall-directory" size={64} color={colors.muted} />
              <Text style={{ color: colors.fgSecondary }} className="mt-4 text-center text-[15px] font-bold">
                No active stores found for this sales channel.
              </Text>
            </View>
          }
          renderItem={({ item: store }) => {
            const isActive = activeStoreId === store.id;
            return (
              <Pressable
                key={store.id}
                onPress={() => handleStoreSelect(store)}
                style={{
                  backgroundColor: isActive ? colors.primary + '05' : colors.canvas,
                  borderColor: isActive ? colors.primary : colors.border,
                  borderWidth: isActive ? 2 : 1,
                }}
                className="flex-row items-center justify-between rounded-2xl p-5">
                <View className="flex-row items-center flex-1 pr-4">
                  <View
                    style={{ backgroundColor: isActive ? colors.primary : colors.muted }}
                    className="h-14 w-14 items-center justify-center rounded-2xl">
                    <MaterialIcons
                      name="business"
                      size={28}
                      color={isActive ? colors.primaryFg : colors.fgSecondary}
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text
                      style={{ color: colors.foreground }}
                      className="text-[18px] font-black tracking-tight">
                      {store.name}
                    </Text>
                    <Text style={{ color: colors.fgSecondary }} className="mt-0.5 text-[13px] font-medium" numberOfLines={1}>
                      {store.address?.address_1 || 'No address provided'}
                    </Text>
                  </View>
                </View>
                {isActive && (
                  <View className="h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: colors.primary }}>
                    <MaterialIcons name="check" size={16} color={colors.primaryFg} />
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
