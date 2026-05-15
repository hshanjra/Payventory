import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { SelectField } from '@/components/ui/select-field';
import { useTheme } from '@/theme/useTheme';
import { usePosSettings, type PosDefaults } from '@/contexts/settings';
import { useSalesChannels } from '@/hooks/api/sales-channels';
import { useRegions } from '@/hooks/api/regions';
import { useStockLocations } from '@/hooks/api/stock-locations';
import { useProductTags } from '@/hooks/api/products';
import type {
  AdminProductTag,
  AdminRegion,
  AdminSalesChannel,
  AdminStockLocation,
} from '@medusajs/types';

export default function PosSetupScreen() {
  const { colors } = useTheme();
  const { setDefaults } = usePosSettings();

  const [salesChannelId, setSalesChannelId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);
  const [stockLocationId, setStockLocationId] = useState<string | null>(null);
  const [departmentTagId, setDepartmentTagId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  /* ---- Queries ---- */

  const channelsQuery = useSalesChannels();
  const channels = useMemo(
    () => channelsQuery.data?.pages.flatMap((p) => p.sales_channels) ?? [],
    [channelsQuery.data]
  );

  const regionsQuery = useRegions();
  const regions = useMemo(
    () => regionsQuery.data?.pages.flatMap((p) => p.regions ?? []) ?? [],
    [regionsQuery.data]
  );

  const locationsQuery = useStockLocations();
  const locations = useMemo(
    () => locationsQuery.data?.pages.flatMap((p) => p.stock_locations) ?? [],
    [locationsQuery.data]
  );

  const tagsQuery = useProductTags();
  const tags = useMemo(
    () => tagsQuery.data?.pages.flatMap((p) => p.product_tags) ?? [],
    [tagsQuery.data]
  );

  /* ---- Save ---- */

  const canSave =
    !!salesChannelId?.trim() && !!regionId?.trim() && !!stockLocationId?.trim() && !saving;

  const onSave = async () => {
    setError('');

    const ch = channels.find((c) => c.id === salesChannelId);
    const reg = regions.find((r) => r.id === regionId);
    const loc = locations.find((l) => l.id === stockLocationId);
    const tag = tags.find((t) => t.id === departmentTagId);

    if (!ch || !reg || !loc) {
      setError('Select sales channel, region, and store.');
      return;
    }

    const payload: PosDefaults = {
      salesChannel: {
        id: ch.id,
        name: ch.name,
        description: ch.description ?? undefined,
      },
      region: {
        id: reg.id,
        name: reg.name,
        currency_code: reg.currency_code,
        automatic_taxes: reg.automatic_taxes ?? undefined,
        countries: reg.countries ?? [],
      },
      stockLocation: {
        id: loc.id,
        name: loc.name,
        address: loc.address
          ? {
              id: loc.address.id || '',
              address_1: loc.address.address_1 || '',
              address_2: loc.address.address_2 ?? null,
              company: loc.address.company ?? null,
              country_code: loc.address.country_code ?? null,
              city: loc.address.city ?? null,
              phone: loc.address.phone ?? null,
              postal_code: loc.address.postal_code ?? null,
              province: loc.address.province ?? null,
            }
          : undefined,
      },
      departmentTag: tag
        ? {
            id: tag.id,
            value: tag.value,
          }
        : null,
    };

    try {
      setSaving(true);
      await setDefaults(payload);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  /* ---- Render ---- */

  return (
    <View className="flex-1" style={{ backgroundColor: colors.canvas }}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          className="flex-grow px-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="mb-8 mt-4 items-center gap-1">
            <Text
              className="text-[24px] font-extrabold tracking-[-0.4px]"
              style={{ color: colors.foreground }}>
              POS Defaults
            </Text>
            <Text
              className="text-center text-[14px] leading-[20px]"
              style={{ color: colors.fgSecondary }}>
              Configure your point-of-sale settings
            </Text>
          </View>

          {/* Fields */}
          <View className="gap-5">
            <SelectField<AdminSalesChannel>
              label="Sales Channel"
              placeholder="Select a sales channel"
              selectedId={salesChannelId}
              items={channels}
              isLoading={channelsQuery.isLoading}
              renderLabel={(c) => c.name}
              renderSublabel={(c) => c.description ?? undefined}
              onSelect={setSalesChannelId}
            />

            <SelectField<AdminRegion>
              label="Region"
              placeholder="Select a region"
              selectedId={regionId}
              items={regions}
              isLoading={regionsQuery.isLoading}
              renderLabel={(r) => r.name}
              renderSublabel={(r) => r.currency_code}
              onSelect={setRegionId}
            />

            <SelectField<AdminStockLocation>
              label="Store"
              placeholder="Select a store location"
              selectedId={stockLocationId}
              items={locations}
              isLoading={locationsQuery.isLoading}
              renderLabel={(l) => l.name}
              onSelect={setStockLocationId}
            />

            <SelectField<AdminProductTag>
              label="Department"
              placeholder="All departments"
              selectedId={departmentTagId}
              items={tags}
              isLoading={tagsQuery.isLoading}
              renderLabel={(t) => t.value}
              onSelect={setDepartmentTagId}
              optional
              optionalLabel="All departments"
            />
          </View>

          {/* Error */}
          {!!error && (
            <Text
              className="mt-4 text-center text-[14px] font-medium"
              style={{ color: colors.error }}>
              {error}
            </Text>
          )}

          {/* Save button */}
          <Pressable
            className="mt-8 h-14 items-center justify-center rounded-xl"
            style={({ pressed }) => ({
              backgroundColor: canSave ? colors.primary : colors.primary + '40',
              opacity: pressed && canSave ? 0.88 : 1,
            })}
            disabled={!canSave}
            onPress={() => void onSave()}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-[16px] font-bold text-white">Save & Continue</Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
