import React from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

interface SettingsItemProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  value?: string | boolean;
  type?: 'link' | 'switch' | 'info';
  onPress?: () => void;
  isLast?: boolean;
  iconColor?: string;
}

export const SettingsItem = ({
  label,
  icon,
  value,
  type,
  onPress,
  isLast = false,
  iconColor,
}: SettingsItemProps) => {
  const { colors } = useTheme();

  const Content = (
    <View
      className="flex-row items-center justify-between px-5 py-4"
      style={{
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View className="flex-1 flex-row items-center gap-3">
        {icon && (
          <MaterialIcons
            name={icon}
            size={22}
            color={iconColor || colors.primary}
          />
        )}
        <Text style={{ color: colors.foreground }} className="text-[15px] font-bold">
          {label}
        </Text>
      </View>

      {type === 'switch' ? (
        <Switch
          value={value as boolean}
          onValueChange={onPress ? () => onPress() : undefined}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {typeof value === 'string' && (
            <Text
              style={{ color: colors.fgSecondary }}
              className="text-[13px] font-medium"
            >
              {value}
            </Text>
          )}
          {type === 'link' && onPress && (
            <MaterialIcons name="chevron-right" size={20} color={colors.fgMuted} />
          )}
        </View>
      )}
    </View>
  );

  if (type === 'switch' || type === 'info') {
    return <View>{Content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.muted : 'transparent',
      })}
    >
      {Content}
    </Pressable>
  );
};
