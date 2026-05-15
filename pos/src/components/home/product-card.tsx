import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme } from '@/theme/useTheme';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'expo-router';

const MEDUSA_URL = process.env.EXPO_PUBLIC_MEDUSA_URL;

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const price = Number(product.variants?.[0]?.prices?.[0]?.amount ?? 0) / 100;
  
  let imageUrl = product.thumbnail;
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = `${MEDUSA_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

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
        <View className="absolute right-5 top-5 z-10">
          <MaterialIcons name="favorite-border" size={20} color={colors.fgMuted} />
        </View>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="h-full w-full"
            contentFit="contain"
          />
        ) : (
          <MaterialIcons name="inventory-2" size={48} color={colors.muted} />
        )}
      </View>
      <Text
        style={{ color: colors.foreground }}
        className="px-2 text-[16px] font-black tracking-tight">
        {product.title}
      </Text>
      <Text
        style={{ color: colors.fgSecondary }}
        className="mt-1 px-2 text-[15px] font-bold">
        {formatCurrency(price)}
      </Text>
    </Pressable>
  );
}
