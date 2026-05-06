import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import Constants from 'expo-constants';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { ResponseType } from 'expo-auth-session';
import { Colors } from '../../constants/Styles';
import { getFacebookRedirectUri } from '../../constants/oauth';
import { useAuth } from '@/lib/hooks/useAuth';
import type { WelcomeSocialStyles } from '@/lib/welcomeOAuthStyles';

const OAUTH_ENV_HELP =
  'Google: set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (required) and EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME for iOS builds. Optional: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID. Use a development build (`npx expo run:android` / `run:ios`); Google Sign-In does not run in Expo Go. Facebook: EXPO_PUBLIC_FACEBOOK_APP_ID. Restart Expo after editing .env.';

export type { WelcomeSocialStyles };

type GoogleProps = { styles: WelcomeSocialStyles };

const isExpoGo = Constants.appOwnership === 'expo';

function WelcomeGoogleButtonExpoGo({ styles: s }: GoogleProps) {
  const onPress = useCallback(() => {
    Alert.alert(
      'Google sign-in',
      'Native Google Sign-In is not available in Expo Go. Create a development build with `npx expo run:android` or `npx expo run:ios`, or use email login.'
    );
  }, []);
  return (
    <TouchableOpacity style={s.socialBtn} onPress={onPress} activeOpacity={0.85}>
      <View style={s.socialIconSlot}>
        <Image source={require('../../assets/gmail.png')} style={s.socialLogo} resizeMode="contain" />
      </View>
      <Text style={s.socialBtnText}>Continue with Google</Text>
      <View style={s.socialBtnRightSpacer} />
    </TouchableOpacity>
  );
}

export function WelcomeGoogleButton(props: GoogleProps) {
  if (isExpoGo) {
    return <WelcomeGoogleButtonExpoGo {...props} />;
  }
  const { WelcomeGoogleButtonNative } = require('../google/WelcomeGoogleNativeButton') as typeof import('../google/WelcomeGoogleNativeButton');
  return <WelcomeGoogleButtonNative {...props} />;
}

type FacebookProps = { styles: WelcomeSocialStyles; appId: string };

export function WelcomeFacebookButton({ styles: s, appId }: FacebookProps) {
  const { signInWithOAuthCode } = useAuth();
  const redirectUri = useMemo(() => getFacebookRedirectUri(appId), [appId]);
  const [busy, setBusy] = useState(false);
  const handledCode = useRef<string | null>(null);

  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: appId,
    redirectUri,
    responseType: ResponseType.Code,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === 'cancel' || response.type === 'dismiss') {
      setBusy(false);
      return;
    }
    if (response.type === 'error') {
      setBusy(false);
      Alert.alert('Facebook sign-in', response.error?.message ?? 'Something went wrong.');
      return;
    }
    if (response.type !== 'success') return;
    const code = response.params?.code;
    if (!code) {
      setBusy(false);
      Alert.alert('Facebook sign-in', 'No authorization code returned. Check Facebook Login settings.');
      return;
    }
    if (handledCode.current === code) return;
    handledCode.current = code;
    (async () => {
      const result = await signInWithOAuthCode('facebook', code, redirectUri);
      setBusy(false);
      if (!result.success && result.error) {
        Alert.alert('Facebook sign-in', result.error);
      }
    })();
  }, [response, redirectUri, signInWithOAuthCode]);

  const onPress = useCallback(async () => {
    if (!request) return;
    setBusy(true);
    try {
      await promptAsync({ showInRecents: true });
    } catch {
      setBusy(false);
      Alert.alert('Facebook sign-in', 'Could not open the sign-in browser.');
    }
  }, [promptAsync, request]);

  return (
    <TouchableOpacity style={s.socialBtn} onPress={onPress} disabled={busy || !request} activeOpacity={0.85}>
      {busy ? (
        <ActivityIndicator color={Colors.gray[700]} />
      ) : (
        <>
          <View style={s.socialIconSlot}>
            <Image source={require('../../assets/facebook.png')} style={s.socialLogoFacebook} resizeMode="contain" />
          </View>
          <Text style={s.socialBtnText}>Continue with Facebook</Text>
          <View style={s.socialBtnRightSpacer} />
        </>
      )}
    </TouchableOpacity>
  );
}

export function oauthConfigAlert() {
  Alert.alert('Social sign-in setup', OAUTH_ENV_HELP);
}
