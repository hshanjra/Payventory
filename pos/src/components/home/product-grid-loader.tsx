import React from 'react';
import { View } from 'react-native';
import { ProductSkeleton } from './product-skeleton';

export function ProductGridLoader() {
  return (
    <View className="flex-row flex-wrap justify-between px-6">
      {[...Array(6)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </View>
  );
}
