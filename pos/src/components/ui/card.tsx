import React from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: any;
  animate?: boolean;
}

export const Card = ({ children, className, style, animate = true }: CardProps) => {
  const { colors, isDark } = useTheme();

  const baseStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    boxShadow: isDark
      ? '0 16px 48px rgba(0,0,0,0.55)'
      : '0 8px 40px rgba(15,23,42,0.08)',
  };

  if (animate) {
    return (
      <Animated.View
        className={cn('gap-5 rounded-3xl border p-6', className)}
        style={[baseStyle, style]}
      >
        {children}
      </Animated.View>
    );
  }

  return (
    <View
      className={cn('gap-5 rounded-3xl border p-6', className)}
      style={[baseStyle, style]}
    >
      {children}
    </View>
  );
};
