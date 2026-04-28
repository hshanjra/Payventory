import React, { useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Image, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const recentSearches = [
    {
      id: 1,
      name: 'Honey',
      hasImg: true,
      img: 'https://images.unsplash.com/photo-1587049352847-4d4558509b85?w=100&q=80',
    },
    {
      id: 2,
      name: 'Wheat Flour',
      hasImg: true,
      img: 'https://images.unsplash.com/photo-1596647901300-4b21087e8346?w=100&q=80',
    },
    { id: 3, name: 'Lock', hasImg: false },
    { id: 4, name: 'Kwath', hasImg: false },
    { id: 5, name: 'Citric Tab', hasImg: false },
  ];

  const products = [
    {
      id: 1,
      name: 'Link 65mm Steel Pad Lock with 3 Keys',
      discount: '11% OFF',
      price: '₹185',
      mrp: '₹210',
      img: 'https://m.media-amazon.com/images/I/71Y0kX5S-CL.jpg',
    },
    {
      id: 2,
      name: 'Link Round 50mm Double Pad Lock',
      discount: '19% OFF',
      price: '₹109',
      mrp: '₹135',
      left: 'Only 3 left',
      img: 'https://m.media-amazon.com/images/I/71Y0kX5S-CL.jpg',
    },
    {
      id: 3,
      name: 'Link 65mm Brass Round Pad Lock',
      discount: '11% OFF',
      price: '₹519',
      mrp: '₹589',
      left: 'Only 2 left',
      img: 'https://m.media-amazon.com/images/I/71Y0kX5S-CL.jpg',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* ── Search Header ── */}
      <SafeAreaView style={{ backgroundColor: colors.surface }}>
        <View
          style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}
          className="border-b px-4 pb-3 pt-3">
          <View
            style={{
              backgroundColor: colors.canvas,
              borderColor: colors.border,
              height: 48,
            }}
            className="flex-row items-center rounded-2xl border px-3">
            {/* Back */}
            <Pressable onPress={() => router.back()} hitSlop={8} className="pr-2">
              <MaterialIcons name="arrow-back" size={22} color={colors.icon} />
            </Pressable>

            {/* Divider */}
            <View style={{ backgroundColor: colors.border }} className="mx-1 h-5 w-px" />

            {/* Input */}
            <TextInput
              ref={inputRef}
              placeholder="Search products, orders…"
              placeholderTextColor={colors.fgMuted}
              style={{ color: colors.foreground, flex: 1 }}
              className="ml-2 text-[15px] font-medium"
              cursorColor={colors.primary}
              returnKeyType="search"
            />

            {/* Divider */}
            <View style={{ backgroundColor: colors.border }} className="mx-1 h-5 w-px" />

            {/* Scan button */}
            <Pressable
              onPress={() => router.push('/scan')}
              hitSlop={8}
              className="pl-2">
              <MaterialIcons name="qr-code-scanner" size={22} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Recent Searches ── */}
        <View className="mt-5 flex-row items-center justify-between">
          <Text style={{ color: colors.foreground }} className="text-[18px] font-bold">
            Recent Searches
          </Text>
          <Pressable>
            <Text style={{ color: colors.primary }} className="text-[13px] font-semibold">
              Clear all
            </Text>
          </Pressable>
        </View>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {recentSearches.map((item) => (
            <Pressable
              key={item.id}
              style={{ backgroundColor: colors.muted, borderColor: colors.border }}
              className="flex-row items-center rounded-xl border px-3 py-2">
              {item.hasImg ? (
                <View
                  style={{ backgroundColor: colors.surface }}
                  className="mr-2 h-6 w-6 overflow-hidden rounded-md">
                  <Image source={{ uri: item.img }} className="h-full w-full" resizeMode="cover" />
                </View>
              ) : (
                <MaterialIcons
                  name="history"
                  size={16}
                  color={colors.fgMuted}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text style={{ color: colors.fgSecondary }} className="text-sm font-medium">
                {item.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Continue Browsing ── */}
        <Text style={{ color: colors.foreground }} className="mt-8 text-[18px] font-bold">
          Continue browsing for Lock
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4 mt-4"
          contentContainerStyle={{ paddingHorizontal: 16, paddingRight: 32 }}>
          <View className="flex-row gap-4">
            {products.map((product) => (
              <View key={product.id} className="w-[140px]">
                {/* Image card */}
                <View
                  style={{ backgroundColor: colors.muted, borderColor: colors.border }}
                  className="relative h-[140px] w-full items-center justify-center rounded-2xl border p-3">
                  <Image
                    source={{ uri: product.img }}
                    style={{ backgroundColor: colors.surface }}
                    className="h-24 w-24 rounded-lg"
                    resizeMode="contain"
                  />
                  <Pressable className="absolute right-2 top-2">
                    <MaterialIcons name="favorite-border" size={20} color={colors.fgMuted} />
                  </Pressable>
                  {/* ADD button */}
                  <Pressable
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.primary,
                      position: 'absolute',
                      bottom: -14,
                      paddingHorizontal: 20,
                      paddingVertical: 6,
                      borderRadius: 10,
                      borderWidth: 1.5,
                    }}>
                    <Text style={{ color: colors.primary }} className="text-xs font-bold">
                      ADD
                    </Text>
                  </Pressable>
                </View>

                {/* Product info */}
                <View className="mt-6">
                  <View
                    style={{ backgroundColor: colors.muted }}
                    className="mb-1 self-start rounded px-1.5 py-0.5">
                    <Text style={{ color: colors.fgMuted }} className="text-[10px] font-medium">
                      1 pc
                    </Text>
                  </View>
                  <Text
                    style={{ color: colors.foreground }}
                    className="text-sm font-semibold"
                    numberOfLines={3}>
                    {product.name}
                  </Text>
                  {product.left && (
                    <Text style={{ color: colors.warning }} className="mt-0.5 text-[11px] font-bold">
                      {product.left}
                    </Text>
                  )}
                  <Text style={{ color: colors.success }} className="mt-0.5 text-[11px] font-bold">
                    {product.discount}
                  </Text>
                  <View className="mt-1 flex-row items-baseline gap-1">
                    <Text style={{ color: colors.foreground }} className="text-xs font-bold">
                      {product.price}
                    </Text>
                    <Text
                      style={{ color: colors.fgMuted }}
                      className="text-[10px] line-through">
                      MRP {product.mrp}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* See all */}
        <Pressable
          style={{ backgroundColor: colors.muted, borderColor: colors.border }}
          className="mb-4 mt-10 flex-row items-center justify-center rounded-2xl border py-4">
          <Text style={{ color: colors.foreground }} className="mr-1 text-base font-bold">
            See all products
          </Text>
          <MaterialIcons name="arrow-forward" size={18} color={colors.foreground} />
        </Pressable>
      </ScrollView>

      {/* ── Floating Cart Button ── */}
      <View className="absolute bottom-6 left-0 right-0 items-center">
        <Pressable
          style={{ backgroundColor: colors.primary }}
          className="w-[88%] flex-row items-center justify-between rounded-2xl px-4 py-3 shadow-lg">
          {/* Left — item previews + count */}
          <View className="flex-row items-center gap-3">
            <View
              style={{ backgroundColor: colors.primaryFg + '20' }}
              className="flex-row gap-1 rounded-xl p-1.5">
              <View style={{ backgroundColor: colors.primaryFg + '40' }} className="h-6 w-6 rounded-lg" />
              <View style={{ backgroundColor: colors.primaryFg + '40' }} className="h-6 w-6 rounded-lg" />
            </View>
            <View>
              <Text style={{ color: colors.primaryFg }} className="text-[15px] font-bold">
                View Cart
              </Text>
              <Text style={{ color: colors.primaryFg + 'CC' }} className="text-xs font-medium">
                2 items · ₹294
              </Text>
            </View>
          </View>

          {/* Right — chevron */}
          <View
            style={{ backgroundColor: colors.primaryFg + '22' }}
            className="rounded-full p-1">
            <MaterialIcons name="chevron-right" size={22} color={colors.primaryFg} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
