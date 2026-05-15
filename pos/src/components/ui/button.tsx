import { cn } from '@/lib/utils';
import * as React from 'react';
import { Pressable, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

export type ButtonProps = TouchableOpacityProps & {
  isPending?: boolean;
  variant?: 'primary' | 'solid' | 'outline' | 'ghost' | 'danger';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  textClassName?: string;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  isPending = false,
  disabled = false,
  variant = 'solid',
  icon,
  iconPosition = 'right',
  textClassName,
  ...props
}) => {
  const { colors } = useTheme();

  // Determine dynamic styles based on variant
  const getVariantStyles = () => {
    if (disabled || isPending) {
      return {
        container: { backgroundColor: colors.muted },
        text: { color: colors.fgMuted },
      };
    }

    switch (variant) {
      case 'primary':
      case 'solid':
        return {
          container: { backgroundColor: colors.primary },
          text: { color: colors.primaryFg },
        };
      case 'outline':
        return {
          container: { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 },
          text: { color: colors.foreground },
        };
      case 'danger':
        return {
          container: { backgroundColor: colors.error },
          text: { color: colors.primaryFg }, // Usually white
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: colors.primary },
        };
      default:
        return {
          container: { backgroundColor: colors.surface },
          text: { color: colors.foreground },
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled || isPending}
      className={cn(
        'items-center justify-center gap-x-2 rounded-xl p-4',
        iconPosition === 'left' ? 'flex-row-reverse' : 'flex-row',
        className
      )}
      style={styles.container}
      {...props}>
      <Text
        className={cn('text-[16px] font-bold tracking-wide', textClassName)}
        style={styles.text}>
        {children}
      </Text>
      {isPending && (
        <MaterialIcons name="refresh" size={16} color={styles.text.color} className="animate-spin" />
      )}
      {typeof icon !== 'undefined' && !isPending ? icon : null}
    </TouchableOpacity>
  );
};
