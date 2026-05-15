import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useProducts } from '@/hooks/api/products';
import {
  useCurrentDraftOrder,
  useAddToDraftOrder,
  useUpdateDraftOrderItem,
} from '@/hooks/api/draft-orders';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import { VariantSelector } from '@/components/product/variant-selector';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { ProductInfo } from '@/components/product/product-info';
import { InventoryStatus } from '@/components/product/inventory-status';
import { CartFooter } from '@/components/product/cart-footer';
import { usePosSettings } from '@/contexts/settings';
import { useMedusaSdk } from '@/contexts/auth';
import type { AdminProductVariant } from '@medusajs/types';

export default function ProductVariantSelectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { defaults } = usePosSettings();
  const sdk = useMedusaSdk();

  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [inventoryLevels, setInventoryLevels] = useState<Record<string, number>>({});
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: productsData, isLoading: isProductLoading } = useProducts(
    {
      id,
      fields:
        '+variants.*,+variants.prices.*,+variants.options.*,+variants.options.option.*,+images.*,+variants.inventory_items.inventory_item_id',
    },
    1
  );

  const { data: draftOrderData, isLoading: isDraftLoading } = useCurrentDraftOrder();

  const { mutate: addToCart, isPending: isAddPending } = useAddToDraftOrder({
    onSuccess: () => router.back(),
  });

  const { mutate: updateItem, isPending: isUpdatePending } = useUpdateDraftOrderItem();

  // ── Derived data ────────────────────────────────────────────────────────────
  const product = productsData?.pages[0]?.products[0];
  const variants = (product?.variants as AdminProductVariant[]) ?? [];
  const draftOrder = draftOrderData?.draft_order;
  const currencyCode = draftOrder?.currency_code ?? 'INR';

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) || null,
    [variants, selectedVariantId]
  );

  const availableQuantity = selectedVariant ? (inventoryLevels[selectedVariant.id] ?? 0) : 0;
  const isOutOfStock = selectedVariant ? availableQuantity <= 0 : false;

  // Find this variant in the current draft order items
  const cartItem = useMemo(() => {
    if (!draftOrder || !selectedVariantId) return null;
    const item = draftOrder.items?.find((it) => (it as any).variant_id === selectedVariantId);
    return item ? { id: item.id, quantity: item.quantity ?? 0 } : null;
  }, [draftOrder, selectedVariantId]);

  // ── Lifecycle: Sync Initial Selection & Fetch Inventory ──────────────────────
  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      const initial = variants.length === 1 ? variants[0].id : variants[0].id;
      setSelectedVariantId(initial);
    }
  }, [variants, selectedVariantId]);

  useEffect(() => {
    async function fetchInventory() {
      if (variants.length === 0 || !defaults?.stockLocation?.id) return;

      setIsInventoryLoading(true);
      try {
        const levelsMap: Record<string, number> = {};

        // Fetch inventory for all variants in parallel
        await Promise.all(
          variants.map(async (v) => {
            const inventoryItemId = (v as any).inventory_items?.[0]?.inventory_item_id;
            if (!inventoryItemId) return;

            const response = await sdk.admin.inventoryItem.listLevels(inventoryItemId, {
              location_id: [defaults.stockLocation.id],
            });

            const level = response.inventory_levels?.[0];
            levelsMap[v.id] = level?.available_quantity ?? 0;
          })
        );

        setInventoryLevels(levelsMap);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setIsInventoryLoading(false);
      }
    }

    fetchInventory();
  }, [variants, defaults?.stockLocation?.id]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!selectedVariantId || isOutOfStock) return;
    addToCart({ items: [{ variant_id: selectedVariantId, quantity: 1 }] });
  };

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
  };

  const handleIncrement = (itemId: string, newQty: number) => {
    updateItem({ id: itemId, update: { quantity: newQty } });
  };

  const handleDecrement = (itemId: string, newQty: number) => {
    if (newQty < 0) return;
    updateItem({ id: itemId, update: { quantity: newQty } });
  };

  // ── Loading / error states ──────────────────────────────────────────────────
  if (isProductLoading || isDraftLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.canvas,
        }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          backgroundColor: colors.canvas,
        }}>
        <MaterialIcons name="error-outline" size={40} color={colors.mutedFg} />
        <Text className="text-[15px] font-semibold" style={{ color: colors.mutedFg }}>
          Product not found
        </Text>
      </View>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ flex: 1 }}>
        {/* Grabber for Sheet UI */}
        <View className="items-center py-3">
          <View 
            style={{ 
              width: 40, 
              height: 4, 
              borderRadius: 2, 
              backgroundColor: colors.borderStrong,
              opacity: 0.5
            }} 
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}>
          
          {/* Images */}
          <ProductImageGallery images={(product.images ?? []) as { url: string }[]} height={260} />

          {/* Title + price + description */}
          <View className="mt-6">
            <ProductInfo product={product} selectedVariant={selectedVariant} />
          </View>

          {/* Stock indicator */}
          <View className="mt-4 px-6">
            <InventoryStatus availableQuantity={availableQuantity} isLoading={isInventoryLoading} />
          </View>

          {/* Variant option chips */}
          <View className="mt-10 px-6">
            <VariantSelector
              variants={variants}
              selectedVariantId={selectedVariantId}
              onSelectVariant={handleVariantSelect}
              inventoryLevels={inventoryLevels}
            />
          </View>
        </ScrollView>

        {/* Fixed footer — Add to cart or quantity stepper */}
        <CartFooter
          selectedVariant={selectedVariant}
          cartItem={cartItem}
          currencyCode={currencyCode}
          onAddToCart={handleAddToCart}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          isAddPending={isAddPending}
          isUpdatePending={isUpdatePending}
          isOutOfStock={isOutOfStock}
        />
      </View>
    </SafeAreaView>
  );
}
