import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  className?: string;
}

export const PageHeader = ({ title, subtitle, icon, className }: PageHeaderProps) => {
  const { colors } = useTheme();

  return (
    <View className={cn('mb-6 items-center gap-2 py-2', className)}>
      {icon && (
        <View
          className="mb-1 h-16 w-16 items-center justify-center rounded-[20px]"
          style={{ backgroundColor: colors.primary + '12' }}>
          <MaterialIcons name={icon} size={32} color={colors.primary} />
        </View>
      )}
      <Text
        className="text-center text-[28px] font-extrabold tracking-[-0.4px]"
        style={{ color: colors.primary }}>
        {title}
      </Text>
      {subtitle && (
        <Text
          className="text-center text-[15px] leading-[22px]"
          style={{ color: colors.fgSecondary }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};
