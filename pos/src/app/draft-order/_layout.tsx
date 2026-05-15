import { Stack } from 'expo-router';

export default function DraftOrderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="customer-lookup"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.6, 1],
          sheetGrabberVisible: true,
          sheetCornerRadius: 28,
        }}
      />
      <Stack.Screen
        name="payment-method"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.4, 0.7],
          sheetGrabberVisible: true,
          sheetCornerRadius: 28,
        }}
      />
      <Stack.Screen
        name="promotions"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.4, 0.7],
          sheetGrabberVisible: true,
          sheetCornerRadius: 28,
        }}
      />
    </Stack>
  );
}
