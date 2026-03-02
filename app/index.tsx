import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import AuthNavigator from '../navigation/AuthNavigator';
import AdminNavigator from '../navigation/AdminNavigator';
import WelcomeBackScreen from './components/WelcomeBackScreen';
import '../utils/ignoreWarnings';

const PRIMARY_COLOR = '#2563EB';
const WHITE = '#FFFFFF';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { theme, mode } = useTheme();
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const hasBootstrapped = useRef(false);
  const previousAuthState = useRef(false);
  const navigationTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

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
      }, 5000);

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.primary,
          notification: theme.colors.primary,
        },
      }}
    >
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {isAuthenticated && showWelcomeBack ? (
        <WelcomeBackScreen adminName={user?.name} />
      ) : isAuthenticated ? (
        <AdminNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: WHITE,
  },
});
