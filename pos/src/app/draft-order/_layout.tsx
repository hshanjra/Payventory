import { Stack } from 'expo-router';

export default function CartLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="[id]/customer" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}
