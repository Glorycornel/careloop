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
  const orbit = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(orbit, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [orbit]);

  if (!isHydrated) {
    const glowOpacity = glow.interpolate({
      inputRange: [0, 1],
      outputRange: [0.15, 0.45],
    });
    const spin = orbit.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
        <Animated.View style={[styles.ringOuter, { transform: [{ rotate: spin }] }]}>
          <View style={styles.ringOuterAccent} />
        </Animated.View>
        <Animated.View style={[styles.ringInner, { transform: [{ rotate: spin }] }]}>
          <View style={styles.ringInnerAccent} />
        </Animated.View>
        <View style={styles.markCard}>
          <View style={styles.markOuterLoop} />
          <View style={styles.markInnerLoop} />
        </View>
        <Text style={styles.brand}>CareLoop</Text>
        <Text style={styles.tagline}>Own your day, build your streak.</Text>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={palette.primary} />
          <Text style={styles.loadingText}>Syncing your habits</Text>
        </View>
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
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: palette.primary,
    },
    ringOuter: {
      position: 'absolute',
      width: 144,
      height: 144,
      borderRadius: 72,
      borderWidth: 5,
      borderColor: palette.primarySoft,
    },
    ringOuterAccent: {
      position: 'absolute',
      top: -5,
      left: 46,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: palette.primary,
    },
    ringInner: {
      position: 'absolute',
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 5,
      borderColor: palette.secondarySoft,
    },
    ringInnerAccent: {
      position: 'absolute',
      right: -5,
      top: 26,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: palette.secondary,
    },
    markCard: {
      width: 104,
      height: 104,
      borderRadius: 32,
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.border,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: palette.text,
      shadowOpacity: 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    markOuterLoop: {
      position: 'absolute',
      width: 58,
      height: 58,
      borderRadius: 29,
      borderWidth: 8,
      borderTopColor: palette.primary,
      borderRightColor: palette.primary,
      borderBottomColor: 'transparent',
      borderLeftColor: 'transparent',
      transform: [{ rotate: '18deg' }],
    },
    markInnerLoop: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 7,
      borderTopColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: palette.secondary,
      borderLeftColor: palette.secondary,
      transform: [{ rotate: '12deg' }, { translateY: 6 }],
    },
    brand: {
      marginTop: 18,
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
    loadingRow: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 999,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    loadingText: {
      color: palette.muted,
      fontSize: 13,
      fontWeight: '600',
    },
  });
}
