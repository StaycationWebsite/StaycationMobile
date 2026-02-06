import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { ApiService } from '../services/api';
import { AuthProvider } from '../types/auth';
import { Colors, Fonts } from '../../constants/Styles';
import GoogleOAuthButton from './GoogleOAuthButton';

interface OAuthProvidersProps {
  onLoginSuccess?: (email: string) => void;
  onLoginError?: (error: string) => void;
  showLabel?: boolean;
}

/**
 * OAuthProviders Component
 *
 * Dynamically fetches available OAuth providers from the backend
 * and displays the appropriate login buttons.
 *
 * Usage:
 * <OAuthProviders
 *   onLoginSuccess={(email) => console.log('Logged in as', email)}
 *   onLoginError={(error) => console.log('Error:', error)}
 * />
 */
export default function OAuthProviders({
  onLoginSuccess,
  onLoginError,
  showLabel = true,
}: OAuthProvidersProps) {
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ApiService.getAuthProviders();

      if (response.success && response.data) {
        setProviders(response.data);
      } else {
        setError(response.error || 'Failed to load authentication providers');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
        <Text style={styles.loadingText}>Loading sign-in options...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const googleProvider = providers.find((p) => p.id === 'google');
  const facebookProvider = providers.find((p) => p.id === 'facebook');

  if (!googleProvider && !facebookProvider) {
    return null; // No OAuth providers available
  }

  return (
    <View style={styles.container}>
      {showLabel && providers.length > 0 && (
        <View style={styles.labelContainer}>
          <View style={styles.divider} />
          <Text style={styles.labelText}>Or continue with</Text>
          <View style={styles.divider} />
        </View>
      )}

      <View style={styles.buttonContainer}>
        {googleProvider && (
          <GoogleOAuthButton
            onSuccess={onLoginSuccess}
            onError={onLoginError}
          />
        )}

        {/* Facebook button can be added similarly */}
        {/* {facebookProvider && (
          <FacebookOAuthButton
            onSuccess={onLoginSuccess}
            onError={onLoginError}
          />
        )} */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[200],
  },
  labelText: {
    fontSize: 12,
    color: Colors.gray[500],
    marginHorizontal: 16,
    fontFamily: Fonts.inter,
  },
  buttonContainer: {
    width: '100%',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: Colors.red[500],
    fontFamily: Fonts.inter,
    textAlign: 'center',
    padding: 12,
  },
});
