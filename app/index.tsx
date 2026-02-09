import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth, AuthProvider } from '../hooks/useAuth';
import TabNavigator from '../navigation/TabNavigator';
import AuthNavigator from '../navigation/AuthNavigator';
import { Colors } from '../constants/Styles';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      {isAuthenticated ? (
        <TabNavigator />
      ) : (
        <AuthNavigator />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
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
