/**
 * GoogleOAuthButton - Mobile App Only
 *
 * This component handles Google OAuth authentication for the mobile app only.
 * It is NOT used for web - the web has its own NextAuth login.
 *
 * Features:
 * - Opens backend OAuth endpoint which handles Google authentication
 * - Never captures passwords in the app
 * - Backend exchanges auth code with Google for secure session
 * - Deep links back to app with session token
 * - Stores session in AsyncStorage for persistence
 * - Handles all error states gracefully
 */

import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/Styles';

interface GoogleOAuthButtonProps {
  onSuccess?: (userEmail: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

/**
 * GoogleOAuthButton Component
 *
 * Handles Google Sign-In by opening the backend OAuth endpoint:
 * 1. Opens browser to backend OAuth endpoint
 * 2. Backend redirects to Google for authentication
 * 3. User logs in with Google
 * 4. Backend receives code from Google and creates session
 * 5. Backend deep links back to app with session token
 * 6. Session is stored in device storage
 * 7. User is authenticated
 */
export default function GoogleOAuthButton({
  onSuccess,
  onError,
  disabled = false,
}: GoogleOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Initiates the OAuth flow
   * Opens backend OAuth endpoint
   */
  const handlePress = async () => {
    if (isLoading || disabled) {
      return;
    }

    try {
      setIsLoading(true);

      console.log('[OAuth] Opening Google login endpoint');

      // Open the backend OAuth endpoint
      // Backend will handle:
      // 1. Redirecting to Google
      // 2. Processing Google callback
      // 3. Creating session
      // 4. Deep linking back to app
      const oauthUrl = 'https://www.staycationhavenph.com/api/auth/google';

      const canOpen = await Linking.canOpenURL(oauthUrl);
      if (!canOpen) {
        // For testing purposes, show alert if URL can't be opened
        Alert.alert('Info', 'Google OAuth endpoint is not directly accessible in this environment');
        setIsLoading(false);
        return;
      }

      await Linking.openURL(oauthUrl);

      // Note: When backend deep links back to the app, it will trigger
      // the deep link listener to handle the session
      console.log('[OAuth] Browser opened for Google authentication');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start Google sign-in';
      console.error('[OAuth] Launch error:', errorMessage);

      onError?.(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        (isLoading || disabled) && styles.buttonDisabled,
      ]}
      onPress={handlePress}
      disabled={isLoading || disabled}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color={Colors.gray[700]} />
          <Text style={styles.buttonText}>Signing in...</Text>
        </>
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#EA4335" />
          <Text style={styles.buttonText}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    width: '100%',
    height: 48,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
    fontFamily: Fonts.inter,
  },
});
