import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface GreetingCardProps {
  firstName: string;
  greeting: string;
}

export function GreetingCard({ firstName, greeting }: GreetingCardProps) {
  const { colors } = useTheme();

  return (
    <View className="px-8 pb-4 pt-2">
      <Text style={{ color: colors.fgSecondary }} className="text-[14px] font-bold uppercase tracking-widest">
        {greeting},
      </Text>
      <Text
        style={{ color: colors.primary }}
        className="text-[32px] font-black tracking-tight">
        {firstName}!
      </Text>
    </View>
  );
}
