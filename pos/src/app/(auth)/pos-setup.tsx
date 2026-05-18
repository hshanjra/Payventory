import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { LayoutWithScroll } from '@/components/ui/layout';
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
  const { setDefaults, defaults } = usePosSettings();

  const [salesChannelId, setSalesChannelId] = useState<string | null>(
    defaults?.salesChannel.id ?? null
  );
  const [regionId, setRegionId] = useState<string | null>(defaults?.region.id ?? null);
  const [stockLocationId, setStockLocationId] = useState<string | null>(
    defaults?.stockLocation.id ?? null
  );
  const [departmentTagId, setDepartmentTagId] = useState<string | null>(
    defaults?.departmentTag?.id ?? null
  );
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
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  /* ---- Render ---- */

  return (
    <LayoutWithScroll
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="mb-8 mt-4 items-center gap-3">
        <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-2xl">
          <Image
            source={require('@/assets/icon.png')}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
          />
        </View>
        <View className="items-center gap-1">
          <Text
            className="text-[24px] font-extrabold tracking-[-0.4px]"
            style={{ color: colors.foreground }}>
            Set Up POS
          </Text>
          <Text
            className="text-center text-[14px] leading-[20px]"
            style={{ color: colors.fgSecondary }}>
            Configure your point-of-sale settings
          </Text>
        </View>
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
        <Text className="mt-4 text-center text-[14px] font-medium" style={{ color: colors.error }}>
          {error}
        </Text>
      )}

      {/* Save button */}
      <View
        className="mt-8 h-14 rounded-xl"
        style={{
          backgroundColor: canSave ? colors.primary : colors.primary + '40',
        }}>
        <Pressable
          className="h-full w-full items-center justify-center rounded-xl"
          style={({ pressed }) => ({
            backgroundColor: pressed && canSave ? 'rgba(0,0,0,0.1)' : 'transparent',
          })}
          disabled={!canSave}
          onPress={() => void onSave()}>
          {saving ? (
            <ActivityIndicator color={colors.primaryFg} />
          ) : (
            <Text className="text-[16px] font-bold" style={{ color: colors.primaryFg }}>
              Save & Continue
            </Text>
          )}
        </Pressable>
      </View>
    </LayoutWithScroll>
  );
}
