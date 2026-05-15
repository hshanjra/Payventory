import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Define a placeholder or require the real implementation
const ScanCamera = !isExpoGo ? require('@/components/camera/scan-camera').default : null;

export default function ScanScreen() {
  const router = useRouter();

  if (isExpoGo || !ScanCamera) {
    return (
      <View className="flex-1 items-center justify-center bg-[#15161A] p-6">
        <MaterialIcons name="camera-alt" size={64} color="#9ca3af" />
        <Text className="mt-4 text-center text-lg font-bold text-white">Camera Unavailable</Text>
        <Text className="mb-10 mt-2 text-center text-sm text-[#9ca3af]">
          The camera features are not available in Expo Go. Please use a development build or
          install the APK to test this feature.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="rounded-full bg-primary px-8 py-3.5 active:opacity-80">
          <Text className="text-[15px] font-bold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return <ScanCamera />;
}
