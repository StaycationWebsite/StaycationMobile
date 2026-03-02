import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../app/hooks/useAuth';
import { Colors } from '../constants/Styles';
import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import CsrNavigator from './CsrNavigator';

export default function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Route to the correct navigator based on role
  if (user?.role === 'admin' || user?.role === 'manager') {
    return <AdminNavigator />;
  }

  // Default to CSR navigator
  return <CsrNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
});
