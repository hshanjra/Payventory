import { cn } from '@/lib/utils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { InfoBanner } from '../ui/info-banner';
import { useTheme } from '@/theme/useTheme';

interface TextFieldProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  name: string;
  placeholder?: string;
  floatingPlaceholder?: boolean;
  className?: string;
  inputClassName?: string;
  errorClassName?: string;
  errorVariation?: 'default' | 'inline';
}

export function TextField({
  name,
  placeholder,
  floatingPlaceholder = false,
  className = '',
  inputClassName = '',
  errorClassName = '',
  errorVariation = 'default',
  secureTextEntry,
  ...textInputProps
}: TextFieldProps) {
  const { control } = useFormContext();
  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showValue, setShowValue] = useState(false);

  const showFloating = isFocused || !!value;
  const floatingPlaceholderTranslateY = useSharedValue(0);
  const floatingPlaceholderScale = useSharedValue(1);

  const floatingPlaceholderStyle = useAnimatedStyle(() => {
    return {
      transformOrigin: 'top left',
      transform: [
        {
          translateY: floatingPlaceholderTranslateY.value,
        },
        {
          scale: floatingPlaceholderScale.value,
        },
      ],
    };
  });

  useEffect(() => {
    if (showFloating) {
      floatingPlaceholderTranslateY.value = withTiming(-7, { duration: 150 });
      floatingPlaceholderScale.value = withTiming(0.6825, { duration: 150 });
    } else {
      floatingPlaceholderTranslateY.value = withTiming(0, { duration: 150 });
      floatingPlaceholderScale.value = withTiming(1, { duration: 150 });
    }
  }, [floatingPlaceholderScale, floatingPlaceholderTranslateY, showFloating]);

  return (
    <View className={className}>
      <View className="relative justify-center">
        {floatingPlaceholder && (
          <Animated.Text
            className={cn('absolute left-3 z-10 text-base')}
            style={[
              floatingPlaceholderStyle,
              { color: error ? colors.error : isFocused ? colors.primary : colors.fgMuted },
            ]}
            pointerEvents="none">
            {placeholder}
          </Animated.Text>
        )}
        <TextInput
          className={cn(
            'rounded-xl border px-3 py-4 text-base font-medium',
            {
              'pb-2 pt-6': floatingPlaceholder,
              'pr-10': (error && errorVariation === 'inline') || secureTextEntry,
            },
            inputClassName
          )}
          style={{
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
            color: colors.foreground,
          }}
          placeholder={floatingPlaceholder ? undefined : placeholder}
          placeholderTextColor={colors.fgMuted}
          value={value || ''}
          secureTextEntry={secureTextEntry && !showValue}
          onChangeText={onChange}
          onBlur={() => {
            setIsFocused(false);
            onBlur();
          }}
          onFocus={() => setIsFocused(true)}
          {...textInputProps}
        />
        {secureTextEntry && (
          <TouchableOpacity
            className="absolute right-3 p-1"
            onPress={() => setShowValue(!showValue)}>
            <MaterialIcons
              name={showValue ? 'visibility' : 'visibility-off'}
              size={20}
              color={colors.fgMuted}
            />
          </TouchableOpacity>
        )}
        {error && errorVariation === 'inline' && !secureTextEntry && (
          <View className="absolute right-3">
            <MaterialIcons name="error" size={20} color={colors.error} />
          </View>
        )}
      </View>
      {error && errorVariation === 'default' && (
        <InfoBanner
          colorScheme="error"
          variant="ghost"
          className={cn('mt-2 gap-1', errorClassName)}
          textClassName="text-2xs">
          {error.message}
        </InfoBanner>
      )}
    </View>
  );
}
