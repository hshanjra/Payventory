import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
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

type PickerKey = 'salesChannel' | 'region' | 'stockLocation' | 'department';

function OptionRow({
  label,
  sublabel,
  selected,
  onPress,
  colors,
}: {
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-2 flex-row items-center justify-between rounded-2xl border-[1.5px] p-3.5"
      style={{
        backgroundColor: selected ? colors.primary + '1a' : colors.muted,
        borderColor: selected ? colors.primary : colors.border,
      }}>
      <View className="flex-1 pr-2">
        <Text className="text-[15px] font-bold" style={{ color: colors.foreground }}>
          {label}
        </Text>
        {!!sublabel && (
          <Text className="mt-0.5 text-[12px]" style={{ color: colors.fgSecondary }}>
            {sublabel}
          </Text>
        )}
      </View>
      <View
        className="h-[22px] w-[22px] items-center justify-center rounded-full border-2"
        style={{ borderColor: selected ? colors.primary : colors.fgMuted }}>
        {selected && (
          <View
            className="h-[11px] w-[11px] rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
        )}
      </View>
    </Pressable>
  );
}

export default function PosSetupScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { setDefaults } = usePosSettings();

  const [salesChannelId, setSalesChannelId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);
  const [stockLocationId, setStockLocationId] = useState<string | null>(null);
  const [departmentTagId, setDepartmentTagId] = useState<string | null>(null);
  const [openPicker, setOpenPicker] = useState<PickerKey | null>('salesChannel');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const channelsQuery = useSalesChannels({ limit: 100 });
  const regionsQuery = useRegions({ limit: 100 });
  const locationsQuery = useStockLocations({ limit: 100 });
  const tagsQuery = useProductTags({ limit: 200 });

  const channels: AdminSalesChannel[] = channelsQuery.sales_channels ?? [];
  const regions: AdminRegion[] = regionsQuery.regions ?? [];
  const locations: AdminStockLocation[] = locationsQuery.stock_locations ?? [];
  const tags: AdminProductTag[] = tagsQuery.data?.product_tags ?? [];

  const summary = useMemo(() => {
    const ch = channels.find((c) => c.id === salesChannelId);
    const reg = regions.find((r) => r.id === regionId);
    const loc = locations.find((l) => l.id === stockLocationId);
    const tag = tags.find((t) => t.id === departmentTagId);
    return {
      salesChannel: ch?.name ?? (salesChannelId ? 'Selected' : 'Choose…'),
      region: reg?.name ?? (regionId ? 'Selected' : 'Choose…'),
      store: loc?.name ?? (stockLocationId ? 'Selected' : 'Choose…'),
      department: tag?.value ?? (departmentTagId ? 'Selected' : 'All departments'),
    };
  }, [channels, regions, locations, tags, salesChannelId, regionId, stockLocationId, departmentTagId]);

  const gradientColors: [string, string] = isDark ? ['#020617', '#0d1b35'] : ['#eef2ff', colors.canvas];

  const loadingList =
    openPicker === 'salesChannel'
      ? channelsQuery.isLoading
      : openPicker === 'region'
        ? regionsQuery.isLoading
        : openPicker === 'stockLocation'
          ? locationsQuery.isLoading
          : tagsQuery.isLoading;

  const canSave =
    !!salesChannelId?.trim() && !!regionId?.trim() && !!stockLocationId?.trim() && !saving;

  const onSave = async () => {
    setError('');
    if (!canSave) {
      setError('Select sales channel, region, and store.');
      return;
    }
    const payload: PosDefaults = {
      salesChannelId: salesChannelId!,
      regionId: regionId!,
      stockLocationId: stockLocationId!,
      departmentTagId: departmentTagId ?? undefined,
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

  return (
    <View className="flex-1" style={{ backgroundColor: colors.canvas }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={gradientColors} className="absolute inset-0" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 28,
          flexGrow: 1,
        }}
        className="flex-grow px-5"
        showsVerticalScrollIndicator={false}>
        <View className="mb-6 items-center gap-2 py-2">
          <View
            className="mb-1 h-16 w-16 items-center justify-center rounded-[20px]"
            style={{ backgroundColor: colors.primary + '1e' }}>
            <MaterialIcons name="tune" size={32} color={colors.primary} />
          </View>
          <Text
            className="text-center text-[26px] font-extrabold tracking-[-0.4px]"
            style={{ color: colors.foreground }}>
            POS defaults
          </Text>
          <Text
            className="text-center text-[15px] leading-[22px]"
            style={{ color: colors.fgSecondary }}>
            Choose where you sell and how product search is scoped. Department (tag) is optional.
          </Text>
        </View>

        {/* Quick nav */}
        <View className="mb-4 flex-row flex-wrap gap-2">
          {(
            [
              ['salesChannel', 'Sales channel', summary.salesChannel],
              ['region', 'Region', summary.region],
              ['stockLocation', 'Store', summary.store],
              ['department', 'Department', summary.department],
            ] as const
          ).map(([key, title, value]) => (
            <Pressable
              key={key}
              onPress={() => setOpenPicker(key)}
              className="min-w-[46%] flex-1 rounded-2xl border px-3 py-2.5"
              style={{
                backgroundColor: openPicker === key ? colors.primary + '22' : colors.surface,
                borderColor: openPicker === key ? colors.primary : colors.border,
              }}>
              <Text className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.fgMuted }}>
                {title}
              </Text>
              <Text
                className="mt-1 text-[13px] font-bold"
                numberOfLines={1}
                style={{ color: colors.foreground }}>
                {value}
              </Text>
            </Pressable>
          ))}
        </View>

        <View
          className="rounded-3xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.55)' : '0 8px 40px rgba(26,86,219,0.08)',
          }}>
          <Text
            className="mb-3 text-[13px] font-semibold uppercase tracking-wider"
            style={{ color: colors.fgMuted }}>
            {openPicker === 'salesChannel' && 'Sales channel'}
            {openPicker === 'region' && 'Region'}
            {openPicker === 'stockLocation' && 'Store (stock location)'}
            {openPicker === 'department' && 'Department (product tag, optional)'}
          </Text>

          {loadingList ? (
            <View className="items-center py-10">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : openPicker === 'salesChannel' ? (
            channels.map((c: AdminSalesChannel) => (
              <OptionRow
                key={c.id}
                label={c.name}
                sublabel={c.description ?? undefined}
                selected={salesChannelId === c.id}
                onPress={() => setSalesChannelId(c.id)}
                colors={colors}
              />
            ))
          ) : openPicker === 'region' ? (
            regions.map((r: AdminRegion) => (
              <OptionRow
                key={r.id}
                label={r.name}
                sublabel={r.currency_code}
                selected={regionId === r.id}
                onPress={() => setRegionId(r.id)}
                colors={colors}
              />
            ))
          ) : openPicker === 'stockLocation' ? (
            locations.map((l: AdminStockLocation) => (
              <OptionRow
                key={l.id}
                label={l.name}
                selected={stockLocationId === l.id}
                onPress={() => setStockLocationId(l.id)}
                colors={colors}
              />
            ))
          ) : (
            <>
              <OptionRow
                label="All departments"
                sublabel="No tag filter on catalog search"
                selected={departmentTagId === null}
                onPress={() => setDepartmentTagId(null)}
                colors={colors}
              />
              {tags.map((t: AdminProductTag) => (
                <OptionRow
                  key={t.id}
                  label={t.value}
                  selected={departmentTagId === t.id}
                  onPress={() => setDepartmentTagId(t.id)}
                  colors={colors}
                />
              ))}
            </>
          )}
        </View>

        {!!error && (
          <Text className="mt-4 text-center text-[14px] font-medium" style={{ color: colors.error }}>
            {error}
          </Text>
        )}

        <Pressable
          className="mt-6 overflow-hidden rounded-2xl"
          style={({ pressed }) => (pressed ? { opacity: 0.88 } : {})}
          disabled={!canSave}
          onPress={() => void onSave()}>
          <LinearGradient
            colors={['#2563eb', colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="h-14 flex-row items-center justify-center gap-2">
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-[16px] font-bold tracking-[0.3px] text-white">Save & continue</Text>
            )}
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}
