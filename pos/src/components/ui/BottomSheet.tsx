import React, { useRef, useEffect } from 'react';
import { Modal, View, Pressable, Animated, Dimensions, PanResponder, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const { colors } = useTheme();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 14 }).start();
    }
  }, [visible, slideAnim]);

  const closePrompt = () => {
    Animated.timing(slideAnim, { toValue: screenHeight, duration: 160, useNativeDriver: true })
      .start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.5) closePrompt();
        else Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
      },
      onPanResponderMove: (_, g) => { if (g.dy > 0) slideAnim.setValue(g.dy); },
    })
  ).current;

  if (!visible && slideAnim.addListener === undefined) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closePrompt}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={closePrompt} />
        <Animated.View
          {...panResponder.panHandlers}
          style={{ transform: [{ translateY: slideAnim }], width: '100%', maxHeight: '90%', flexShrink: 1 }}>

          {/* Close button */}
          <View className="w-full items-center pb-3">
            <Pressable
              onPress={closePrompt}
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
              className="h-10 w-10 items-center justify-center rounded-full">
              <MaterialIcons name="close" size={20} color={colors.mutedFg} />
            </Pressable>
          </View>

          {/* Sheet */}
          <View
            style={{ backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, paddingBottom: insets.bottom || 28 }}
            className="w-full shrink rounded-t-[28px] px-6 pt-3">
            <View className="mb-3 items-center">
              <View style={{ backgroundColor: colors.borderStrong }} className="h-1 w-10 rounded-full" />
            </View>
            {title && (
              <View className="mb-5">
                <Text style={{ color: colors.foreground }} className="text-xl font-bold tracking-tight">{title}</Text>
              </View>
            )}
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
