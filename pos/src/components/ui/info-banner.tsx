import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from './text';
import { useTheme } from '@/theme/useTheme';

export type InfoBannerProps = {
  variant?: 'ghost' | 'solid' | 'outline';
  colorScheme?: 'error' | 'warning' | 'success';
  textClassName?: string;
  className?: string;
  children?: React.ReactNode;
};

export const InfoBanner = ({
  variant = 'solid',
  colorScheme = 'warning',
  textClassName,
  className,
  children,
}: InfoBannerProps) => {
  const { colors } = useTheme();

  const getColors = () => {
    switch (colorScheme) {
      case 'error':
        return { text: colors.error, bg: colors.errorBg, icon: colors.error };
      case 'warning':
        return { text: colors.warning, bg: colors.warningBg, icon: colors.warning };
      case 'success':
        return { text: colors.success, bg: colors.successBg, icon: colors.success };
      default:
        return { text: colors.foreground, bg: colors.muted, icon: colors.fgMuted };
    }
  };

  const schemeColors = getColors();

  return (
    <View 
      className={cn(
        'items-center flex-row',
        {
          'p-4 rounded-xl justify-between gap-2': variant === 'solid' || variant === 'outline',
          'border': variant === 'outline',
          'gap-2 flex-row-reverse': variant === 'ghost',
        },
        className
      )}
      style={{
        backgroundColor: variant === 'solid' ? schemeColors.bg : variant === 'outline' ? colors.surface : 'transparent',
        borderColor: variant === 'outline' ? schemeColors.text : 'transparent',
      }}
    >
      <View className="flex-1">
        <Text 
          className={cn('text-sm font-medium', textClassName)}
          style={{ color: schemeColors.text }}
        >
          {children}
        </Text>
      </View>
      <MaterialIcons 
        name={colorScheme === 'success' ? 'check-circle' : 'error'} 
        size={16} 
        color={schemeColors.icon} 
      />
    </View>
  );
};
