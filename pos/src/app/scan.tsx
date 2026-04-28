import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [isScanned, setIsScanned] = useState(false);

  const scanAnim = useRef(new Animated.Value(0)).current;

  // Start the scan animation loop
  useEffect(() => {
    if (!isScanned && permission?.granted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnim.stopAnimation();
    }
  }, [scanAnim, isScanned, permission?.granted]);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-110, 110],
  });

  if (!permission) {
    return <View className="flex-1 bg-[#15161A]" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-[#15161A] p-6">
        <MaterialIcons name="camera-alt" size={64} color="#9ca3af" />
        <Text className="mt-4 text-center text-lg font-bold text-white">
          We need your permission to use the camera
        </Text>
        <Text className="mb-10 mt-2 text-center text-sm text-[#9ca3af]">
          This allows you to scan barcodes for faster checkout and price lookups.
        </Text>
        <Pressable onPress={requestPermission} className="rounded-full bg-primary px-8 py-3.5">
          <Text className="text-[15px] font-bold text-white">Grant Permission</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} className="mt-4 px-6 py-3">
          <Text className="font-semibold tracking-wider text-[#9ca3af]">GO BACK</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={(result) => {
          if (isScanned) return;
          setIsScanned(true);
          console.log('Scanned barcode:', result.data);

          // Slight delay before backing out, so user sees scan success
          setTimeout(() => {
            router.back();
          }, 600);
        }}
      />
      <View
        style={{ paddingHorizontal: 20, ...StyleSheet.absoluteFillObject }}
        className={`flex-1 ${isScanned ? 'bg-success/30' : 'bg-black/40'} transition-colors duration-300`}>
        <View className="mt-8 flex-row items-center justify-between pt-4">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <MaterialIcons name="close" size={24} color="#fff" />
          </Pressable>
          <View className={`rounded-full px-5 py-2 ${isScanned ? 'bg-success' : 'bg-white/20'}`}>
            <Text className="text-xs font-bold tracking-widest text-white">
              {isScanned ? 'SCANNED!' : 'SCAN PRODUCT'}
            </Text>
          </View>
          <Pressable
            onPress={() => setTorch(!torch)}
            className={`h-10 w-10 items-center justify-center rounded-full ${torch ? 'bg-white' : 'bg-white/20'}`}>
            <MaterialIcons
              name={torch ? 'flash-on' : 'flash-off'}
              size={22}
              color={torch ? 'var(--color-primary)' : '#fff'}
            />
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center pb-20">
          {/* Viewfinder crosshairs representing scanner area */}
          <View
            className={`relative h-64 w-64 rounded-[32px] border-[0.5px] ${isScanned ? 'border-success/50' : 'border-white/20'}`}>
            <View
              className={`absolute left-0 top-0 h-12 w-12 rounded-br rounded-tl-[32px] border-l-[5px] border-t-[5px] opacity-100 ${isScanned ? 'border-success' : 'border-white'}`}
            />
            <View
              className={`absolute right-0 top-0 h-12 w-12 rounded-bl rounded-tr-[32px] border-r-[5px] border-t-[5px] opacity-100 ${isScanned ? 'border-success' : 'border-white'}`}
            />
            <View
              className={`absolute bottom-0 left-0 h-12 w-12 rounded-bl-[32px] rounded-tr border-b-[5px] border-l-[5px] opacity-100 ${isScanned ? 'border-success' : 'border-white'}`}
            />
            <View
              className={`absolute bottom-0 right-0 h-12 w-12 rounded-br-[32px] rounded-tl border-b-[5px] border-r-[5px] opacity-100 ${isScanned ? 'border-success' : 'border-white'}`}
            />

            {!isScanned && (
              <Animated.View
                style={{
                  transform: [{ translateY }],
                  position: 'absolute',
                  top: '50%',
                  height: 2,
                  width: '100%',
                  backgroundColor: 'var(--color-primary)',
                  shadowColor: 'var(--color-primary)',
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 8,
                }}
              />
            )}
          </View>

          <Text
            className={`mt-10 max-w-[200px] text-center text-[17px] font-bold leading-relaxed ${isScanned ? 'text-success' : 'text-white/90'}`}>
            {isScanned ? 'Success!' : 'Align barcode within the frame to scan'}
          </Text>
        </View>
      </View>
    </View>
  );
}
