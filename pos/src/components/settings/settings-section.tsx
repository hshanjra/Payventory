import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
}

export const SettingsSection = ({ title, children }: SettingsSectionProps) => {
  const { colors } = useTheme();

  return (
    <View className="mb-8">
      {title && (
        <Text
          style={{ color: colors.fgSecondary }}
          className="mb-4 text-[12px] font-black uppercase tracking-[2px]"
        >
          {title}
        </Text>
      )}
      <View
        className="overflow-hidden rounded-3xl border"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        {children}
      </View>
    </View>
  );
};
