import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

export const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'shopping-outline' },
  { id: 'ramzan', name: 'Ramzan', icon: 'moon-waning-crescent' },
  { id: 'electronics', name: 'Electronics', icon: 'headphones' },
  { id: 'beauty', name: 'Beauty', icon: 'lipstick' },
  { id: 'decor', name: 'Decor', icon: 'lamp' },
] as const;

interface CategoryTabsProps {
  activeCategory: string;
  onSelect: (id: string) => void;
}

export function CategoryTabs({ activeCategory, onSelect }: CategoryTabsProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#000000' : '#ffffff';

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 24, paddingBottom: 0 }}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelect(cat.id)}
              className="relative w-[50px] items-center pb-[10px] pt-1">
              <MaterialCommunityIcons
                name={cat.icon as any}
                size={26}
                color={iconColor}
                style={{ opacity: isActive ? 1 : 0.85 }}
              />
              <Text
                className={`mt-[2px] w-[60px] text-center text-[11px] font-bold leading-tight ${isActive ? 'text-primary-foreground' : 'text-primary-foreground opacity-85'}`}
                numberOfLines={1}>
                {cat.name}
              </Text>
              {isActive && (
                <View className="absolute bottom-0 h-[3px] w-[50px] rounded-t-full bg-primary-foreground" />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
