import React, { useRef, useState } from 'react';
import { View, Image, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_PADDING = 16;
const IMAGE_SIZE = SCREEN_WIDTH - IMAGE_PADDING * 2;

interface ProductImageGalleryProps {
  images?: { url: string }[];
  height?: number;
}

export function ProductImageGallery({ images = [], height }: ProductImageGalleryProps) {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const displayHeight = height ?? IMAGE_SIZE;
  const validImages = images.filter((img) => !!img.url);

  if (validImages.length === 0) {
    return (
      <View
        style={{
          marginHorizontal: IMAGE_PADDING,
          marginTop: 8,
          height: displayHeight,
          borderRadius: 20,
          backgroundColor: colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <MaterialIcons name="image" size={56} color={colors.mutedFg} />
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: IMAGE_PADDING, paddingTop: 8 }}>
      <View style={{ borderRadius: 20, overflow: 'hidden', height: displayHeight }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / IMAGE_SIZE);
            setActiveIndex(index);
          }}>
          {validImages.map((img, i) => (
            <Image
              key={i}
              source={{ uri: img.url }}
              style={{
                width: IMAGE_SIZE,
                height: displayHeight,
                backgroundColor: colors.muted,
              }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Dot indicators */}
        {validImages.length > 1 && (
          <View
            style={{
              position: 'absolute',
              bottom: 12,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}>
            {validImages.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === activeIndex ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    i === activeIndex ? colors.primary : colors.primaryFg + '99',
                }}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
