import React, { useState, useEffect } from 'react';
import { Text, View, Animated, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useScrollHandler } from '@/contexts/tab-scroll-context';
import { useTheme } from '@/theme/useTheme';

import { Header } from '@/components/home/Header';
import { SearchBar } from '@/components/home/SearchBar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useRouter } from 'expo-router';

const STORES = [
  { id: '1', name: 'Downtown Branch', address: '123 Main St, New York' },
  { id: '2', name: 'Uptown Branch', address: '456 Broadway, New York' },
  { id: '3', name: 'Brooklyn Store', address: '789 Bedford Ave, Brooklyn' },
];

let hasShownStoreSelector = false;

export default function IndexScreen() {
  const router = useRouter();
  const tabScrollHandler = useScrollHandler();
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();

  const scrollHandler = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
    listener: tabScrollHandler,
  });

  const stickyOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0, 0.15],
    extrapolate: 'clamp',
  });
  const stickyElevation = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0, 8],
    extrapolate: 'clamp',
  });

  const [activeStore, setActiveStore] = useState(STORES[0]);
  const [storeDrawerVisible, setStoreDrawerVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const id = await SecureStore.getItemAsync('selectedStoreId');
        if (id) {
          const found = STORES.find((s) => s.id === id);
          if (found) setActiveStore(found);
        }
      } catch {
        /* ignore */
      } finally {
        if (!hasShownStoreSelector) {
          setStoreDrawerVisible(true);
          hasShownStoreSelector = true;
        }
      }
    })();
  }, []);

  const handleStoreSelect = async (store: (typeof STORES)[0]) => {
    setActiveStore(store);
    setStoreDrawerVisible(false);
    try {
      await SecureStore.setItemAsync('selectedStoreId', store.id);
    } catch {
      /* ignore */
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}>
        <Header store={activeStore} onStorePress={() => setStoreDrawerVisible(true)} />

        {/* Sticky search bar */}
        <Animated.View
          style={{
            backgroundColor: colors.surface,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: stickyOpacity as any,
            shadowRadius: 8,
            elevation: stickyElevation as any,
            zIndex: 10,
          }}>
          <SearchBar />
        </Animated.View>

        {/* Dashboard */}
        <View className="mt-2 px-4">
          <Text
            style={{ color: colors.foreground }}
            className="mb-4 text-[22px] font-bold tracking-tight">
            Welcome, John
          </Text>

          {/* Row 1 */}
          <View className="flex-row gap-3">
            {/* Sales card */}
            <View
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="h-36 flex-1 rounded-2xl border px-4 py-3">
              <View className="flex-row items-start justify-between">
                <Text
                  style={{ color: colors.mutedFg }}
                  className="text-[11px] font-semibold uppercase tracking-widest">
                  Total Sales
                </Text>
                <View
                  style={{ backgroundColor: colors.successBg }}
                  className="rounded-full px-2 py-0.5">
                  <Text style={{ color: colors.success }} className="text-[10px] font-bold">
                    +12.4%
                  </Text>
                </View>
              </View>
              <Text
                style={{ color: colors.foreground }}
                className="mt-2 text-2xl font-extrabold tracking-tight">
                ₹10,527
              </Text>
              <Text style={{ color: colors.mutedFg }} className="text-[11px]">
                Today • INR
              </Text>
              <MaterialIcons
                name="trending-up"
                size={20}
                color={colors.success}
                style={{ marginTop: 'auto' }}
              />
            </View>

            {/* Scan card */}
            <Pressable
              onPress={() => router.push('/scan')}
              style={{ backgroundColor: colors.primary }}
              className="h-36 w-36 shrink-0 items-center justify-center gap-2 rounded-2xl">
              <MaterialIcons name="qr-code-2" size={46} color={colors.primaryFg} />
              <Text
                style={{ color: colors.primaryFg }}
                className="text-[13px] font-bold tracking-wide">
                Scan Code
              </Text>
            </Pressable>
          </View>

          {/* Row 2 — mini stat cards */}
          <View className="mt-3 flex-row gap-3">
            {[
              { label: 'Completed', value: '142', color: colors.foreground },
              { label: 'Pending', value: '7', color: colors.warning },
              { label: 'Refunds', value: '2', color: colors.error },
            ].map((item) => (
              <View
                key={item.label}
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                className="flex-1 rounded-2xl border px-4 py-3">
                <Text
                  style={{ color: colors.mutedFg }}
                  className="text-[11px] font-semibold uppercase tracking-widest">
                  {item.label}
                </Text>
                <Text style={{ color: item.color }} className="mt-1 text-xl font-extrabold">
                  {item.value}
                </Text>
                <Text style={{ color: colors.mutedFg }} className="text-[11px]">
                  Today
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Store drawer */}
      <BottomSheet
        visible={storeDrawerVisible}
        onClose={() => setStoreDrawerVisible(false)}
        title="Select Store">
        <View className="mb-6 gap-3">
          {STORES.map((store) => {
            const isActive = activeStore.id === store.id;
            return (
              <Pressable
                key={store.id}
                onPress={() => handleStoreSelect(store)}
                style={{
                  backgroundColor: isActive ? colors.primary + '14' : colors.surface,
                  borderColor: isActive ? colors.primary + '55' : colors.border,
                }}
                className="flex-row items-center justify-between rounded-2xl border p-4">
                <View className="flex-row items-center gap-3">
                  <View
                    style={{ backgroundColor: isActive ? colors.primary : colors.muted }}
                    className="rounded-full p-2">
                    <MaterialIcons
                      name="store"
                      size={20}
                      color={isActive ? colors.primaryFg : colors.mutedFg}
                    />
                  </View>
                  <View>
                    <Text
                      style={{ color: isActive ? colors.primary : colors.foreground }}
                      className="font-bold">
                      {store.name}
                    </Text>
                    <Text style={{ color: colors.mutedFg }} className="mt-0.5 text-xs">
                      {store.address}
                    </Text>
                  </View>
                </View>
                {isActive && <MaterialIcons name="check-circle" size={22} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}
