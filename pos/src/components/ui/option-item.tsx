import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type OptionItemProps = {
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
};

export function OptionItem({ label, sublabel, selected, onPress }: OptionItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 border-b px-4 py-3"
      style={{
        backgroundColor: selected ? colors.primary + '14' : 'transparent',
        borderBottomColor: colors.border,
      }}>
      {/* Radio dot */}
      <View
        className="h-5 w-5 items-center justify-center rounded-full border-2"
        style={{ borderColor: selected ? colors.primary : colors.fgMuted }}>
        {selected && (
          <View
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
        )}
      </View>

      <View className="flex-1">
        <Text
          className="text-[14px] font-semibold"
          style={{ color: selected ? colors.primary : colors.foreground }}>
          {label}
        </Text>
        {!!sublabel && (
          <Text className="mt-0.5 text-[12px]" style={{ color: colors.fgSecondary }}>
            {sublabel}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
