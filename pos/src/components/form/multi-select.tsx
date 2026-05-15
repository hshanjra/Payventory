import React from 'react';
import { FlatList, ListRenderItemInfo, TextInput, TouchableOpacity, View } from 'react-native';
import { BaseSelectField, BaseSelectProps, SelectOption } from './base-select';
import { cn } from '@/lib/utils';
import { Text } from '../ui/text';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

interface TMultiSelectOption {
  label: string;
  value: string;
}

const MultiSelectOption: React.FC<{
  option: TMultiSelectOption;
  isSelected: boolean;
  toggleOption: (value: string) => void;
}> = ({ option, isSelected, toggleOption }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      key={option.value}
      className={cn('flex-row items-center justify-between p-4')}
      style={{ backgroundColor: colors.surface }}
      onPress={() => {
        toggleOption(option.value);
      }}>
      <Text
        className="font-medium"
        style={{
          color: isSelected ? colors.primary : colors.foreground,
        }}>
        {option.label}
      </Text>
      {isSelected && <MaterialIcons name="check" size={20} color={colors.primary} />}
    </TouchableOpacity>
  );
};

export function MultiSelectField({
  name,
  placeholder = 'Select options',
  options,
  className = '',
  buttonClassName = '',
  errorClassName = '',
  searchable = false,
  floatingPlaceholder = false,
  isDisabled = false,
  variant = 'primary',
}: BaseSelectProps) {
  const { colors } = useTheme();

  const toggleOption = React.useCallback(
    (value: string[], onChange: (value: any) => void) => (optionValue: string) => {
      const newValue = value.includes(optionValue)
        ? value.filter((v: string) => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    },
    []
  );

  const removeOption =
    (value: string[], onChange: (value: any) => void) => (optionValue: string) => {
      const newValue = value.filter((v: string) => v !== optionValue);
      onChange(newValue);
    };

  const getSelectedOptions = (options: SelectOption[], value: any) => {
    return options.filter((option) => value.includes(option.value));
  };

  const shouldShowFloating = (
    isVisible: boolean,
    selectedOptions: SelectOption[],
    floatingPlaceholder: boolean,
    variant: 'primary' | 'secondary'
  ) => {
    return (
      floatingPlaceholder && (isVisible || selectedOptions.length > 0) && variant === 'primary'
    );
  };

  const renderOptionsList = ({
    filteredOptions,
    value,
    onChange,
    searchable,
    searchQuery,
    setSearchQuery,
  }: {
    filteredOptions: SelectOption[];
    value: any;
    onChange: (value: any) => void;
    searchable: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
  }) => {
    const toggle = toggleOption(value, onChange);

    const renderItem = ({ item }: ListRenderItemInfo<TMultiSelectOption>) => {
      return (
        <MultiSelectOption
          option={item}
          isSelected={value.includes(item.value)}
          toggleOption={toggle}
        />
      );
    };

    return (
      <>
        {searchable && (
          <View
            className="border-b p-4"
            style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}>
            <TextInput
              className="rounded-lg border px-4 py-3 text-base"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.foreground,
              }}
              placeholder="Search options..."
              placeholderTextColor={colors.fgMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        <FlatList
          data={filteredOptions}
          keyExtractor={(item) => item.value}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          renderItem={renderItem}
          ItemSeparatorComponent={() => (
            <View className="h-[1px]" style={{ backgroundColor: colors.border }} />
          )}
          contentContainerClassName="pb-safe-offset-4"
          ListEmptyComponent={
            <View className="items-center p-8">
              <Text style={{ color: colors.fgMuted }}>
                {searchable && searchQuery ? 'No options found' : 'No options available'}
              </Text>
            </View>
          }
          keyboardDismissMode="on-drag"
        />
      </>
    );
  };

  return (
    <BaseSelectField
      name={name}
      placeholder={placeholder}
      options={options}
      className={className}
      buttonClassName={buttonClassName}
      errorClassName={errorClassName}
      searchable={searchable}
      floatingPlaceholder={floatingPlaceholder}
      variant={variant}
      getSelectedOptions={getSelectedOptions}
      shouldShowFloating={shouldShowFloating}
      renderOptionsList={renderOptionsList}
      isDisabled={isDisabled}>
      {({
        selectedOptions,
        value,
        onChange,
        placeholder: pl,
        floatingPlaceholder: fp,
        variant,
      }) => {
        const removeOpt = removeOption(value, onChange);

        return (
          <View>
            {selectedOptions.length > 0 && variant === 'primary' ? (
              <View className="flex flex-row flex-wrap gap-1">
                {selectedOptions.map((option) => (
                  <View
                    key={option.value}
                    className={cn('mb-1 mr-1 flex-row items-center rounded-lg px-2 py-1')}
                    style={{ backgroundColor: colors.muted }}>
                    <Text
                      className="text-sm font-medium"
                      style={{ color: isDisabled ? colors.fgMuted : colors.foreground }}>
                      {option.label}
                    </Text>
                    <TouchableOpacity
                      disabled={isDisabled}
                      onPress={(e) => {
                        e.stopPropagation();
                        removeOpt(option.value);
                      }}
                      className="ml-1">
                      <MaterialIcons
                        name="close"
                        size={14}
                        style={{ color: isDisabled ? colors.fgMuted : colors.fgSecondary }}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : selectedOptions.length > 0 && variant === 'secondary' ? (
              <View className="flex-row items-center gap-3">
                <Text className="text-base font-bold" style={{ color: colors.primaryFg }}>
                  {pl}
                </Text>
                <View
                  className="mt-0.5 aspect-square items-center justify-center rounded-full px-1"
                  style={{ backgroundColor: colors.primaryFg }}>
                  <Text className="text-xs font-black" style={{ color: colors.primary }}>
                    {selectedOptions.length}
                  </Text>
                </View>
              </View>
            ) : (
              <Text
                className="text-base font-medium"
                style={{
                  color: colors.fgMuted,
                }}>
                {!fp ? pl : null}
              </Text>
            )}
          </View>
        );
      }}
    </BaseSelectField>
  );
}
