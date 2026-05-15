import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useMedusaSdk } from '@/contexts/auth';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { FlashList } from '@shopify/flash-list';
import type { AdminProduct, AdminProductCategory } from '@medusajs/types';

export default function ExploreScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const sdk = useMedusaSdk();
  const medusa = sdk as any;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: categories = [] } = useQuery<AdminProductCategory[]>({
    queryKey: ['explore-categories'],
    queryFn: async () => {
      const response = await medusa.admin.productCategory.list({ limit: 100 });
      return (response?.product_categories ?? []) as AdminProductCategory[];
    },
  });

  const { data: products = [], isLoading } = useQuery<AdminProduct[]>({
    queryKey: ['explore-products'],
    queryFn: async () => {
      const response = await medusa.admin.product.list({ limit: 100, order: '-created_at' });
      return (response?.products ?? []) as AdminProduct[];
    },
  });

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((product) =>
      (product?.categories ?? []).some((cat: any) => cat?.id === selectedCategory)
    );
  }, [products, selectedCategory]);

  const TypedFlashList = FlashList as any;

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.canvas }}>
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
            EXPLORE
          </Text>
          <View className="h-12 w-12" />
        </View>

        {/* Categories Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-6"
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}>
          <Pressable
            onPress={() => setSelectedCategory('all')}
            className="rounded-full px-5 py-2.5"
            style={{
              backgroundColor: selectedCategory === 'all' ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: selectedCategory === 'all' ? colors.primary : colors.border,
            }}>
            <Text
              className="text-[13px] font-black uppercase tracking-widest"
              style={{ color: selectedCategory === 'all' ? colors.primaryFg : colors.fgSecondary }}>
              All
            </Text>
          </Pressable>
          {categories.map((category: AdminProductCategory) => {
            const active = selectedCategory === category.id;
            return (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className="rounded-full px-5 py-2.5"
                style={{
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                }}>
                <Text
                  className="text-[13px] font-black uppercase tracking-widest"
                  style={{ color: active ? colors.primaryFg : colors.fgSecondary }}>
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Results */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <TypedFlashList
          data={filteredProducts}
          keyExtractor={(item: any) => item.id}
          estimatedItemSize={120}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <MaterialIcons name="search-off" size={64} color={colors.muted} />
              <Text style={{ color: colors.fgSecondary }} className="mt-4 text-[16px] font-bold text-center">
                No products found in this category
              </Text>
            </View>
          }
          renderItem={({ item: product }: any) => {
            const variant = product.variants?.[0];
            const price = Number(variant?.calculated_price?.calculated_amount ?? variant?.prices?.[0]?.amount ?? 0) / 100;

            return (
              <Pressable
                onPress={() => router.push(`/product/${product.id}/variant-select`)}
                className="mb-4 rounded-3xl border p-5"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <View className="flex-row items-center">
                  <View 
                    className="h-20 w-20 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: colors.muted }}
                  >
                    {product.thumbnail ? (
                      <Image source={{ uri: product.thumbnail }} className="h-20 w-20 rounded-2xl" />
                    ) : (
                      <MaterialIcons name="image" size={32} color={colors.fgMuted} />
                    )}
                  </View>
                  <View className="ml-4 flex-1">
                    <Text style={{ color: colors.foreground }} className="text-[17px] font-black tracking-tight" numberOfLines={1}>
                      {product.title}
                    </Text>
                    <Text style={{ color: colors.fgSecondary }} className="text-[12px] font-bold uppercase tracking-widest mt-0.5">
                      {product.variants?.length} Options
                    </Text>
                    <View className="mt-3 flex-row items-center justify-between">
                      <Text style={{ color: colors.primary }} className="text-[16px] font-black">
                        ₹{price.toFixed(2)}
                      </Text>
                      <View className="rounded-lg px-2 py-0.5" style={{ backgroundColor: colors.primary + '10' }}>
                        <Text style={{ color: colors.primary }} className="text-[10px] font-black uppercase">
                          View Details
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
    </SafeAreaView>
  );
}
