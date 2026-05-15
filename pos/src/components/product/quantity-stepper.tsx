import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  isPending?: boolean;
}

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  isPending = false,
}: QuantityStepperProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: colors.border,
        overflow: 'hidden',
        height: 72,
      }}>
      {/* Decrement */}
      <Pressable
        onPress={onDecrement}
        disabled={isPending}
        style={({ pressed }) => ({
          width: 80,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed ? colors.muted : 'transparent',
        })}>
        <MaterialIcons
          name="remove"
          size={32}
          color={quantity < 1 ? colors.mutedFg : colors.foreground}
        />
      </Pressable>

      {/* Count */}
      <View
        style={{
          width: 2,
          height: 32,
          backgroundColor: colors.border,
        }}
      />
      <View
        style={{
          flex: 1,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {isPending ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text
            className="text-[24px] font-black"
            style={{ color: colors.foreground }}>
            {quantity}
          </Text>
        )}
      </View>
      <View
        style={{
          width: 2,
          height: 32,
          backgroundColor: colors.border,
        }}
      />

      {/* Increment */}
      <Pressable
        onPress={onIncrement}
        disabled={isPending}
        style={({ pressed }) => ({
          width: 80,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed ? colors.muted : 'transparent',
        })}>
        <MaterialIcons name="add" size={32} color={colors.foreground} />
      </Pressable>
    </View>
  );
}
