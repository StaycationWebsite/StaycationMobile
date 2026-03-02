import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/Styles';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  color?: string;
  size?: 'small' | 'large';
}

export default function LoadingSpinner({
  fullScreen = false, color = Colors.brand.primary, size = 'large',
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={color} />;
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
});
