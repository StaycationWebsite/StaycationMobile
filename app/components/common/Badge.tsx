import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/Styles';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  success:  { bg: Colors.green[100], text: Colors.green[500] },
  warning:  { bg: Colors.yellow[100], text: '#92400E' },
  error:    { bg: Colors.red[100], text: Colors.red[500] },
  info:     { bg: Colors.blue[100], text: Colors.blue[600] },
  pending:  { bg: '#FEF3C7', text: '#B45309' },
  primary:  { bg: Colors.brand.primarySoft, text: Colors.brand.primaryDark },
};

export default function Badge({ label, variant = 'info', size = 'md' }: BadgeProps) {
  const { bg, text } = VARIANT_STYLES[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, size === 'sm' && styles.badgeSm]}>
      <Text style={[styles.label, { color: text }, size === 'sm' && styles.labelSm]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  badgeSm: { paddingHorizontal: 7, paddingVertical: 2 },
  label: { fontSize: 12, fontWeight: '700' },
  labelSm: { fontSize: 10 },
});
