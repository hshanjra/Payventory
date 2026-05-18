import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import type { AdminProductVariant } from '@medusajs/types';

interface OptionGroup {
  optionId: string;
  title: string;
  values: string[];
}

interface VariantSelectorProps {
  variants: AdminProductVariant[];
  selectedVariantId: string | null;
  onSelectVariant: (variantId: string) => void;
  inventoryLevels?: Record<string, number>; // variantId -> available_quantity
}

/** Build a map of option title → unique ordered values from all variants */
function buildOptionGroups(variants: AdminProductVariant[]): OptionGroup[] {
  const groupMap = new Map<string, OptionGroup>();

  for (const variant of variants) {
    for (const opt of variant.options ?? []) {
      const key = opt.option_id ?? opt.option?.id ?? '';
      const title = opt.option?.title ?? key;

      if (!groupMap.has(key)) {
        groupMap.set(key, { optionId: key, title, values: [] });
      }

      const group = groupMap.get(key)!;
      if (!group.values.includes(opt.value)) {
        group.values.push(opt.value);
      }
    }
  }

  return Array.from(groupMap.values());
}

/**
 * Given the currently selected variant, returns a map of optionId → selected value.
 */
function getSelectedOptionValues(variant: AdminProductVariant | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!variant) return map;

  for (const opt of variant.options ?? []) {
    const key = opt.option_id ?? opt.option?.id ?? '';
    map.set(key, opt.value);
  }

  return map;
}

/**
 * Find a variant that matches an updated option selection.
 */
function findVariantForSelection(
  variants: AdminProductVariant[],
  currentSelected: Map<string, string>,
  changedOptionId: string,
  newValue: string
): AdminProductVariant | null {
  const target = new Map(currentSelected);
  target.set(changedOptionId, newValue);

  return (
    variants.find((v) => {
      const vMap = getSelectedOptionValues(v);
      for (const [optId, val] of target) {
        if (vMap.get(optId) !== val) return false;
      }
      return true;
    }) ?? null
  );
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
  inventoryLevels = {},
}: VariantSelectorProps) {
  const { colors } = useTheme();

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const selectedOptions = getSelectedOptionValues(selectedVariant);
  const optionGroups = buildOptionGroups(variants);

  // If there are variants but NO options defined (e.g. simple product)
  // we should show the variant titles as a single "Variant" group
  if (optionGroups.length === 0 && variants.length > 0) {
    return (
      <View style={{ gap: 10 }}>
        <Text
          className="text-[11px] font-black uppercase tracking-widest"
          style={{ color: colors.mutedFg }}>
          SELECT VARIANT
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {variants.map((v) => {
              const isSelected = selectedVariantId === v.id;
              const qty = inventoryLevels[v.id] ?? 0;
              const outOfStock = qty <= 0;

              return (
                <Pressable
                  key={v.id}
                  onPress={() => onSelectVariant(v.id)}
                  style={{
                    minWidth: 48,
                    paddingHorizontal: 18,
                    paddingVertical: 12,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderStyle: outOfStock ? 'dashed' : 'solid',
                    alignItems: 'center',
                    backgroundColor: isSelected ? colors.primary + '10' : colors.surfaceEl,
                    borderColor: isSelected
                      ? colors.primary
                      : outOfStock
                        ? colors.borderStrong
                        : colors.border,
                    opacity: outOfStock && !isSelected ? 0.5 : 1,
                  }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '900',
                      color: isSelected
                        ? colors.primary
                        : outOfStock
                          ? colors.fgMuted
                          : colors.foreground,
                    }}>
                    {v.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  const handleValuePress = (optionId: string, value: string) => {
    const match = findVariantForSelection(variants, selectedOptions, optionId, value);
    if (match) onSelectVariant(match.id);
  };

  /**
   * Check if a specific option value is out of stock across ALL variants that have it.
   */
  const isOptionValueOutOfStock = (optionId: string, value: string) => {
    const matchingVariants = variants.filter((v) => {
      const vOpts = getSelectedOptionValues(v);
      return vOpts.get(optionId) === value;
    });

    if (matchingVariants.length === 0) return true;

    // If ALL matching variants are out of stock
    return matchingVariants.every((v) => {
      const qty = inventoryLevels[v.id] ?? 0;
      return qty <= 0;
    });
  };

  return (
    <View style={{ gap: 20 }}>
      {optionGroups.map((group) => {
        const selectedValue = selectedOptions.get(group.optionId);

        return (
          <View key={group.optionId} style={{ gap: 10 }}>
            <Text
              className="text-[11px] font-black uppercase tracking-widest"
              style={{ color: colors.mutedFg }}>
              {group.title}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {group.values.map((val) => {
                  const isSelected = selectedValue === val;
                  const outOfStock = isOptionValueOutOfStock(group.optionId, val);

                  return (
                    <Pressable
                      key={val}
                      onPress={() => handleValuePress(group.optionId, val)}
                      style={{
                        minWidth: 48,
                        paddingHorizontal: 18,
                        paddingVertical: 12,
                        borderRadius: 16,
                        borderWidth: 2,
                        borderStyle: outOfStock ? 'dashed' : 'solid',
                        alignItems: 'center',
                        backgroundColor: isSelected ? colors.primary + '10' : colors.surfaceEl,
                        borderColor: isSelected
                          ? colors.primary
                          : outOfStock
                            ? colors.borderStrong
                            : colors.border,
                        opacity: outOfStock && !isSelected ? 0.5 : 1,
                      }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '900',
                          color: isSelected
                            ? colors.primary
                            : outOfStock
                              ? colors.fgMuted
                              : colors.foreground,
                        }}>
                        {val}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        );
      })}
    </View>
  );
}
