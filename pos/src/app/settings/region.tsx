import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { SettingsHeader } from '@/components/settings/settings-header';
import { SettingsSection } from '@/components/settings/settings-section';
import { SettingsItem } from '@/components/settings/settings-item';
import { useRegions } from '@/hooks/api/regions';
import { usePosSettings } from '@/contexts/settings';
import { AdminRegion } from '@medusajs/types';

export default function RegionSettingsScreen() {
  const { colors } = useTheme();
  const { defaults, setDefaults } = usePosSettings();
  const regionsQuery = useRegions();

  const regions = useMemo(
    () => regionsQuery.data?.pages.flatMap((p) => p.regions ?? []) ?? [],
    [regionsQuery.data]
  );

  const handleSelect = async (region: AdminRegion) => {
    if (!defaults) return;
    await setDefaults({
      ...defaults,
      region: {
        id: region.id,
        name: region.name,
        currency_code: region.currency_code,
        automatic_taxes: region.automatic_taxes ?? undefined,
        countries: region.countries ?? [],
      },
    });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.canvas }}>
      <Stack.Screen options={{ title: 'Region', headerShown: false }} />
      <SettingsHeader title="Region" />

      <ScrollView className="flex-1 px-6">
        {regionsQuery.isLoading ? (
          <ActivityIndicator className="mt-10" color={colors.primary} />
        ) : (
          <SettingsSection title="AVAILABLE REGIONS">
            {regions.map((region, index) => (
              <SettingsItem
                key={region.id}
                label={region.name}
                value={region.id === defaults?.region.id ? 'Active' : region.currency_code.toUpperCase()}
                onPress={() => handleSelect(region)}
                isLast={index === regions.length - 1}
                icon={region.id === defaults?.region.id ? 'check-circle' : 'public'}
              />
            ))}
          </SettingsSection>
        )}
        
        <Text className="mt-4 px-2 text-[13px] leading-5" style={{ color: colors.fgSecondary }}>
          Select the region for this POS terminal. This affects currency and tax calculations.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
