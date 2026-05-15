import { Tabs, useRouter } from 'expo-router';
import { Platform, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { useTheme } from '@/theme/useTheme';
import { useCurrentDraftOrder } from '@/hooks/api/draft-orders';
import { Layout } from '@/components/ui/layout';

function CustomTabBar() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const { data: currentDraftOrder } = useCurrentDraftOrder();
  const activeDraftOrder = currentDraftOrder?.draft_order;
  const itemCount =
    activeDraftOrder?.items?.reduce(
      (sum: number, item: any) => sum + Number(item?.quantity ?? 0),
      0
    ) ?? 0;

  return (
    <View
      className="absolute bottom-6 left-8 right-8 h-[72px] flex-row items-center justify-between rounded-[40px] px-3 shadow-2xl"
      style={{
        backgroundColor: colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: isDark ? 0.4 : 0.08,
        shadowRadius: 30,
        elevation: 20,
      }}>
      {/* Slot 1: Menu Icon (Inspired by mockup grid) */}
      <Pressable
        onPress={() => router.push('/menu')}
        className="h-14 w-14 items-center justify-center rounded-full"
        style={({ pressed }) => ({
          backgroundColor: pressed ? colors.muted : 'transparent',
        })}>
        <MaterialIcons name="grid-view" size={26} color={colors.foreground} />
      </Pressable>

      {/* Slot 2: Center Branding (Logo + Text centered) */}
      <View className="flex-1 flex-row items-center justify-center px-4 gap-2.5">
        <Image
          source={require('@/assets/icon.png')}
          style={{ width: 32, height: 32 }}
          contentFit="contain"
        />
        <Text
          style={{ color: colors.foreground }}
          className="text-center text-[16px] font-black leading-[18px] tracking-tight"
          numberOfLines={2}>
          Divya Jyoti{'\n'}Foundation
        </Text>
      </View>

      {/* Slot 3: Shopping Bag Icon (Inspired by mockup) */}
      <Pressable
        onPress={() => router.push('/draft-order')}
        className="h-14 w-14 items-center justify-center rounded-full"
        style={({ pressed }) => ({
          backgroundColor: pressed ? colors.primary + '08' : 'transparent',
        })}>
        <View>
          <MaterialIcons name="shopping-bag" size={26} color={colors.foreground} />
          {itemCount > 0 && (
            <View
              className="absolute -right-1.5 -top-1.5 h-5 min-w-[20px] items-center justify-center rounded-full border-2"
              style={{ backgroundColor: colors.primary, borderColor: colors.surface }}>
              <Text className="px-1 text-[10px] font-black text-black">
                {itemCount > 9 ? '9+' : itemCount}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

export default function TabsNavigator() {
  return (
    <Layout className="px-0 pt-0">
      <Tabs
        tabBar={() => <CustomTabBar />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Catalog',
          }}
        />
      </Tabs>
    </Layout>
  );
}
