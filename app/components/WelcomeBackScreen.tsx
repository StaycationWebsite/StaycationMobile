import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Colors, Fonts } from '../../constants/Styles';
import { useTheme } from '../../hooks/useTheme';

interface WelcomeBackScreenProps {
  adminName?: string | null;
}

export default function WelcomeBackScreen({ adminName }: WelcomeBackScreenProps) {
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === 'dark';

  const entrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [entrance, pulse]);

  const theme = useMemo(
    () => ({
      page: isDark ? '#0F172A' : '#F8FAFC',
      card: isDark ? '#111827' : Colors.white,
      border: isDark ? '#1F2937' : Colors.gray[200],
      text: isDark ? '#E5E7EB' : Colors.gray[900],
      muted: isDark ? '#9CA3AF' : Colors.gray[600],
    }),
    [isDark]
  );

  const primaryDotScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.15],
  });
  const secondaryDotScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1.1, 0.85],
  });

  const displayName = adminName?.trim() || 'Admin';

  return (
    <View style={[styles.container, { backgroundColor: theme.page }]}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            opacity: entrance,
            transform: [
              {
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
              {
                scale: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.98, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.logoRow}>
          <Image source={require('../../assets/haven_logo.png')} style={styles.logo} resizeMode="contain" />
          <View style={styles.statusBadge}>
            <Feather name="check" size={12} color={Colors.white} />
          </View>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Welcome back, {displayName}</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>Preparing your admin dashboard...</Text>

        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, styles.dotPrimary, { transform: [{ scale: primaryDotScale }] }]} />
          <Animated.View style={[styles.dot, styles.dotSecondary, { transform: [{ scale: secondaryDotScale }] }]} />
          <Animated.View style={[styles.dot, styles.dotPrimary, { transform: [{ scale: primaryDotScale }] }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  logoRow: {
    position: 'relative',
    marginBottom: 16,
  },
  logo: {
    width: 56,
    height: 56,
  },
  statusBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: Fonts.poppins,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: Fonts.inter,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotPrimary: {
    backgroundColor: Colors.brand.primary,
  },
  dotSecondary: {
    backgroundColor: '#D1D5DB',
  },
});
