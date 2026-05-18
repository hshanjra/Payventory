import { View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { useHomeData } from '@/hooks/use-home-data';

// Modular Components
import { HomeDashboardSection } from '@/components/home/home-dashboard-section';
import { ProductGrid } from '@/components/product/product-grid';
import { ProductGridLoader } from '@/components/product/product-grid-loader';

export default function HomeScreen() {
  const { colors } = useTheme();
  const {
    firstName,
    store,
    dashboardData,
    products,
    isProductsLoading,
    refreshing,
    onRefresh,
    onEndReached,
  } = useHomeData();

  const renderHeader = () => (
    <HomeDashboardSection
      firstName={firstName}
      storeName={store?.name}
      storeAddress={store?.address?.address_1}
      totalSalesToday={dashboardData.totalSalesToday}
      ordersCount={dashboardData.ordersCount}
    />
  );

  if (isProductsLoading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas }}>
        {renderHeader()}
        <ProductGridLoader />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ProductGrid
        products={products}
        renderHeader={renderHeader}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
      />
    </View>
  );
}
