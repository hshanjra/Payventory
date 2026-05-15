import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
  useFrameProcessor,
  runAtTargetFps,
} from 'react-native-vision-camera';
import { performOcr } from '@bear-block/vision-camera-ocr';
import { scheduleOnRN } from 'react-native-worklets';
import { useMedusaSdk } from '@/contexts/auth';
import { useTheme } from '@/theme/useTheme';

export default function ScanCamera() {
  const router = useRouter();
  const sdk = useMedusaSdk();
  const { colors } = useTheme();

  // ── Camera setup ──────────────────────────────────────────────────────────
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [torch, setTorch] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // ── Scan State ────────────────────────────────────────────────────────────
  const [isScanned, setIsScanned] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [liveDetectedText, setLiveDetectedText] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Align item within the frame to scan');

  const scanAnim = useRef(new Animated.Value(0)).current;

  // Request permission on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  // Start the scan animation loop
  useEffect(() => {
    if (!isScanned && hasPermission) {
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
  }, [scanAnim, isScanned, hasPermission]);

  const handleSearch = useCallback(
    async (code: string) => {
      if (isScanned || isSearching) return;

      setDetectedCode(code);
      setIsScanned(true);
      setIsSearching(true);
      setStatusMessage(`Searching for "${code}"...`);

      try {
        const { products } = await sdk.admin.product.list({
          q: code,
          fields: '+variants.*,+variants.prices.*',
        });

        if (products && products.length > 0) {
          let matchedProduct = products[0];
          let matchedVariantId = products[0].variants?.[0]?.id;

          // Check for exact barcode/SKU match in variants first
          for (const p of products) {
            const variant = p.variants?.find(
              (v) =>
                v.barcode?.toLowerCase() === code.toLowerCase() ||
                v.sku?.toLowerCase() === code.toLowerCase()
            );
            if (variant) {
              matchedProduct = p;
              matchedVariantId = variant.id;
              break;
            }
          }

          setStatusMessage('Match found!');

          setTimeout(() => {
            setIsActive(false);
            router.push({
              pathname: `/product/${matchedProduct.id}/variant-select`,
              params: { variant_id: matchedVariantId },
            });
          }, 800);
        } else {
          setStatusMessage(`No match for "${code}"`);
          setTimeout(() => {
            setIsScanned(false);
            setIsSearching(false);
            setDetectedCode(null);
            setLiveDetectedText(null);
            setStatusMessage('Align item within the frame to scan');
          }, 2000);
        }
      } catch (error) {
        console.error('Search error:', error);
        setIsScanned(false);
        setIsSearching(false);
        setStatusMessage('Error searching. Please try again.');
      }
    },
    [isScanned, isSearching, sdk, router]
  );

  // ── Code Scanner (Barcodes/QR) ─────────────────────────────────────────────
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'upc-a', 'upc-e', 'code-128'],
    onCodeScanned: (codes) => {
      if (isScanned || isSearching || codes.length === 0) return;
      const codeValue = codes[0].value;
      if (codeValue) {
        handleSearch(codeValue);
      }
    },
  });

  // ── Frame Processor (OCR) ──────────────────────────────────────────────────
  const onTextDetected = (text: string) => {
    // Show the first line as live feedback
    const firstLine = text.split('\n')[0].trim();
    if (firstLine.length > 2) {
      setLiveDetectedText(firstLine.substring(0, 40));
    }

    // Look for alphanumeric codes (batch numbers)
    const matches = text.match(/[A-Z0-9]{5,}/g);
    if (matches && matches.length > 0) {
      handleSearch(matches[0]);
    }
  };

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      runAtTargetFps(2, () => {
        if (isScanned || isSearching) return;

        const result = performOcr(frame);
        if (result && result.text) {
          scheduleOnRN(onTextDetected, result.text);
        }
      });
    },
    [isScanned, isSearching]
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-110, 110],
  });

  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center bg-[#15161A] p-6">
        <MaterialIcons name="camera-alt" size={64} color="#9ca3af" />
        <Text className="mt-4 text-center text-lg font-bold text-white">
          Camera Access Required
        </Text>
        <Text className="mb-10 mt-2 text-center text-sm text-[#9ca3af]">
          This allows you to scan codes and batch numbers for faster processing.
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

  if (!device) {
    return (
      <View className="flex-1 items-center justify-center bg-[#15161A]">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        codeScanner={codeScanner}
        frameProcessor={frameProcessor}
        torch={torch ? 'on' : 'off'}
        pixelFormat="yuv" // Recommended for OCR performance
      />

      <View
        style={{ paddingHorizontal: 20, ...StyleSheet.absoluteFillObject }}
        className={`flex-1 ${isScanned ? 'bg-success/30' : 'bg-black/40'} transition-colors duration-300`}>
        {/* Top Header */}
        <View className="mt-8 flex-row items-center justify-between pt-4">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <MaterialIcons name="close" size={24} color="#fff" />
          </Pressable>
          <View className={`rounded-full px-5 py-2 ${isScanned ? 'bg-success' : 'bg-white/20'}`}>
            <Text className="text-xs font-bold uppercase tracking-widest text-white">
              {isScanned ? (isSearching ? 'SEARCHING...' : 'FOUND!') : 'LIVE SCAN'}
            </Text>
          </View>
          <Pressable
            onPress={() => setTorch(!torch)}
            className={`h-10 w-10 items-center justify-center rounded-full ${torch ? 'bg-white' : 'bg-white/20'}`}>
            <MaterialIcons
              name={torch ? 'flash-on' : 'flash-off'}
              size={22}
              color={torch ? colors.primary : '#fff'}
            />
          </Pressable>
        </View>

        {/* Viewfinder Area */}
        <View className="flex-1 items-center justify-center pb-20">
          <View
            className={`relative h-64 w-64 rounded-[32px] border-[0.5px] ${isScanned ? 'border-success/50' : 'border-white/20'}`}>
            {/* Corners */}
            <View
              className={`absolute left-0 top-0 h-12 w-12 rounded-br rounded-tl-[32px] border-l-[5px] border-t-[5px] ${isScanned ? 'border-success' : 'border-white'}`}
            />
            <View
              className={`absolute right-0 top-0 h-12 w-12 rounded-bl rounded-tr-[32px] border-r-[5px] border-t-[5px] ${isScanned ? 'border-success' : 'border-white'}`}
            />
            <View
              className={`absolute bottom-0 left-0 h-12 w-12 rounded-bl-[32px] rounded-tr border-b-[5px] border-l-[5px] ${isScanned ? 'border-success' : 'border-white'}`}
            />
            <View
              className={`absolute bottom-0 right-0 h-12 w-12 rounded-br-[32px] rounded-tl border-b-[5px] border-r-[5px] ${isScanned ? 'border-success' : 'border-white'}`}
            />

            {/* Scan Line Animation */}
            {!isScanned && (
              <Animated.View
                style={{
                  transform: [{ translateY }],
                  position: 'absolute',
                  top: '50%',
                  height: 2,
                  width: '100%',
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  elevation: 8,
                }}
              />
            )}

            {isSearching && (
              <View className="absolute inset-0 items-center justify-center rounded-[32px] bg-black/20">
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
          </View>

          {/* Real-time OCR Text Feedback */}
          {!isScanned && liveDetectedText && (
            <View className="mt-8 rounded-xl border border-white/10 bg-black/60 px-4 py-2 backdrop-blur-sm">
              <Text className="mb-1 text-center text-[10px] font-black uppercase tracking-[2px] text-white/40">
                Live Reading
              </Text>
              <Text className="text-center text-[15px] font-bold text-white">
                {liveDetectedText}
              </Text>
            </View>
          )}

          {/* Captured Match Info */}
          {detectedCode && (
            <View className="mt-8 rounded-xl border border-white/20 bg-white/20 px-4 py-1.5 backdrop-blur-md">
              <Text className="text-sm font-black uppercase tracking-wider text-white">
                Captured: {detectedCode}
              </Text>
            </View>
          )}

          <Text
            className={`mt-4 max-w-[240px] text-center text-[17px] font-bold leading-relaxed ${isScanned ? 'text-success' : 'text-white/90'}`}>
            {statusMessage}
          </Text>

          <View className="mt-6 flex-row items-center opacity-40">
            <MaterialIcons name="document-scanner" size={14} color="#fff" />
            <Text className="ml-2 text-[10px] font-black uppercase tracking-[3px] text-white">
              Barcodes • QR • Batch
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
