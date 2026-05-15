import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, TextInput, TouchableOpacity, View } from 'react-native';
import { BaseSelectField, BaseSelectProps, SelectOption } from './base-select';
import { cn } from '@/lib/utils';
import { Text } from '../ui/text';
import { useTheme } from '@/theme/useTheme';

interface SelectFieldProps extends BaseSelectProps {
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
}

export function SelectField({
  name,
  placeholder = 'Select an option',
  options,
  className = '',
  buttonClassName = '',
  errorClassName = '',
  searchable = false,
  renderOption,
  floatingPlaceholder = false,
  variant = 'primary',
  onEndReached,
  isDisabled = false,
}: SelectFieldProps) {
  const { colors } = useTheme();

  const handleSelect =
    (onChange: (value: any) => void, setIsVisible: (visible: boolean) => void) =>
    (selectedValue: string) => {
      onChange(selectedValue);
      setIsVisible(false);
    };

  const defaultRenderOption = (
    option: SelectOption,
    isSelected: boolean,
    onSelect: (value: string) => void
  ) => (
    <TouchableOpacity
      key={option.value}
      className={cn('flex-row items-center justify-between p-4')}
      style={{ backgroundColor: colors.surface }}
      onPress={() => onSelect(option.value)}>
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

  const getSelectedOptions = (options: SelectOption[], value: any) => {
    const selectedOption = options.find((option) => option.value === value);
    return selectedOption ? [selectedOption] : [];
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
    setIsVisible,
    searchable,
    searchQuery,
    setSearchQuery,
    onEndReached,
  }: {
    filteredOptions: SelectOption[];
    value: any;
    onChange: (value: any) => void;
    setIsVisible: (visible: boolean) => void;
    searchable: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onEndReached?: () => void;
  }) => {
    const onSelect = handleSelect(onChange, setIsVisible);

    const renderItem = ({ item }: { item: SelectOption }) => {
      const isSelected = item.value === value;
      const renderedOption = renderOption
        ? renderOption(item, isSelected)
        : defaultRenderOption(item, isSelected, onSelect);
      return renderedOption as React.ReactElement;
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
          renderItem={renderItem}
          keyboardShouldPersistTaps="always"
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
          onEndReached={onEndReached}
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
      onEndReached={onEndReached}
      isDisabled={isDisabled}
      getSelectedOptions={getSelectedOptions}
      shouldShowFloating={shouldShowFloating}
      renderOptionsList={renderOptionsList}>
      {({ selectedOptions, placeholder: pl, floatingPlaceholder: fp }) => {
        const selectedOption = selectedOptions[0];

        return (
          <Text
            className="text-base font-medium"
            style={{
              color: selectedOption
                ? variant === 'secondary'
                  ? colors.primaryFg
                  : colors.foreground
                : colors.fgMuted,
            }}>
            {selectedOption ? selectedOption.label : !fp ? pl : null}
          </Text>
        );
      }}
    </BaseSelectField>
  );
}

export default SelectField;
