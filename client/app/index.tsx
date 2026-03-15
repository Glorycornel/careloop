import { Redirect } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { usePalette } from '@/hooks/usePalette';
import { useAuthStore } from '@/store/useAuthStore';

export default function Index() {
  const { isHydrated } = useAuthStore();
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [glow]);

  if (!isHydrated) {
    const glowOpacity = glow.interpolate({
      inputRange: [0, 1],
      outputRange: [0.15, 0.45],
    });

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.brand}>CareLoop</Text>
        <Text style={styles.tagline}>Own your day, build your streak.</Text>
      </View>
    );
  }

  return <Redirect href="/(tabs)" />;
}

function makeStyles(palette: typeof Colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    glow: {
      position: 'absolute',
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: palette.primary,
    },
    brand: {
      marginTop: 8,
      fontSize: 36,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: palette.text,
    },
    tagline: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.muted,
    },
  });
}
