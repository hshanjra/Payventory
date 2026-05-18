import {
  View,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { Layout } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/form/text-input';
import { Form } from '@/contexts/form';
import { FormButton } from '@/components/form/form-button';
import { z } from 'zod';
import { AdminPromotion } from '@medusajs/types';
import {
  useCurrentDraftOrder,
  useAddDraftOrderPromotions,
  useRemoveDraftOrderPromotions,
} from '@/hooks/api/draft-orders';
import { usePromotions, useCreatePromotion } from '@/hooks/api/promotions';
import { useMedusaSdk } from '@/contexts/auth';
import { useCallback, useMemo, useState } from 'react';

const discountSchema = z.object({
  percentage: z.string().refine(
    (val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num > 0 && num <= 100;
    },
    { message: 'Must be between 1 and 100' }
  ),
});

type DiscountFormValues = z.infer<typeof discountSchema>;

// Types for our FlatList data
type ListItem =
  | { type: 'applied_header' }
  | { type: 'applied_promo'; promo: AdminPromotion }
  | { type: 'available_header' }
  | { type: 'available_promo'; promo: AdminPromotion }
  | { type: 'empty_state' }
  | { type: 'loading_state' };

export default function PromotionsScreen() {
  const { colors } = useTheme();
  const sdk = useMedusaSdk();
  const { data: draftOrderData } = useCurrentDraftOrder();
  const draftOrder = draftOrderData?.draft_order;
  const appliedPromotions = ((draftOrder as any)?.promotions as AdminPromotion[]) ?? [];

  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingCode, setLoadingCode] = useState<string | null>(null);

  // Fetch promotions with application_method expanded
  const { data: promotionsQuery, isLoading: isPromotionsLoading } = usePromotions({
    fields: '+application_method',
  });

  const promotionsData = useMemo(() => {
    return promotionsQuery?.pages.flatMap((page) => page.promotions) ?? [];
  }, [promotionsQuery]);

  const { mutateAsync: addPromotion } = useAddDraftOrderPromotions();
  const { mutateAsync: removePromotion } = useRemoveDraftOrderPromotions();
  const { mutateAsync: createPromotion } = useCreatePromotion();

  const handleApplyPercentage = async (data: DiscountFormValues) => {
    const value = parseInt(data.percentage, 10);
    const code = `POS_PERCENT_${value}`;

    try {
      setIsProcessing(true);

      // 1. Search for promotion
      const { promotions } = await sdk.admin.promotion.list({ code: [code] });
      let promotion = (promotions as AdminPromotion[])[0];

      if (!promotion) {
        // 2. Create promotion if not exists
        const result = await createPromotion({
          code,
          type: 'standard',
          is_automatic: false,
          application_method: {
            type: 'percentage',
            target_type: 'order',
            value: value,
            allocation: 'across',
          },
        });
        promotion = result.promotion as AdminPromotion;
      }

      // 3. Activate if draft
      if (promotion.status === 'draft') {
        await sdk.admin.promotion.update(promotion.id, { status: 'active' });
      }

      // 4. Remove ALL existing promotions first to prevent stacking
      if (appliedPromotions.length > 0) {
        const promoCodesToRemove = appliedPromotions.map((p) => p.code).filter(Boolean) as string[];

        if (promoCodesToRemove.length > 0) {
          await removePromotion({ promo_codes: promoCodesToRemove });
        }
      }

      // 5. Apply promotion
      await addPromotion({ promo_codes: [code] });
      router.back();
    } catch (error: any) {
      console.error('Error applying discount:', error);
      Alert.alert('Error', error?.message || 'Failed to apply discount. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemovePromotion = async (promoCode: string) => {
    try {
      setIsProcessing(true);
      setLoadingCode(promoCode);
      await removePromotion({ promo_codes: [promoCode] });
    } catch (error: any) {
      console.error('Error removing promotion:', error);
      Alert.alert('Error', error?.message || 'Failed to remove promotion.');
    } finally {
      setIsProcessing(false);
      setLoadingCode(null);
    }
  };

  const handleApplyExisting = async (code: string) => {
    try {
      setIsProcessing(true);
      setLoadingCode(code);
      // Remove ALL existing promotions first to prevent stacking
      if (appliedPromotions.length > 0) {
        const promoCodesToRemove = appliedPromotions.map((p) => p.code).filter(Boolean) as string[];

        if (promoCodesToRemove.length > 0) {
          await removePromotion({ promo_codes: promoCodesToRemove });
        }
      }
      await addPromotion({ promo_codes: [code] });
      router.back();
    } catch (error: any) {
      console.error('Error applying existing promotion:', error);
      Alert.alert('Error', error?.message || 'Failed to apply promotion.');
    } finally {
      setIsProcessing(false);
      setLoadingCode(null);
    }
  };

  // Build the list data
  const listData = useMemo(() => {
    const data: ListItem[] = [];

    // Applied Promotions Section
    if (appliedPromotions.length > 0) {
      data.push({ type: 'applied_header' });
      appliedPromotions.forEach((promo) => {
        data.push({ type: 'applied_promo', promo });
      });
    }

    // Available Offers Section
    data.push({ type: 'available_header' });

    if (isPromotionsLoading) {
      data.push({ type: 'loading_state' });
    } else if (promotionsData.length > 0) {
      const availableOffers = promotionsData.filter((o) => !o.code?.startsWith('POS_PERCENT_'));

      if (availableOffers.length === 0) {
        data.push({ type: 'empty_state' });
      } else {
        availableOffers.forEach((offer) => {
          data.push({ type: 'available_promo', promo: offer });
        });
      }
    } else {
      data.push({ type: 'empty_state' });
    }

    return data;
  }, [appliedPromotions, promotionsData, isPromotionsLoading]);

  // Render list items memoized to prevent re-mounting
  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      switch (item.type) {
        case 'applied_header':
          return (
            <Text
              style={{ color: colors.fgSecondary }}
              className="mb-4 mt-2 text-[12px] font-black uppercase tracking-widest">
              Applied Promotions
            </Text>
          );

        case 'applied_promo': {
          const promo = item.promo;
          const isThisLoading = loadingCode === promo.code;
          return (
            <View
              className="mb-3 flex-row items-center justify-between rounded-2xl border p-4"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
              <View className="flex-row items-center gap-3">
                <View
                  className="h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: colors.primary + '15' }}>
                  <MaterialIcons name="local-offer" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={{ color: colors.foreground }} className="text-[16px] font-bold">
                    {promo.code}
                  </Text>
                  <Text style={{ color: colors.fgSecondary }} className="text-[13px] font-medium">
                    {(promo.application_method as any)?.raw_value?.value ||
                      (promo.application_method as any)?.value}
                    % Discount
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => handleRemovePromotion(promo.code!)}
                disabled={isProcessing}
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: colors.muted }}>
                {isThisLoading ? (
                  <ActivityIndicator size="small" color={colors.foreground} />
                ) : (
                  <MaterialIcons
                    name="delete-outline"
                    size={22}
                    color={colors.error || '#EF4444'}
                  />
                )}
              </Pressable>
            </View>
          );
        }

        case 'available_header':
          return (
            <Text
              style={{ color: colors.fgSecondary }}
              className="mb-4 mt-6 text-[12px] font-black uppercase tracking-widest">
              Available Offers
            </Text>
          );

        case 'available_promo': {
          const offer = item.promo;
          const isApplied = appliedPromotions.some((p) => p.code === offer.code);
          const isThisLoading = loadingCode === offer.code;

          return (
            <Pressable
              onPress={() => !isApplied && handleApplyExisting(offer.code!)}
              disabled={isProcessing || isApplied}
              className="mb-3 rounded-2xl border p-4"
              style={{
                borderColor: isApplied ? colors.primary : colors.border,
                backgroundColor: colors.surface,
                opacity: isProcessing && !isThisLoading ? 0.6 : 1,
              }}>
              <View className="flex-row items-center justify-between">
                <View className="mr-4 flex-1">
                  <Text style={{ color: colors.foreground }} className="text-[16px] font-black">
                    {offer.code}
                  </Text>
                  <Text
                    style={{ color: colors.fgSecondary }}
                    className="mt-1 text-[13px] font-medium">
                    {(offer.application_method as any)?.value}%{' '}
                    {(offer.application_method as any)?.type} discount
                  </Text>
                </View>
                {isThisLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : isApplied ? (
                  <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                ) : (
                  <MaterialIcons name="arrow-forward-ios" size={16} color={colors.fgMuted} />
                )}
              </View>
            </Pressable>
          );
        }

        case 'loading_state':
          return <ActivityIndicator color={colors.primary} className="my-4" />;

        case 'empty_state':
          return (
            <Text style={{ color: colors.fgMuted }} className="mt-2 text-center italic">
              No other active promotions available
            </Text>
          );

        default:
          return null;
      }
    },
    [
      colors,
      loadingCode,
      isProcessing,
      appliedPromotions,
      handleRemovePromotion,
      handleApplyExisting,
    ]
  );

  const listHeader = useMemo(
    () => (
      <>
        <View className="mb-6 flex-row items-center justify-between">
          <Text style={{ color: colors.foreground }} className="text-2xl font-black tracking-tight">
            PROMOTIONS
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.muted }}>
            <MaterialIcons name="close" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        <View className="mb-6 gap-3">
          <TextField
            name="percentage"
            placeholder="Enter discount"
            keyboardType="number-pad"
            maxLength={3}
            inputClassName="text-center text-xl py-5"
            autoFocus
          />
          <FormButton isPending={isProcessing} textClassName="text-[17px] font-black">
            Apply Discount
          </FormButton>
        </View>
      </>
    ),
    [colors, isProcessing]
  );

  return (
    <Layout className="px-0 pt-0">
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
        <Form
          schema={discountSchema}
          onSubmit={handleApplyPercentage}
          // defaultValues={{ percentage: '' }}
          className="flex-1 px-6 pt-6">
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={listData}
            keyExtractor={(item, index) =>
              'promo' in item && (item as any).promo?.id
                ? `${item.type}-${(item as any).promo.id}-${index}`
                : `${item.type}-${index}`
            }
            renderItem={renderItem}
            ListHeaderComponent={listHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </Form>
      </KeyboardAvoidingView>
    </Layout>
  );
}
