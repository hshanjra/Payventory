import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { OptionItem } from './option-item';

export type SelectFieldProps<T extends { id: string }> = {
  label: string;
  placeholder: string;
  selectedId: string | null;
  items: T[];
  isLoading: boolean;
  renderLabel: (item: T) => string;
  renderSublabel?: (item: T) => string | undefined;
  onSelect: (id: string | null) => void;
  optional?: boolean;
  optionalLabel?: string;
};

export function SelectField<T extends { id: string }>({
  label,
  placeholder,
  selectedId,
  items,
  isLoading,
  renderLabel,
  renderSublabel,
  onSelect,
  optional,
  optionalLabel,
}: SelectFieldProps<T>) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const selected = items.find((i) => i.id === selectedId);
  const displayValue = selected ? renderLabel(selected) : placeholder;
  const hasValue = !!selected || (optional && selectedId === null);

  return (
    <View>
      <Text
        className="mb-2 text-[12px] font-black uppercase tracking-[1.5px]"
        style={{ color: colors.fgSecondary }}>
        {label}
      </Text>

      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-2xl border px-4 h-14"
        style={{
          backgroundColor: colors.surface,
          borderColor: open ? colors.primary : colors.border,
        }}>
        <Text
          className="flex-1 text-[16px] font-medium"
          numberOfLines={1}
          style={{ color: hasValue ? colors.foreground : colors.fgMuted }}>
          {displayValue}
        </Text>
        <MaterialIcons name="unfold-more" size={20} color={colors.fgMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable 
          className="flex-1 justify-end bg-black/40" 
          onPress={() => setOpen(false)}
        >
          <View 
            className="w-full rounded-t-[32px] px-6 pb-12 pt-4"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="items-center pb-6">
              <View style={{ backgroundColor: colors.borderStrong }} className="h-1.5 w-12 rounded-full" />
            </View>
            
            <Text style={{ color: colors.foreground }} className="text-xl font-black tracking-tight mb-6">
              {label}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={{ maxHeight: 400 }}>
              {isLoading ? (
                <View className="items-center py-8">
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : (
                <View className="gap-2">
                  {optional && optionalLabel && (
                    <OptionItem
                      label={optionalLabel}
                      selected={selectedId === null}
                      onPress={() => {
                        onSelect(null);
                        setOpen(false);
                      }}
                    />
                  )}
                  {items.map((item) => (
                    <OptionItem
                      key={item.id}
                      label={renderLabel(item)}
                      sublabel={renderSublabel?.(item)}
                      selected={selectedId === item.id}
                      onPress={() => {
                        onSelect(item.id);
                        setOpen(false);
                      }}
                    />
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
