import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useCurrentDraftOrder } from '@/hooks/api/draft-orders';
import { formatCurrency } from '@/lib/utils';

export default function PromotionsScreen() {
  const { colors } = useTheme();
  const { data: draftOrderData } = useCurrentDraftOrder();
  const draftOrder = draftOrderData?.draft_order;
  const currencyCode = String(draftOrder?.currency_code ?? 'INR').toUpperCase();
  
  const [discountCode, setDiscountCode] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} className="px-6 pt-8">
      <View className="mb-6 flex-row items-center justify-between">
        <Text style={{ color: colors.foreground }} className="text-2xl font-black tracking-tight">
          PROMOTIONS
        </Text>
        <Pressable 
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.muted }}
        >
          <MaterialIcons name="close" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="mb-8">
          <Text style={{ color: colors.fgSecondary }} className="mb-2 text-sm font-bold uppercase tracking-widest">
            Discount Code
          </Text>
          <View 
            className="h-14 flex-row items-center rounded-2xl border px-4"
            style={{ borderColor: colors.border, backgroundColor: colors.canvas }}
          >
            <MaterialIcons name="local-offer" size={20} color={colors.primary} />
            <TextInput
              value={discountCode}
              onChangeText={setDiscountCode}
              placeholder="Enter code"
              placeholderTextColor={colors.fgMuted}
              style={{ color: colors.foreground }}
              className="ml-3 flex-1 text-[16px] font-medium"
            />
          </View>
          <Pressable
            className="mt-3 h-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text style={{ color: colors.primaryFg }} className="font-bold">
              Apply Code
            </Text>
          </Pressable>
        </View>

        <View>
          <Text style={{ color: colors.fgSecondary }} className="mb-4 text-sm font-bold uppercase tracking-widest">
            Available Offers
          </Text>
          <View className="gap-3">
            {[
              { title: 'Festival Discount', desc: '10% OFF on all items', code: 'FEST10' },
              { title: 'Welcome Bonus', desc: '₹500 OFF on first order', code: 'WELCOME' },
            ].map((offer) => (
              <Pressable
                key={offer.code}
                onPress={() => setDiscountCode(offer.code)}
                className="rounded-2xl border p-4"
                style={{ borderColor: colors.border, backgroundColor: colors.canvas }}
              >
                <View className="flex-row items-start justify-between">
                  <View>
                    <Text style={{ color: colors.foreground }} className="text-[16px] font-bold">
                      {offer.title}
                    </Text>
                    <Text style={{ color: colors.fgSecondary }} className="mt-1 text-[13px]">
                      {offer.desc}
                    </Text>
                  </View>
                  <View 
                    className="rounded-lg px-2 py-1"
                    style={{ backgroundColor: colors.primary + '10' }}
                  >
                    <Text style={{ color: colors.primary }} className="text-[12px] font-bold">
                      {offer.code}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
