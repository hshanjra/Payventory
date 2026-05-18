import { FlatList, RefreshControl, View, ViewStyle } from 'react-native';
import { ProductCard } from './product-card';
import { useTheme } from '@/theme/useTheme';

interface ProductGridProps {
  products: any[];
  renderHeader: () => React.ReactElement;
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  ListFooterComponent?: React.ReactElement;
}

export function ProductGrid({
  products,
  renderHeader,
  refreshing,
  onRefresh,
  onEndReached,
  ListFooterComponent,
}: ProductGridProps) {
  const { colors } = useTheme();

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProductCard product={item} />}
      ListHeaderComponent={renderHeader}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 24 } as ViewStyle}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListFooterComponent={ListFooterComponent ?? <View className="h-28" />}
      showsVerticalScrollIndicator={false}
    />
  );
}
