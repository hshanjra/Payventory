import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme } from '@/theme/useTheme';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'expo-router';

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const price = Number(product.variants?.[0]?.prices?.[0]?.amount ?? 0);
  const rawImageUrl = product.thumbnail || product.images?.[0]?.url;

  // Ensure the URL is absolute and uses https if it's protocol-relative
  const imageUrl = rawImageUrl?.startsWith('//') ? `https:${rawImageUrl}` : rawImageUrl;

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}/variant-select`)}
      className="mb-6 w-[47%]">
      <View
        className="mb-3 aspect-[4/5] items-center justify-center overflow-hidden rounded-[40px]"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
        ) : (
          <MaterialIcons name="inventory-2" size={48} color={colors.muted} />
        )}

        <View
          className="absolute bottom-4 right-4 h-10 w-10 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.primary }}>
          <MaterialIcons name="add" size={24} color={colors.primaryFg} />
        </View>
      </View>
      <Text
        style={{ color: colors.foreground }}
        className="px-2 text-[16px] font-black tracking-tight">
        {product.title}
      </Text>
      <Text style={{ color: colors.fgSecondary }} className="mt-1 px-2 text-[15px] font-bold">
        {formatCurrency(price)}
      </Text>
    </Pressable>
  );
}
