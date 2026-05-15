import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { usePosSettings } from '@/contexts/settings';
import { useProducts } from '@/hooks/api/products';
import { Layout } from '@/components/ui/layout';
import { FlashList } from '@shopify/flash-list';

export default function SearchScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { defaults, isComplete: posDefaultsReady } = usePosSettings();
  
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const productListParams = useMemo(() => {
    const params: any = {
      q: query.trim() || undefined,
      order: '-created_at',
      fields: '+variants.*,+variants.prices.*,+variants.inventory_items.*',
    };
    if (defaults?.salesChannel?.id) params.sales_channel_id = defaults.salesChannel.id;
    if (defaults?.departmentTag?.id) params.tag_id = defaults.departmentTag.id;
    return params;
  }, [query, defaults?.salesChannel?.id, defaults?.departmentTag?.id]);

  const { data: productsData, isLoading } = useProducts(productListParams, 50, {
    enabled: posDefaultsReady,
  });
  
  const products = productsData?.pages.flatMap((p) => p.products ?? []) ?? [];

  const TypedFlashList = FlashList as any;

  return (
    <Layout className="px-0 pt-0">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-6 pb-6 pt-4">
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable 
            onPress={() => router.back()}
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.surface }}
          >
            <MaterialIcons name="arrow-back-ios-new" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={{ color: colors.foreground }} className="text-2xl font-black tracking-tight">
            SEARCH
          </Text>
          <View className="h-12 w-12" />
        </View>

        {/* Unified Search Input */}
        <View 
          className="h-14 flex-row items-center rounded-2xl border px-4"
          style={{ 
            backgroundColor: colors.surface, 
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.2 : 0.05,
            shadowRadius: 10,
            elevation: 2
          }}
        >
          <MaterialIcons name="search" size={24} color={colors.fgMuted} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search items or scan barcode..."
            placeholderTextColor={colors.fgMuted}
            style={{ color: colors.foreground }}
            className="ml-3 flex-1 text-[16px] font-medium"
            cursorColor={colors.primary}
          />
          <Pressable 
            onPress={() => router.push('/scan')}
            className="ml-2 h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialIcons name="qr-code-scanner" size={22} color={colors.primaryFg} />
          </Pressable>
        </View>
      </View>

      {/* Results */}
      {isLoading && products.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <TypedFlashList
          data={products}
          keyExtractor={(item: any) => item.id}
          estimatedItemSize={100}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <MaterialIcons name="inventory-2" size={64} color={colors.muted} />
              <Text style={{ color: colors.fgSecondary }} className="mt-4 text-[16px] font-bold text-center">
                {query ? `No items found matching "${query}"` : 'Browse your store catalog'}
              </Text>
            </View>
          }
          renderItem={({ item }: { item: any }) => {
            const variantCount = item.variants?.length ?? 0;
            const basePrice = Number(item.variants?.[0]?.prices?.[0]?.amount ?? 0) / 100;
            
            return (
              <Pressable
                onPress={() => router.push(`/product/${item.id}/variant-select`)}
                className="mb-3 rounded-2xl border p-4"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <View className="flex-row items-center">
                  <View 
                    className="h-16 w-16 items-center justify-center rounded-xl"
                    style={{ backgroundColor: colors.muted }}
                  >
                    {item.thumbnail ? (
                      <Image source={{ uri: item.thumbnail }} className="h-16 w-16 rounded-xl" />
                    ) : (
                      <MaterialIcons name="image" size={24} color={colors.fgMuted} />
                    )}
                  </View>
                  <View className="ml-4 flex-1">
                    <Text style={{ color: colors.foreground }} className="text-[16px] font-black" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={{ color: colors.fgSecondary }} className="text-[12px] font-bold uppercase tracking-wider mt-0.5">
                      {variantCount} {variantCount === 1 ? 'Variant' : 'Variants'}
                    </Text>
                    <View className="mt-2 flex-row items-center justify-between">
                      <Text style={{ color: colors.primary }} className="text-[15px] font-black">
                        ₹{basePrice.toFixed(2)}
                      </Text>
                      <View className="rounded-lg px-2 py-0.5" style={{ backgroundColor: colors.successBg }}>
                        <Text style={{ color: colors.success }} className="text-[10px] font-black uppercase">
                          Available
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </Layout>
  );
}
