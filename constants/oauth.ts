import { makeRedirectUri } from 'expo-auth-session';

/** Must match redirect URIs registered in Google Cloud + Facebook developer console. */
export function getGoogleRedirectUri(): string {
  return makeRedirectUri({ path: 'oauthredirect' });
}

export function getFacebookRedirectUri(appId: string): string {
  return makeRedirectUri({ native: `fb${appId}://authorize` });
}

export function getGoogleClientConfig(): {
  iosClientId?: string;
  androidClientId?: string;
  webClientId?: string;
  configured: boolean;
} {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  /** Native `@react-native-google-signin/google-signin` needs `webClientId` (server/client ID) at minimum. */
  const configured = !!webClientId?.trim();
  return {
    iosClientId: iosClientId || undefined,
    androidClientId: androidClientId || undefined,
    webClientId: webClientId?.trim() || undefined,
    configured,
  };
}

export function getFacebookAppId(): string | undefined {
  const id = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;
  return id && id.trim().length > 0 ? id.trim() : undefined;
}
