/**
 * Merges into static `app.json`. Sets Google Sign-In iOS URL scheme from env (reversed iOS client id).
 * @see https://github.com/react-native-google-signin/google-signin/blob/master/docs/ios-setup.md
 */
module.exports = ({ config }) => {
  const iosUrlScheme =
    process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME ||
    'com.googleusercontent.apps.REPLACE_ME_IN_ENV';

  const plugins = (config.plugins || []).map((entry) => {
    if (entry === '@react-native-google-signin/google-signin') {
      return ['@react-native-google-signin/google-signin', { iosUrlScheme }];
    }
    if (Array.isArray(entry) && entry[0] === '@react-native-google-signin/google-signin') {
      return ['@react-native-google-signin/google-signin', { iosUrlScheme, ...(entry[1] || {}) }];
    }
    return entry;
  });

  return {
    ...config,
    plugins,
  };
};
