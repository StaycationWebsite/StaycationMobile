import React, { useMemo } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from '@/lib/hooks/useTheme';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  color?: string;
  size?: "small" | "large";
}

export default function LoadingSpinner({
  fullScreen = false,
  color,
  size = "large",
}: LoadingSpinnerProps) {
  const { theme } = useTheme();
  const spinnerColor = color || theme.colors.primary;

  const styles = useMemo(() => StyleSheet.create({
    fullScreen: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
    },
  }), [theme.colors]);

  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={spinnerColor} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={spinnerColor} />;
}

