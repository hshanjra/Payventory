import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { SettingsHeader } from '@/components/settings/settings-header';
import { SettingsSection } from '@/components/settings/settings-section';
import { SettingsItem } from '@/components/settings/settings-item';
import { useSalesChannels } from '@/hooks/api/sales-channels';
import { usePosSettings } from '@/contexts/settings';
import { AdminSalesChannel } from '@medusajs/types';

export default function SalesChannelSettingsScreen() {
  const { colors } = useTheme();
  const { defaults, setDefaults } = usePosSettings();
  const channelsQuery = useSalesChannels();

  const channels = useMemo(
    () => channelsQuery.data?.pages.flatMap((p) => p.sales_channels) ?? [],
    [channelsQuery.data]
  );

  const handleSelect = async (channel: AdminSalesChannel) => {
    if (!defaults) return;
    await setDefaults({
      ...defaults,
      salesChannel: {
        id: channel.id,
        name: channel.name,
        description: channel.description ?? undefined,
      },
    });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.canvas }}>
      <Stack.Screen options={{ title: 'Sales Channel', headerShown: false }} />
      <SettingsHeader title="Sales Channel" />

      <ScrollView className="flex-1 px-6">
        {channelsQuery.isLoading ? (
          <ActivityIndicator className="mt-10" color={colors.primary} />
        ) : (
          <SettingsSection title="AVAILABLE CHANNELS">
            {channels.map((channel, index) => (
              <SettingsItem
                key={channel.id}
                label={channel.name}
                value={channel.id === defaults?.salesChannel.id ? 'Active' : ''}
                onPress={() => handleSelect(channel)}
                isLast={index === channels.length - 1}
                icon={channel.id === defaults?.salesChannel.id ? 'check-circle' : 'radio-button-unchecked'}
              />
            ))}
          </SettingsSection>
        )}
        
        <Text className="mt-4 px-2 text-[13px] leading-5" style={{ color: colors.fgSecondary }}>
          Select the sales channel that this POS terminal should use for new orders.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
