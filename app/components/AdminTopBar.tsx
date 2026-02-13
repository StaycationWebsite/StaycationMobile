import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/Styles';
import Sidebar from './Sidebar';

type AdminTopBarProps = {
  title: string;
};

export default function AdminTopBar({ title }: AdminTopBarProps) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(menuAnimation, {
      toValue: sidebarVisible ? 1 : 0,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [sidebarVisible, menuAnimation]);

  const topLineStyle = {
    transform: [
      {
        translateY: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-6, 0],
        }),
      },
      {
        rotate: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  const middleLineStyle = {
    opacity: menuAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
    transform: [
      {
        scaleX: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.4],
        }),
      },
    ],
  };

  const bottomLineStyle = {
    transform: [
      {
        translateY: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [6, 0],
        }),
      },
      {
        rotate: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-45deg'],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      <View style={styles.container}>
        <TouchableOpacity style={styles.iconButton} onPress={() => setSidebarVisible((prev) => !prev)}>
          <View style={styles.menuIcon}>
            <Animated.View style={[styles.menuLine, topLineStyle]} />
            <Animated.View style={[styles.menuLine, middleLineStyle]} />
            <Animated.View style={[styles.menuLine, bottomLineStyle]} />
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="bell" size={20} color={Colors.gray[900]} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.white,
  },
  container: {
    height: 56,
    paddingHorizontal: 16,
    paddingTop: 14,
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    backgroundColor: Colors.white,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[50],
  },
  menuIcon: {
    width: 20,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLine: {
    position: 'absolute',
    width: 18,
    height: 2,
    borderRadius: 2,
    backgroundColor: Colors.gray[900],
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Fonts.poppins,
  },
});
