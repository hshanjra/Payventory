import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface GreetingCardProps {
  firstName: string;
}

export function GreetingCard({ firstName }: GreetingCardProps) {
  const { colors } = useTheme();

  return (
    <View className="px-6 pb-2 pt-4">
      <View
        className="rounded-[32px] border p-6"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
        <Text style={{ color: colors.fgSecondary }} className="text-[14px] font-medium">
          Good morning,
        </Text>
        <Text
          style={{ color: colors.primary }}
          className="text-[28px] font-black tracking-tight">
          {firstName}!
        </Text>
      </View>
    </View>
  );
}
