import { cn } from '@/lib/utils';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Switch, TouchableOpacity, View } from 'react-native';
import { Text } from '../ui/text';
import { useTheme } from '@/theme/useTheme';

interface SwitchFieldProps {
  name: string;
  label: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function SwitchField({
  name,
  label,
  description,
  className = '',
  disabled = false,
}: SwitchFieldProps) {
  const { control } = useFormContext();
  const {
    field: { onChange, value = false },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const { colors, isDark } = useTheme();

  return (
    <View className={cn('w-full', className)}>
      <TouchableOpacity
        onPress={() => !disabled && onChange(!value)}
        disabled={disabled}
        activeOpacity={0.7}
        className={cn('flex-row items-center justify-between rounded-xl border px-4 py-4', {
          'opacity-50': disabled,
        })}
        style={{
          backgroundColor: colors.surface,
          borderColor: error ? colors.error : colors.border,
        }}>
        <View className="mr-4 flex-1">
          <Text className="font-bold">{label}</Text>
          {description && (
            <Text className="mt-1 text-sm" style={{ color: colors.fgSecondary }}>
              {description}
            </Text>
          )}
        </View>
        <Switch
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          trackColor={{
            false: isDark ? colors.muted : '#E5E5E5',
            true: colors.primary,
          }}
          thumbColor="#FFFFFF"
        />
      </TouchableOpacity>
      {error && (
        <Text className="mt-1 text-sm" style={{ color: colors.error }}>
          {error.message}
        </Text>
      )}
    </View>
  );
}
