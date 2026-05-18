import { View } from 'react-native';
import { HomeHeader } from './home-header';
import { SalesOverviewCard } from './sales-overview-card';
import { GreetingCard } from './greeting-card';
import { SearchBar } from './search-bar';
import { useTheme } from '@/theme/useTheme';
import { getTimeBasedGreeting } from '@/lib/utils';

interface HomeDashboardSectionProps {
  firstName: string;
  storeName?: string;
  storeAddress?: string;
  totalSalesToday: number;
  ordersCount: number;
}

export function HomeDashboardSection({
  firstName,
  storeName,
  storeAddress,
  totalSalesToday,
  ordersCount,
}: HomeDashboardSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={{ backgroundColor: colors.canvas }}>
      <HomeHeader storeName={storeName} storeAddress={storeAddress} />
      <SalesOverviewCard
        totalSalesToday={totalSalesToday}
        ordersCount={ordersCount}
      />
      <GreetingCard firstName={firstName} greeting={getTimeBasedGreeting()} />
      <SearchBar />
      <View className="mb-4" />
    </View>
  );
}
