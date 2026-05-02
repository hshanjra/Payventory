import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useAuthenticated } from '@/contexts/auth';
import { usePosSettings } from '@/contexts/settings';
import { useProductCategories } from '@/hooks/api/categories';
import { useAddVariantToActiveDraftElseCreate } from '@/hooks/api/orders';
import { useProducts } from '@/hooks/api/products';
import type { AdminProductListParams } from '@medusajs/types';

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const { colors } = useTheme();
  const authState = useAuthenticated();
  const { defaults, isComplete: posDefaultsReady } = usePosSettings();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const { data: categoriesData } = useProductCategories(undefined, 100);
  const categories = categoriesData?.product_categories ?? [];

  const q = query.trim();
  const productListParams = useMemo((): AdminProductListParams => {
    const params: AdminProductListParams = {
      q: q || undefined,
      order: '-created_at',
      limit: 100,
    };
    if (defaults?.salesChannelId) {
      params.sales_channel_id = defaults.salesChannelId;
    }
    if (defaults?.departmentTagId) {
      params.tags = [defaults.departmentTagId];
    }
    return params;
  }, [q, defaults?.salesChannelId, defaults?.departmentTagId]);

  const { data: productsData, isLoading } = useProducts(productListParams, {
    enabled: posDefaultsReady,
  });
  const products = productsData?.products ?? [];

  const filteredProducts = useMemo(() => {
    if (!q) return products.slice(0, 20);
    const lower = q.toLowerCase();
    return products.filter((product) =>
      String(product.title ?? '')
        .toLowerCase()
        .includes(lower)
    );
  }, [products, q]);

  const addToDraft = useAddVariantToActiveDraftElseCreate({
    onSuccess: ({ draftOrderId }) => {
      router.push(`/draft-order/${draftOrderId}`);
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* ── Search Header ── */}
      <SafeAreaView style={{ backgroundColor: colors.surface }}>
        <View
          style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}
          className="border-b px-4 pb-3 pt-3">
          <View
            style={{
              backgroundColor: colors.canvas,
              borderColor: colors.border,
              height: 48,
            }}
            className="flex-row items-center rounded-2xl border px-3">
            {/* Back */}
            <Pressable onPress={() => router.back()} hitSlop={8} className="pr-2">
              <MaterialIcons name="arrow-back" size={22} color={colors.icon} />
            </Pressable>

            {/* Divider */}
            <View style={{ backgroundColor: colors.border }} className="mx-1 h-5 w-px" />

            {/* Input */}
            <TextInput
              ref={inputRef}
              placeholder={
                defaults?.departmentTagId
                  ? 'Search products in this department…'
                  : 'Search products, orders…'
              }
              placeholderTextColor={colors.fgMuted}
              style={{ color: colors.foreground, flex: 1 }}
              className="ml-2 text-[15px] font-medium"
              cursorColor={colors.primary}
              returnKeyType="search"
              value={query}
              onChangeText={setQuery}
            />

            {/* Divider */}
            <View style={{ backgroundColor: colors.border }} className="mx-1 h-5 w-px" />

            {/* Scan button */}
            <Pressable onPress={() => router.push('/scan')} hitSlop={8} className="pl-2">
              <MaterialIcons name="qr-code-scanner" size={22} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        {!posDefaultsReady ? (
          <Text style={{ color: colors.warning }} className="mt-4 text-[14px] font-medium">
            Finish POS setup (sales channel, region, store) to search products.
          </Text>
        ) : null}

        {posDefaultsReady && defaults?.departmentTagId ? (
          <View className="mt-4 flex-row items-center gap-2">
            <MaterialIcons name="label" size={18} color={colors.primary} />
            <Text style={{ color: colors.fgSecondary }} className="text-[13px] font-medium">
              Catalog filtered by department tag
            </Text>
          </View>
        ) : null}

        <View className="mt-5 flex-row items-center justify-between">
          <Text style={{ color: colors.foreground }} className="text-[18px] font-bold">
            Categories
          </Text>
        </View>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {categories.slice(0, 10).map((item) => (
            <View
              key={item.id}
              style={{ backgroundColor: colors.muted, borderColor: colors.border }}
              className="flex-row items-center rounded-xl border px-3 py-2">
              <MaterialIcons
                name="category"
                size={16}
                color={colors.fgMuted}
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: colors.fgSecondary }} className="text-sm font-medium">
                {item.name}
              </Text>
            </View>
          ))}
        </View>

        <Text style={{ color: colors.foreground }} className="mt-8 text-[18px] font-bold">
          Products
        </Text>

        <View className="mt-4 gap-3">
          {isLoading ? (
            <Text style={{ color: colors.fgSecondary }} className="text-[14px]">
              Loading products...
            </Text>
          ) : filteredProducts.length === 0 ? (
            <Text style={{ color: colors.fgSecondary }} className="text-[14px]">
              No products found.
            </Text>
          ) : (
            filteredProducts.map((product) => {
              const variant = product.variants?.[0];
              const variantId = variant?.id;
              const price = Number(
                variant?.calculated_price?.calculated_amount ?? variant?.prices?.[0]?.amount ?? 0
              );
              return (
                <View
                  key={product.id}
                  className="flex-row items-center gap-3 rounded-2xl border p-3"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                  {product.thumbnail ? (
                    <Image source={{ uri: product.thumbnail }} className="h-16 w-16 rounded-xl" />
                  ) : (
                    <View
                      className="h-16 w-16 items-center justify-center rounded-xl"
                      style={{ backgroundColor: colors.muted }}>
                      <MaterialIcons name="inventory-2" size={22} color={colors.fgMuted} />
                    </View>
                  )}
                  <View className="flex-1">
                    <Text
                      style={{ color: colors.foreground }}
                      className="text-[14px] font-semibold">
                      {product.title}
                    </Text>
                    <Text
                      style={{ color: colors.foreground }}
                      className="mt-1 text-[13px] font-bold">
                      ₹{(price / 100).toFixed(2)}
                    </Text>
                  </View>
                  <Pressable
                    disabled={!variantId || addToDraft.isPending}
                    onPress={() => {
                      if (!variantId) return;
                      addToDraft.mutate({
                        variantId,
                        email: authState.userEmail || authState.user.email,
                      });
                    }}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.primary,
                      borderRadius: 10,
                      borderWidth: 1.5,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      opacity: !variantId || addToDraft.isPending ? 0.6 : 1,
                    }}>
                    <Text style={{ color: colors.primary }} className="text-xs font-bold">
                      Add to cart
                    </Text>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
