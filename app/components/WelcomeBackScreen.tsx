import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Styles';

interface WelcomeBackScreenProps {
  adminName?: string | null;
}

export default function WelcomeBackScreen({ adminName }: WelcomeBackScreenProps) {
  const entrance = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const createWave = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 220,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(180),
        ])
      );

    const wave = Animated.parallel([
      createWave(dot1, 0),
      createWave(dot2, 120),
      createWave(dot3, 240),
    ]);

    wave.start();
  }, [entrance, dot1, dot2, dot3]);

  const displayName = adminName?.trim() || 'Admin';
  const dot1TranslateY = dot1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });
  const dot2TranslateY = dot2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });
  const dot3TranslateY = dot3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          {
            opacity: entrance,
            transform: [
              {
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [14, 0],
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
        <View style={styles.logoWrap}>
          <Image source={require('../../assets/haven_logo.png')} style={styles.logo} resizeMode="contain" />
          <View style={styles.checkBadge}>
            <Feather name="check" size={11} color={Colors.white} />
          </View>
        </View>

        <Text style={styles.title}>Welcome back, {displayName}</Text>
        <Text style={styles.subtitle}>Preparing your dashboard...</Text>

        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, styles.dotPrimary, { transform: [{ translateY: dot1TranslateY }] }]} />
          <Animated.View style={[styles.dot, styles.dotSecondary, { transform: [{ translateY: dot2TranslateY }] }]} />
          <Animated.View style={[styles.dot, styles.dotPrimary, { transform: [{ translateY: dot3TranslateY }] }]} />
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
    backgroundColor: Colors.gray[50],
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  logoWrap: {
    position: 'relative',
    marginBottom: 14,
  },
  logo: {
    width: 56,
    height: 56,
  },
  checkBadge: {
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
    textAlign: 'center',
    color: Colors.gray[900],
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
    color: Colors.gray[600],
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotPrimary: {
    backgroundColor: Colors.brand.primary,
  },
  dotSecondary: {
    backgroundColor: Colors.gray[300],
  },
});
