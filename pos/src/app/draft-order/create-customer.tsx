import { useRef } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LayoutWithKeyboardAvoidingScroll } from '@/components/ui/layout';
import { useTheme } from '@/theme/useTheme';
import { useCreateCustomer } from '@/hooks/api/customers';
import { useUpdateDraftOrderCustomer } from '@/hooks/api/draft-orders';
import { Form } from '@/contexts/form';
import { TextField } from '@/components/form/text-input';
import { FormButton } from '@/components/form/form-button';
import { z } from 'zod';

const createCustomerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

type CreateCustomerForm = z.infer<typeof createCustomerSchema>;

export default function CreateCustomerScreen() {
  const { colors } = useTheme();
  const createCustomer = useCreateCustomer();
  const updateDraftOrderCustomer = useUpdateDraftOrderCustomer();

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const onSubmit = async (data: CreateCustomerForm) => {
    try {
      const result = await createCustomer.mutateAsync({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
      });

      const customer = result.customer;

      await updateDraftOrderCustomer.mutateAsync({
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name ?? undefined,
        last_name: customer.last_name ?? undefined,
        phone: customer.phone ?? undefined,
      });

      router.dismissAll();
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  return (
    <LayoutWithKeyboardAvoidingScroll
      className="px-0 pt-0"
      contentContainerClassName="px-4 pb-20"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="pb-3 pt-2">
        <View className="mb-3 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.surface }}>
            <MaterialIcons name="arrow-back" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={{ color: colors.foreground }} className="text-[18px] font-bold">
            Create Customer
          </Text>
          <View className="h-10 w-10" />
        </View>
      </View>

      <Form
        schema={createCustomerSchema}
        onSubmit={onSubmit}
        defaultValues={{
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
        }}
        className="gap-y-4">
        <TextField
          name="first_name"
          placeholder="First Name"
          floatingPlaceholder
          returnKeyType="next"
          onSubmitEditing={() => lastNameRef.current?.focus()}
          blurOnSubmit={false}
          autoFocus
        />
        <TextField
          ref={lastNameRef}
          name="last_name"
          placeholder="Last Name"
          floatingPlaceholder
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          blurOnSubmit={false}
        />
        <TextField
          ref={emailRef}
          name="email"
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          floatingPlaceholder
          returnKeyType="next"
          onSubmitEditing={() => phoneRef.current?.focus()}
          blurOnSubmit={false}
        />
        <TextField
          ref={phoneRef}
          name="phone"
          placeholder="Phone"
          keyboardType="phone-pad"
          floatingPlaceholder
          returnKeyType="done"
        />

        <View className="mt-4">
          <FormButton
            isPending={createCustomer.isPending || updateDraftOrderCustomer.isPending}
            variant="primary">
            Create & Select
          </FormButton>
        </View>
      </Form>
    </LayoutWithKeyboardAvoidingScroll>
  );
}
