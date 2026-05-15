import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { Layout } from '@/components/ui/layout';
import { SettingsHeader } from '@/components/settings/settings-header';
import { SettingsSection } from '@/components/settings/settings-section';
import { SettingsItem } from '@/components/settings/settings-item';
import { useProductTags } from '@/hooks/api/products';
import { usePosSettings } from '@/contexts/settings';
import { AdminProductTag } from '@medusajs/types';

export default function DepartmentSettingsScreen() {
  const { colors } = useTheme();
  const { defaults, setDefaults } = usePosSettings();
  const tagsQuery = useProductTags();

  const tags = useMemo(
    () => tagsQuery.data?.pages.flatMap((p) => p.product_tags) ?? [],
    [tagsQuery.data]
  );

  const handleSelect = async (tag: AdminProductTag | null) => {
    if (!defaults) return;
    await setDefaults({
      ...defaults,
      departmentTag: tag ? {
        id: tag.id,
        value: tag.value,
      } : null,
    });
  };

  return (
    <Layout className="px-0 pt-0">
      <Stack.Screen options={{ title: 'Department', headerShown: false }} />
      <SettingsHeader title="Department" />

      <ScrollView className="flex-1 px-6">
        {tagsQuery.isLoading ? (
          <ActivityIndicator className="mt-10" color={colors.primary} />
        ) : (
          <SettingsSection title="DEPARTMENTS">
            <SettingsItem
              label="All Departments"
              value={!defaults?.departmentTag ? 'Active' : ''}
              onPress={() => handleSelect(null)}
              isLast={tags.length === 0}
              icon={!defaults?.departmentTag ? 'check-circle' : 'radio-button-unchecked'}
            />
            {tags.map((tag, index) => (
              <SettingsItem
                key={tag.id}
                label={tag.value}
                value={tag.id === defaults?.departmentTag?.id ? 'Active' : ''}
                onPress={() => handleSelect(tag)}
                isLast={index === tags.length - 1}
                icon={tag.id === defaults?.departmentTag?.id ? 'check-circle' : 'radio-button-unchecked'}
              />
            ))}
          </SettingsSection>
        )}
        
        <Text className="mt-4 px-2 text-[13px] leading-5" style={{ color: colors.fgSecondary }}>
          Selecting a department will filter the products shown on the main screen to only those with the matching tag.
        </Text>
      </ScrollView>
    </Layout>
  );
}
