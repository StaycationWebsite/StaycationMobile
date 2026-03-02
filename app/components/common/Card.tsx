import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../../constants/Styles';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  style?: ViewStyle;
  padding?: number;
}

export default function Card({ children, variant = 'default', style, padding = 16 }: CardProps) {
  return (
    <View style={[
      styles.card,
      variant === 'outlined' && styles.outlined,
      variant === 'elevated' && styles.elevated,
      { padding },
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden' },
  outlined: { borderWidth: 1, borderColor: Colors.gray[200] },
  elevated: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
});
