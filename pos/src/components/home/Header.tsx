import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

interface Store { id: string; name: string; address: string; }
interface HeaderProps { store: Store; onStorePress: () => void; }

export function Header({ store, onStorePress }: HeaderProps) {
  const { colors } = useTheme();

  const pillBg     = colors.primary + '14'; // ~8% opacity
  const pillBorder = colors.primary + '22'; // ~13% opacity

  return (
    <View style={{ backgroundColor: colors.surface }} className="px-4 pb-3 pt-4">
      <View className="flex-row items-center justify-between">

        {/* Profile pill */}
        <Pressable style={{ backgroundColor: pillBg, borderColor: pillBorder }} className="h-11 w-11 shrink-0 items-center justify-center rounded-full border">
          <MaterialIcons name="person-outline" size={22} color={colors.icon} />
        </Pressable>

        {/* Store selector */}
        <Pressable onPress={onStorePress} className="flex-1 items-center justify-center px-4">
          <Text style={{ color: colors.mutedFg }} className="text-[11px] font-semibold uppercase tracking-widest">
            Selected Store
          </Text>
          <View className="mt-1 flex-row items-center gap-0.5">
            <Text style={{ color: colors.foreground }} className="text-[17px] font-extrabold tracking-tight" numberOfLines={1}>
              {store?.name || 'Select Location'}
            </Text>
            <MaterialIcons name="unfold-more" size={18} color={colors.mutedFg} />
          </View>
        </Pressable>

        {/* Notifications */}
        <Pressable style={{ backgroundColor: pillBg, borderColor: pillBorder }} className="relative h-11 w-11 shrink-0 items-center justify-center rounded-full border">
          <MaterialIcons name="notifications-none" size={23} color={colors.icon} />
          <View style={{ backgroundColor: colors.error }} className="absolute right-[9px] top-[9px] h-2.5 w-2.5 rounded-full border-2 border-white" />
        </Pressable>

      </View>
    </View>
  );
}
