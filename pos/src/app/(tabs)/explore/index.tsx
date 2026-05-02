import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '@/theme/useTheme';
import { useAuthenticated, useMedusaSdk } from '@/contexts/auth';
import type { AdminProduct, AdminProductCategory } from '@medusajs/types';

export default function ExploreScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const sdk = useMedusaSdk();
  const authState = useAuthenticated();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const medusa = sdk as any;

  const { data: categories = [] } = useQuery({
    queryKey: ['explore-categories'],
    queryFn: async () => {
      if (medusa.admin?.productCategory?.list) {
        const response = await medusa.admin.productCategory.list({ limit: 100 });
        return response?.product_categories ?? [];
      }
      const response = await medusa.client.fetch('/admin/product-categories', {
        method: 'GET',
        query: { limit: 100 },
      });
      return response?.product_categories ?? [];
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['explore-products'],
    queryFn: async () => {
      if (medusa.admin?.product?.list) {
        const response = await medusa.admin.product.list({ limit: 100, order: '-created_at' });
        return response?.products ?? [];
      }
      const response = await medusa.client.fetch('/admin/products', {
        method: 'GET',
        query: { limit: 100, order: '-created_at' },
      });
      return response?.products ?? [];
    },
  });

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((product: any) =>
      (product?.categories ?? []).some((cat: any) => cat?.id === selectedCategory)
    );
  }, [products, selectedCategory]);

  const createDraftOrderMutation = useMutation({
    mutationFn: async (variantId: string) => {
      const payload = {
        email: authState.userEmail || authState.user.email,
        items: [{ variant_id: variantId, quantity: 1 }],
      };
      const draftOrder = medusa.admin?.draftOrder?.create
        ? (await medusa.admin.draftOrder.create(payload))?.draft_order
        : (
            await medusa.client.fetch('/admin/draft-orders', {
              method: 'POST',
              body: payload,
            })
          )?.draft_order;

      if (!draftOrder?.id) {
        throw new Error('Failed to create draft order');
      }

      await SecureStore.setItemAsync('activeDraftOrderId', draftOrder.id);
      return draftOrder.id as string;
    },
    onSuccess: (draftOrderId) => {
      queryClient.invalidateQueries({ queryKey: ['active-draft-order-id'] });
      queryClient.invalidateQueries({ queryKey: ['active-draft-order'] });
      router.push(`/draft-order/${draftOrderId}`);
    },
  });

  return (
    <View className="flex-1" style={{ backgroundColor: colors.canvas }}>
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}>
        <Text style={{ color: colors.foreground }} className="text-[24px] font-extrabold tracking-tight">
          Explore
        </Text>
        <Text style={{ color: colors.fgSecondary }} className="mt-1 text-[14px]">
          Browse categories and add products to a draft order
        </Text>

        <Text style={{ color: colors.foreground }} className="mt-6 text-[16px] font-bold">
          Categories
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4 mt-3"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          <Pressable
            onPress={() => setSelectedCategory('all')}
            className="rounded-full px-3.5 py-2"
            style={{
              borderWidth: 1,
              backgroundColor: selectedCategory === 'all' ? colors.primary + '1e' : colors.surface,
              borderColor: selectedCategory === 'all' ? colors.primary : colors.border,
            }}>
            <Text
              className="text-[12px] font-semibold"
              style={{ color: selectedCategory === 'all' ? colors.primary : colors.fgSecondary }}>
              All
            </Text>
          </Pressable>
          {categories.map((category: AdminProductCategory) => {
            const active = selectedCategory === category.id;
            return (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className="rounded-full px-3.5 py-2"
                style={{
                  borderWidth: 1,
                  backgroundColor: active ? colors.primary + '1e' : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                }}>
                <Text
                  className="text-[12px] font-semibold"
                  style={{ color: active ? colors.primary : colors.fgSecondary }}>
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={{ color: colors.foreground }} className="mt-6 text-[16px] font-bold">
          Products
        </Text>
        <View className="mt-3 gap-3">
          {isLoading ? (
            <Text style={{ color: colors.fgSecondary }} className="text-[14px]">
              Loading products...
            </Text>
          ) : filteredProducts.length === 0 ? (
            <Text style={{ color: colors.fgSecondary }} className="text-[14px]">
              No products found.
            </Text>
          ) : (
            filteredProducts.map((product: AdminProduct) => {
              const variant = product.variants?.[0];
              const price = Number(
                variant?.calculated_price?.calculated_amount ?? variant?.prices?.[0]?.amount ?? 0
              );
              const variantId = variant?.id;

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
                    <Text style={{ color: colors.foreground }} className="text-[14px] font-semibold">
                      {product.title}
                    </Text>
                    <Text style={{ color: colors.fgSecondary }} className="mt-0.5 text-[12px]">
                      {product.status || 'published'}
                    </Text>
                    <Text style={{ color: colors.foreground }} className="mt-1 text-[13px] font-bold">
                      ₹{(price / 100).toFixed(2)}
                    </Text>
                  </View>
                  <Pressable
                    disabled={!variantId || createDraftOrderMutation.isPending}
                    onPress={() => {
                      if (variantId) createDraftOrderMutation.mutate(variantId);
                    }}
                    className="rounded-xl px-3 py-2"
                    style={{
                      backgroundColor: colors.primary + '14',
                      borderWidth: 1,
                      borderColor: colors.primary,
                      opacity: !variantId || createDraftOrderMutation.isPending ? 0.6 : 1,
                    }}>
                    <Text style={{ color: colors.primary }} className="text-[12px] font-bold">
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
