import { cn } from '@/lib/utils';
import { Platform, ScrollView, ScrollViewProps, View, ViewProps } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';
import { useTheme } from '@/theme/useTheme';

export const Layout: React.FC<ViewProps> = ({ className, ...props }) => {
  const { colors } = useTheme();
  return (
    <View
      className={cn('px-safe-offset pt-safe-offset-1 flex-1', className)}
      style={{ backgroundColor: colors.canvas, ...(props.style as object) }}
      {...props}
    />
  );
};

export const LayoutWithScroll: React.FC<ScrollViewProps> = (props) => {
  const { colors } = useTheme();
  return (
    <View className="relative flex-1" style={{ backgroundColor: colors.canvas }}>
      <View className="pt-safe absolute left-0 right-0 top-0 z-10" />
      <ScrollView
        {...props}
        className={cn('flex-1', props.className)}
        contentContainerClassName={cn(
          'px-safe-offset-4 pt-safe-offset-6 pb-6',
          props.contentContainerClassName
        )}>
        {props.children}
      </ScrollView>
    </View>
  );
};

export const LayoutWithKeyboardAvoidingScroll: React.FC<KeyboardAwareScrollViewProps> = (props) => {
  const { colors } = useTheme();
  return (
    <View className="relative flex-1" style={{ backgroundColor: colors.canvas }}>
      <View className="pt-safe absolute left-0 right-0 top-0 z-10" />
      <KeyboardAwareScrollView
        {...props}
        bottomOffset={Platform.OS === 'android' ? 45 : 76}
        className={cn('flex-1', props.className)}
        contentContainerStyle={[{ backgroundColor: colors.canvas }, props.contentContainerStyle]}
        contentContainerClassName={cn(
          'px-safe-offset-4 pt-safe-offset-6 pb-6',
          props.contentContainerClassName
        )}>
        {props.children}
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </View>
  );
};
