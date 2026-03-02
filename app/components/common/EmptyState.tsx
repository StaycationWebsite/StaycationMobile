import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../../constants/Styles';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon = 'inbox', title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Feather name={icon as any} size={36} color={Colors.gray[300]} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.action} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  iconBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.gray[100], justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  title: { fontSize: 17, fontWeight: '700', color: Colors.gray[800], marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 14, color: Colors.gray[500], textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  action: {
    backgroundColor: Colors.brand.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },
  actionText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
});
