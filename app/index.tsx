import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth, AuthProvider } from '../hooks/useAuth';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import TabNavigator from '../navigation/TabNavigator';
import AuthNavigator from '../navigation/AuthNavigator';
import { Colors } from '../constants/Styles';
import WelcomeBackScreen from './components/WelcomeBackScreen';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { resolvedMode } = useTheme();
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const hasBootstrapped = useRef(false);
  const previousAuthState = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    if (!hasBootstrapped.current) {
      hasBootstrapped.current = true;
      previousAuthState.current = isAuthenticated;
      return;
    }

    if (!previousAuthState.current && isAuthenticated) {
      setShowWelcomeBack(true);
      const timer = setTimeout(() => {
        setShowWelcomeBack(false);
      }, 1500);

      previousAuthState.current = isAuthenticated;
      return () => clearTimeout(timer);
    }

    if (!isAuthenticated) {
      setShowWelcomeBack(false);
    }

    previousAuthState.current = isAuthenticated;
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: resolvedMode === 'dark' ? '#111827' : Colors.white }]}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
      {isAuthenticated && showWelcomeBack ? (
        <WelcomeBackScreen adminName={user?.name} />
      ) : isAuthenticated ? (
        <TabNavigator />
      ) : (
        <AuthNavigator />
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
});
