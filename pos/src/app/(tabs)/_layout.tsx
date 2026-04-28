import { Tabs, useRouter } from 'expo-router';
import { Platform, Text, View, Animated, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { TabScrollProvider, useTabScroll } from '@/contexts/tab-scroll-context';
import { useTheme } from '@/theme/useTheme';

function FloatingCart() {
  const translateY = useTabScroll();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const mockItems = [
    { id: 1, image: 'https://ui-avatars.com/api/?name=1&background=random' },
    { id: 2, image: 'https://ui-avatars.com/api/?name=2&background=random' },
    { id: 3, image: 'https://ui-avatars.com/api/?name=3&background=random' },
  ];

  return (
    <Animated.View
      className="absolute bottom-[102px] z-50 self-center"
      style={{ transform: translateY ? [{ translateY }] : [] }}>
      <Pressable
        onPress={() => router.push('/cart')}
        className="flex-row items-center rounded-full p-2"
        style={{
          backgroundColor: colors.cartBg,
          borderWidth: 1,
          borderColor: colors.cartBorder,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.5 : 0.18,
          shadowRadius: 16,
          elevation: 10,
        }}>
        <View className="flex-row pl-1">
          {mockItems.map((item, index) => (
            <Image
              key={item.id}
              source={{ uri: item.image }}
              className="h-9 w-9 rounded-full border-2 border-white"
              style={{ marginLeft: index > 0 ? -16 : 0 }}
            />
          ))}
          <View
            style={{ backgroundColor: colors.muted, marginLeft: -16 }}
            className="h-9 w-9 items-center justify-center rounded-full border-2 border-white">
            <Text style={{ color: colors.mutedFg }} className="text-[10px] font-bold">
              +2
            </Text>
          </View>
        </View>
        <View
          style={{ backgroundColor: colors.primary }}
          className="ml-3 mr-1 flex-row items-center gap-2 rounded-full px-4 py-2.5">
          <MaterialIcons name="shopping-basket" size={18} color={colors.primaryFg} />
          <Text style={{ color: colors.primaryFg }} className="text-sm font-bold tracking-wide">
            View Cart
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function TabsNavigator() {
  const translateY = useTabScroll();
  const { colors, isDark } = useTheme();

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          animation: 'shift',
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 16 : 12,
            // marginHorizontal works reliably; left/right get reset by RN's layout engine
            marginHorizontal: 16,
            borderRadius: 28,
            backgroundColor: colors.tabBarBg + 'e0', // 88% opacity glass
            height: 64,
            paddingBottom: 4,
            paddingTop: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.5 : 0.15,
            shadowRadius: 20,
            elevation: 16,
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: isDark ? colors.tabBorder : colors.border + '80',
            transform: translateY ? [{ translateY }] : [],
          },
          tabBarActiveTintColor: colors.activeTint,
          tabBarInactiveTintColor: colors.inactiveTint,
          tabBarLabelStyle: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3, marginTop: 1 },
          tabBarItemStyle: { paddingHorizontal: 0 },
        }}>
        <Tabs.Screen
          name="(index)"
          options={{
            title: 'HOME',
            tabBarIcon: ({ color }) => <MaterialIcons name="home-filled" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'EXPLORE',
            tabBarIcon: ({ color }) => <MaterialIcons name="explore" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="stock"
          options={{
            title: 'STOCK',
            tabBarIcon: ({ color }) => <MaterialIcons name="inventory-2" size={23} color={color} />,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'ORDERS',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="receipt-long" size={23} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="customers"
          options={{
            title: 'CUSTOMERS',
            tabBarIcon: ({ color }) => <MaterialIcons name="people-alt" size={23} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            href: null,
            title: 'SETTINGS',
            tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />,
          }}
        />
      </Tabs>
      <FloatingCart />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <TabScrollProvider>
      <TabsNavigator />
    </TabScrollProvider>
  );
}
