import { Link, Stack } from 'expo-router';
import { Text } from 'react-native';

import { Layout } from '@/components/ui/layout';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Layout className="items-center justify-center p-5">
        <Text className="text-3xl">This screen does not exist.</Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-gray-400">Go to home screen!</Text>
        </Link>
      </Layout>
    </>
  );
}
