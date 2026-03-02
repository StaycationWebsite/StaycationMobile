import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../../constants/Styles';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const VARIANT: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary:   { bg: Colors.brand.primary, text: Colors.white },
  secondary: { bg: Colors.gray[100], text: Colors.gray[700] },
  danger:    { bg: Colors.red[500], text: Colors.white },
  success:   { bg: Colors.green[500], text: Colors.white },
  ghost:     { bg: 'transparent', text: Colors.brand.primary, border: Colors.brand.primary },
};

const SIZE: Record<ButtonSize, { height: number; fontSize: number; px: number }> = {
  sm: { height: 36, fontSize: 12, px: 14 },
  md: { height: 46, fontSize: 14, px: 20 },
  lg: { height: 54, fontSize: 16, px: 28 },
};

export default function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, textStyle,
}: ButtonProps) {
  const v = VARIANT[variant];
  const s = SIZE[size];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.btn,
        { height: s.height, paddingHorizontal: s.px, backgroundColor: v.bg },
        v.border && { borderWidth: 1.5, borderColor: v.border },
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={v.text} size="small" />
        : <Text style={[styles.label, { fontSize: s.fontSize, color: v.text }, textStyle]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  label: { fontWeight: '700' },
});
