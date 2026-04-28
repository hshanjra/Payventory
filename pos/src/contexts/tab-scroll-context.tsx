import React, { createContext, useContext, useRef } from 'react';
import { Animated, NativeSyntheticEvent, NativeScrollEvent, Easing } from 'react-native';

const TabScrollContext = createContext<Animated.Value | null>(null);

export function useTabScroll() {
  return useContext(TabScrollContext);
}

export function useScrollHandler() {
  const translateY = useTabScroll();
  const lastOffsetY = useRef(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!translateY) return;
    const offsetY = e.nativeEvent.contentOffset.y;

    // Hide/show bottom tabs smoothly and quickly
    if (offsetY > lastOffsetY.current && offsetY > 50) {
      Animated.timing(translateY, {
        toValue: 70, // Move off screen
        duration: 200,
        useNativeDriver: false,
        delay: 0,
        easing: Easing.out(Easing.ease),
      }).start();
    } else if (offsetY < lastOffsetY.current || offsetY <= 50) {
      Animated.timing(translateY, {
        toValue: 0, // Bring back to original position
        duration: 150,
        useNativeDriver: false,
        delay: 0,
        easing: Easing.out(Easing.ease),
      }).start();
    }
    lastOffsetY.current = offsetY;
  };

  return onScroll;
}

export function TabScrollProvider({ children }: { children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(0)).current;

  return <TabScrollContext.Provider value={translateY}>{children}</TabScrollContext.Provider>;
}
