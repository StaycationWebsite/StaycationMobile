import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Colors } from '../../constants/Styles';
import { Images } from '../../assets';
import { getGoogleClientConfig } from '../../constants/oauth';
import { useAuth } from '../hooks/useAuth';
import type { WelcomeSocialStyles } from '../welcomeOAuthStyles';
import { WelcomeSocialButtonContent } from '../oauth/WelcomeSocialButtonContent';

type GoogleProps = { styles: WelcomeSocialStyles };

export function WelcomeGoogleButtonNative({ styles: s }: GoogleProps) {
  const { signInWithGoogleIdToken } = useAuth();
  const { webClientId, iosClientId } = useMemo(() => getGoogleClientConfig(), []);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!webClientId) {
      setReady(false);
      return;
    }
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      webClientId,
      ...(iosClientId ? { iosClientId } : {}),
    });
    setReady(true);
  }, [webClientId, iosClientId]);

  const onPress = useCallback(async () => {
    if (!webClientId || !ready) return;
    setBusy(true);
    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      const res = await GoogleSignin.signIn();
      if (res.type !== 'success') {
        return;
      }
      let idToken = res.data.idToken;
      if (!idToken) {
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens.idToken;
      }
      if (!idToken) {
        Alert.alert(
          'Google sign-in',
          'No ID token returned. In Google Cloud Console, use a Web application OAuth client ID as EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.'
        );
        return;
      }
      const result = await signInWithGoogleIdToken(idToken);
      if (!result.success && result.error) {
        Alert.alert('Google sign-in', result.error);
      }
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      if (err.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Google sign-in', 'Sign-in already in progress.');
        return;
      }
      Alert.alert('Google sign-in', err.message || 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  }, [webClientId, ready, signInWithGoogleIdToken]);

  return (
    <TouchableOpacity style={s.socialBtn} onPress={onPress} disabled={busy || !ready} activeOpacity={0.85}>
      {busy ? (
        <ActivityIndicator color={Colors.gray[700]} />
      ) : (
        <WelcomeSocialButtonContent
          styles={s}
          icon={<Image source={Images.gmail} style={s.socialLogo} resizeMode="contain" />}
          label="Continue with Google"
        />
      )}
    </TouchableOpacity>
  );
}
