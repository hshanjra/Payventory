import { cn } from '@/lib/utils';
import { useKeyboard } from '@react-native-community/hooks';
import React from 'react';
import {
  GestureResponderEvent,
  Modal,
  ModalProps,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

export interface DialogProps extends ModalProps {
  title?: string;
  showCloseButton?: boolean;
  dismissOnOverlayPress?: boolean;
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  onClose?: () => void;
  onOverlayPress?: (event: GestureResponderEvent) => void;
  onCloseIconPress?: (event: GestureResponderEvent) => void;
}

export const Dialog: React.FC<DialogProps> = ({
  title,
  children,
  showCloseButton = true,
  dismissOnOverlayPress = true,
  className,
  containerClassName,
  contentClassName,
  headerClassName,
  animationType = 'fade',
  onClose,
  onOverlayPress,
  onCloseIconPress,
  ...modalProps
}) => {
  const safeAreaInsets = useSafeAreaInsets();
  const keyboard = useKeyboard();
  const { colors } = useTheme();

  const onRequestClose = React.useCallback<Exclude<ModalProps['onRequestClose'], undefined>>(
    (event) => {
      if (modalProps.onRequestClose) {
        return modalProps.onRequestClose(event);
      }

      onClose?.();
    },
    [modalProps, onClose]
  );

  const handleOverlayPress = React.useCallback(
    (event: GestureResponderEvent) => {
      if (dismissOnOverlayPress) {
        if (onOverlayPress) {
          return onOverlayPress(event);
        }

        onClose?.();
      }
    },
    [dismissOnOverlayPress, onOverlayPress, onClose]
  );

  const handleCloseIconPress = React.useCallback(
    (event: GestureResponderEvent) => {
      if (onCloseIconPress) {
        return onCloseIconPress(event);
      }

      onClose?.();
    },
    [onClose, onCloseIconPress]
  );

  return (
    <Modal
      transparent={true}
      statusBarTranslucent
      animationType={animationType}
      {...modalProps}
      onRequestClose={onRequestClose}>
      <View
        className={cn('flex-1 items-center justify-center bg-black/50', className)}
        style={{
          paddingTop: safeAreaInsets.top,
          paddingRight: safeAreaInsets.right,
          paddingLeft: safeAreaInsets.left,
          paddingBottom: keyboard.keyboardShown
            ? keyboard.keyboardHeight + (Platform.OS === 'android' ? safeAreaInsets.bottom : 0)
            : safeAreaInsets.bottom,
        }}>
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <View className="absolute inset-0" />
        </TouchableWithoutFeedback>

        <View className="max-h-full w-full items-center p-4">
          <View
            className={cn(
              'max-h-full w-full overflow-hidden rounded-[28px] p-6',
              containerClassName
            )}
            style={{ backgroundColor: colors.surface }}>
            {(title || showCloseButton) && (
              <View
                className={cn('mb-6 flex-row items-center justify-between gap-2', headerClassName)}>
                {title && <Text style={{ color: colors.foreground }} className="text-xl font-black tracking-tight">{title}</Text>}
                {showCloseButton && (
                  <TouchableOpacity
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.muted }}
                    onPress={handleCloseIconPress}
                    accessibilityLabel="Close dialog">
                    <MaterialIcons name="close" size={20} color={colors.foreground} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View className={contentClassName}>{children}</View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
