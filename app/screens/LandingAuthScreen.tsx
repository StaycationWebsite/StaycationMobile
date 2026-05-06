import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Styles';
import { getGoogleClientConfig, getFacebookAppId } from '../../constants/oauth';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  WelcomeGoogleButton,
  WelcomeFacebookButton,
  oauthConfigAlert,
} from '@/lib/oauth/WelcomeOAuthButtons';

type Phase = 'welcome' | 'auth';
type AuthTab = 'login' | 'register';

const FOOTER_TAGLINE =
  'Your perfect city escape awaits. Experience comfort, luxury, and exceptional service at our premium havens.';
const FOOTER_ADDRESS = 'Staycation Haven PH, Quezon City, Metro Manila Philippines.';
const FOOTER_PHONE = '+63 912 345 6789';
const FOOTER_EMAIL = 'info@staycationhaven.ph';

function DividerLabel({ label }: { label: string }) {
  return (
    <View style={dividerStyles.row}>
      <View style={dividerStyles.line} />
      <Text style={dividerStyles.label}>{label}</Text>
      <View style={dividerStyles.line} />
    </View>
  );
}

const dividerStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 12,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.gray[300],
  },
  label: {
    fontSize: 12,
    color: Colors.gray[500],
    fontWeight: '500',
  },
});

export default function LandingAuthScreen() {
  const { login, register, continueAsGuest, isLoading, error, clearError } = useAuth();
  const [phase, setPhase] = useState<Phase>('welcome');
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const { height: winH } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const gold = Colors.brand.primary;
  const openExternal = async (url: string, fallbackLabel: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) {
        Alert.alert('Unavailable', `Cannot open ${fallbackLabel} on this device.`);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unavailable', `Cannot open ${fallbackLabel} on this device.`);
    }
  };
  const onPressPhone = () => openExternal(`tel:${FOOTER_PHONE.replace(/\s+/g, '')}`, 'phone');
  const onPressEmail = () => openExternal(`mailto:${FOOTER_EMAIL}`, 'email');
  const isCompact = winH < 740;
  const headerLogoSize = isCompact ? 28 : 32;
  const cardLogoSize = isCompact ? 26 : 30;
  const cardPadding = isCompact ? 16 : 20;
  const cardSideMargin = isCompact ? 18 : 22;
  const headerPanelHeight = isCompact ? 58 : 64;
  const bodyFont = isCompact ? 13 : 14;
  const smallFont = isCompact ? 11 : 12;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: Colors.white },
        page: { flex: 1, position: 'relative' },
        // Background panel behind the form area. It intentionally overlaps:
        // - upward behind the header panel
        // - downward behind the top of the footer area
        formBackdrop: {
          position: 'absolute',
          left: 0,
          right: 0,
          // Cover full background behind header + form.
          top: 0,
          bottom: 0,
          backgroundColor: Colors.white,
          borderRadius: 0,
          borderWidth: 1,
          borderColor: Colors.gray[200],
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.08,
              shadowRadius: 18,
            },
            android: { elevation: 3 },
          }),
        },
        headerPanel: {
          backgroundColor: Colors.white,
          width: '100%',
          height: headerPanelHeight,
          justifyContent: 'center',
          paddingHorizontal: 18,
          borderBottomWidth: 1,
          borderBottomColor: Colors.gray[200],
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
            },
            android: { elevation: 2 },
          }),
        },
        // This is now just a layout container.
        // The actual “background panel behind the form” is `formBackdrop`.
        middlePanel: {
          flex: 1,
          minHeight: 0,
          marginTop: 10,
          marginHorizontal: cardSideMargin,
          paddingVertical: isCompact ? 8 : 10,
        },
        footerContainer: {
          backgroundColor: Colors.white,
          position: 'relative',
          borderTopWidth: 1,
          borderTopColor: Colors.gray[200],
          paddingHorizontal: 18,
          paddingTop: isCompact ? 2 : 4,
          paddingBottom: Math.max(insets.bottom + 14, 18),
        },
        footerTopShadow: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 12,
          backgroundColor: 'transparent',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.08,
              shadowRadius: 10,
            },
            android: {},
          }),
        },
        header: {
          alignItems: 'flex-start',
          paddingTop: 0,
          paddingBottom: 0,
        },
        logoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
        logo: { width: headerLogoSize, height: headerLogoSize },
        brandName: { fontSize: 20, fontWeight: '700', color: gold },
        card: {
          flex: 1,
          minHeight: 0,
          width: '100%',
          flexDirection: 'column',
          backgroundColor: Colors.white,
          borderRadius: 16,
          padding: cardPadding,
          borderWidth: 1,
          borderColor: Colors.gray[200],
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 10,
            },
            android: { elevation: 3 },
          }),
        },
        cardInnerScroll: {
          flex: 1,
          minHeight: 0,
        },
        cardInnerScrollContent: {
          paddingBottom: 16,
        },
        cardStickyFooter: {
          flexShrink: 0,
          paddingTop: 8,
        },
        termsSeparator: {
          alignSelf: 'stretch',
          height: Platform.OS === 'android' ? 1 : StyleSheet.hairlineWidth,
          backgroundColor: Colors.gray[200],
          marginTop: 12,
          marginBottom: 12,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.12,
              shadowRadius: 2,
            },
            default: {},
          }),
        },
        cardBrandRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          marginBottom: isCompact ? 12 : 14,
        },
        cardLogo: { width: cardLogoSize, height: cardLogoSize },
        cardBrandName: { fontSize: isCompact ? 15 : 16, fontWeight: '700', color: gold },
        title: {
          fontSize: isCompact ? 20 : 21,
          fontWeight: '700',
          color: Colors.gray[900],
          marginBottom: 6,
          textAlign: 'center',
        },
        subtitle: {
          fontSize: isCompact ? 12 : 13,
          color: Colors.gray[600],
          marginBottom: 8,
          lineHeight: 18,
          textAlign: 'center',
        },
        socialBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: Colors.gray[200],
          borderRadius: 12,
          paddingVertical: isCompact ? 12 : 14,
          paddingHorizontal: 14,
          marginBottom: 12,
          backgroundColor: Colors.white,
        },
        socialIconSlot: {
          width: 24,
          height: 24,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
        },
        socialLogo: { width: 20, height: 20 },
        socialLogoFacebook: { width: 22, height: 22 },
        havenLogoSmall: { width: 22, height: 22 },
        socialBtnText: { fontSize: bodyFont, fontWeight: '600', color: Colors.gray[800] },
        socialBtnRightSpacer: { width: 0, height: 0 },
        guestBtn: {
          backgroundColor: gold,
          borderRadius: 12,
          paddingVertical: isCompact ? 13 : 16,
          paddingHorizontal: 20,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 10,
          marginTop: 4,
          marginBottom: 8,
        },
        guestBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
        guestHint: { fontSize: smallFont, color: Colors.gray[500], textAlign: 'center', marginBottom: 8 },
        terms: {
          fontSize: isCompact ? 10 : 11,
          color: Colors.gray[500],
          textAlign: 'center',
          lineHeight: 16,
          marginTop: 0,
          paddingHorizontal: 8,
        },
        termsLink: { color: gold, fontWeight: '600' },
        tabRow: {
          flexDirection: 'row',
          backgroundColor: Colors.gray[100],
          borderRadius: 12,
          padding: 3,
          marginBottom: 16,
        },
        tab: { flex: 1, paddingVertical: isCompact ? 9 : 10, alignItems: 'center', borderRadius: 10 },
        tabActive: { backgroundColor: gold },
        tabText: { fontSize: isCompact ? 13 : 14, fontWeight: '600', color: gold },
        tabTextActive: { color: Colors.white },
        input: {
          borderWidth: 1,
          borderColor: Colors.gray[300],
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === 'ios' ? 12 : 10,
          fontSize: isCompact ? 13 : 14,
          color: Colors.gray[900],
          marginBottom: 12,
        },
        inputShell: {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: Colors.gray[300],
          borderRadius: 12,
          marginBottom: 12,
          paddingRight: 4,
          backgroundColor: Colors.white,
        },
        inputInShell: {
          flex: 1,
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === 'ios' ? 12 : 10,
          fontSize: isCompact ? 13 : 14,
          color: Colors.gray[900],
        },
        inputEyeBtn: {
          paddingHorizontal: 10,
          paddingVertical: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
        primaryBtn: {
          backgroundColor: gold,
          borderRadius: 12,
          paddingVertical: isCompact ? 13 : 14,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
          marginTop: 8,
        },
        primaryBtnText: { color: Colors.white, fontSize: isCompact ? 14 : 15, fontWeight: '700' },
        backToOptions: {
          marginTop: 0,
          marginBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          paddingVertical: 2,
          gap: 4,
        },
        backToOptionsText: { fontSize: isCompact ? 12 : 13, color: Colors.gray[600] },
        errorBox: {
          backgroundColor: Colors.red[100],
          padding: 12,
          borderRadius: 10,
          marginBottom: 12,
        },
        errorText: { color: Colors.red[500], fontSize: 12 },
        footer: { marginTop: isCompact ? 10 : 12 },
        footerBrandRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2, marginBottom: 10 },
        footerBrandLogo: { width: 16, height: 16, marginRight: -1 },
        footerBrand: { fontSize: 16, fontWeight: '700', color: gold, textAlign: 'center' },
        footerTagline: {
          fontSize: 12,
          color: Colors.gray[600],
          textAlign: 'center',
          lineHeight: 18,
          marginBottom: isCompact ? 12 : 16,
          paddingHorizontal: 4,
        },
        footerColumns: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 16,
        },
        footerColLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingRight: 6 },
        footerColRight: { flex: 1, gap: 12, paddingLeft: 14, alignItems: 'flex-start', alignSelf: 'center' },
        footerContactIconBox: { width: 18, alignItems: 'center' },
        footerContactText: {
          flex: 1,
          fontSize: 11,
          lineHeight: 16,
          color: gold,
          fontWeight: '500',
        },
        footerContactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 8, width: '100%' },
        footerPhoneEmail: {
          fontSize: 11,
          lineHeight: 16,
          color: gold,
          fontWeight: '500',
          flex: 1,
        },
        footerLink: {
          textDecorationLine: 'underline',
          textDecorationColor: Colors.gray[500],
        },
      }),
    [
      bodyFont,
      cardLogoSize,
      cardPadding,
      cardSideMargin,
      gold,
      headerLogoSize,
      headerPanelHeight,
      insets.bottom,
      isCompact,
      smallFont,
    ]
  );

  const googleOAuthConfigured = useMemo(() => getGoogleClientConfig().configured, []);
  const facebookAppId = useMemo(() => getFacebookAppId(), []);
  const welcomeSocialStyles = useMemo(
    () => ({
      socialBtn: styles.socialBtn,
      socialIconSlot: styles.socialIconSlot,
      socialLogo: styles.socialLogo,
      socialLogoFacebook: styles.socialLogoFacebook,
      socialBtnText: styles.socialBtnText,
      socialBtnRightSpacer: styles.socialBtnRightSpacer,
    }),
    [styles]
  );

  const openLoginRegister = () => {
    clearError();
    setPhase('auth');
    setAuthTab('login');
  };

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    const result = await login({ email: email.trim(), password });
    if (!result.success) {
      Alert.alert('Login failed', result.error ?? 'Please try again.');
    }
  };

  const onRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords', 'Password and confirmation do not match.');
      return;
    }
    const result = await register({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    });
    if (!result.success) {
      Alert.alert('Registration failed', result.error ?? 'Please try again.');
    }
  };

  const termsBlock = (
    <>
      <View style={styles.termsSeparator} />
      <Text style={styles.terms}>
        By continuing, you agree to our{' '}
        <Text style={styles.termsLink}>Terms</Text>
        {' '}and{' '}
        <Text style={styles.termsLink}>Privacy policy</Text>
      </Text>
    </>
  );

  const headerBlock = (
    <View style={styles.headerPanel}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image source={require('../../assets/haven_logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandName}>taycation Haven</Text>
        </View>
      </View>
    </View>
  );

  const footerBlock = (
    <View style={styles.footerContainer}>
      <View pointerEvents="none" style={styles.footerTopShadow} />
      <View style={styles.footer}>
      <View style={styles.footerBrandRow}>
        <Image source={require('../../assets/haven_logo.png')} style={styles.footerBrandLogo} resizeMode="contain" />
        <Text style={styles.footerBrand}>taycation Haven</Text>
      </View>
      <Text style={styles.footerTagline}>{FOOTER_TAGLINE}</Text>
      <View style={styles.footerColumns}>
        <View style={styles.footerColLeft}>
          <Feather name="map-pin" size={16} color={gold} style={{ marginTop: 2 }} />
          <Text style={styles.footerContactText}>{FOOTER_ADDRESS}</Text>
        </View>
        <View style={styles.footerColRight}>
          <View style={styles.footerContactRow}>
            <View style={styles.footerContactIconBox}>
              <Feather name="phone" size={16} color={gold} />
            </View>
            <Text
              style={[styles.footerPhoneEmail, styles.footerLink]}
              accessibilityRole="link"
              onPress={onPressPhone}
            >
              {FOOTER_PHONE}
            </Text>
          </View>
          <View style={styles.footerContactRow}>
            <View style={styles.footerContactIconBox}>
              <Feather name="mail" size={16} color={gold} />
            </View>
            <Text
              style={[styles.footerPhoneEmail, styles.footerLink]}
              accessibilityRole="link"
              onPress={onPressEmail}
            >
              {FOOTER_EMAIL}
            </Text>
          </View>
        </View>
      </View>
      </View>
    </View>
  );

  const cardBrand = (
    <View style={styles.cardBrandRow}>
      <Image source={require('../../assets/haven_logo.png')} style={styles.cardLogo} resizeMode="contain" />
      <Text style={styles.cardBrandName}>taycation Haven</Text>
    </View>
  );

  const welcomeScrollContent = (
    <>
      {cardBrand}
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Sign In to continue your Booking.</Text>

      <DividerLabel label="Or continue with" />

      {googleOAuthConfigured ? (
        <WelcomeGoogleButton styles={welcomeSocialStyles} />
      ) : (
        <TouchableOpacity style={styles.socialBtn} onPress={oauthConfigAlert} activeOpacity={0.85}>
          <View style={styles.socialIconSlot}>
            <Image source={require('../../assets/gmail.png')} style={styles.socialLogo} resizeMode="contain" />
          </View>
          <Text style={styles.socialBtnText}>Continue with Google</Text>
          <View style={styles.socialBtnRightSpacer} />
        </TouchableOpacity>
      )}
      {facebookAppId ? (
        <WelcomeFacebookButton appId={facebookAppId} styles={welcomeSocialStyles} />
      ) : (
        <TouchableOpacity style={styles.socialBtn} onPress={oauthConfigAlert} activeOpacity={0.85}>
          <View style={styles.socialIconSlot}>
            <Image source={require('../../assets/facebook.png')} style={styles.socialLogoFacebook} resizeMode="contain" />
          </View>
          <Text style={styles.socialBtnText}>Continue with Facebook</Text>
          <View style={styles.socialBtnRightSpacer} />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.socialBtn} onPress={openLoginRegister} activeOpacity={0.85}>
        <View style={styles.socialIconSlot}>
          <Image source={require('../../assets/haven_logo.png')} style={styles.havenLogoSmall} resizeMode="contain" />
        </View>
        <Text style={styles.socialBtnText}>Continue with Haven</Text>
        <View style={styles.socialBtnRightSpacer} />
      </TouchableOpacity>

      <DividerLabel label="Or continue as Guest" />

      <TouchableOpacity style={styles.guestBtn} onPress={continueAsGuest} activeOpacity={0.9}>
        <Text style={styles.guestBtnText}>Continue as Guest</Text>
        <Feather name="arrow-right" size={18} color={Colors.white} />
      </TouchableOpacity>
      <Text style={styles.guestHint}>Guest users can book rooms with smart defaults.</Text>
    </>
  );

  const authScrollContent = (
    <>
      {cardBrand}
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Sign In to continue your Booking.</Text>

      <TouchableOpacity
        style={styles.backToOptions}
        onPress={() => {
          setPhase('welcome');
          clearError();
        }}
        activeOpacity={0.7}
      >
        <Feather name="chevron-left" size={18} color={Colors.gray[600]} />
        <Text style={styles.backToOptionsText}>Back to all options</Text>
      </TouchableOpacity>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, authTab === 'login' && styles.tabActive]}
          onPress={() => {
            setAuthTab('login');
            clearError();
          }}
        >
          <Text style={[styles.tabText, authTab === 'login' && styles.tabTextActive]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, authTab === 'register' && styles.tabActive]}
          onPress={() => {
            setAuthTab('register');
            clearError();
          }}
        >
          <Text style={[styles.tabText, authTab === 'register' && styles.tabTextActive]}>Register</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {authTab === 'register' ? (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={Colors.gray[400]}
          value={fullName}
          onChangeText={(t) => {
            setFullName(t);
            if (error) clearError();
          }}
        />
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor={Colors.gray[400]}
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (error) clearError();
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
      />

      <View style={styles.inputShell}>
        <TextInput
          style={styles.inputInShell}
          placeholder="Password"
          placeholderTextColor={Colors.gray[400]}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (error) clearError();
          }}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.inputEyeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
        >
          <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color={Colors.gray[500]} />
        </TouchableOpacity>
      </View>

      {authTab === 'register' ? (
        <View style={styles.inputShell}>
          <TextInput
            style={styles.inputInShell}
            placeholder="Confirm Password"
            placeholderTextColor={Colors.gray[400]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.inputEyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color={Colors.gray[500]} />
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={authTab === 'login' ? onLogin : onRegister}
        disabled={isLoading}
        activeOpacity={0.9}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <>
            <Text style={styles.primaryBtnText}>{authTab === 'login' ? 'Log In' : 'Sign In'}</Text>
            <Feather name="arrow-right" size={18} color={Colors.white} />
          </>
        )}
      </TouchableOpacity>
    </>
  );

  const authCardStickyFooter = (
    <View style={styles.cardStickyFooter}>
      {termsBlock}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.page}>
        <View style={styles.formBackdrop} pointerEvents="none" />
        {headerBlock}
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{ flex: 1, minHeight: 0 }}>
            <View style={styles.middlePanel}>
              <View style={styles.card}>
                {phase === 'welcome' ? (
                  <>
                    <View style={styles.cardInnerScroll}>
                      <View style={styles.cardInnerScrollContent}>{welcomeScrollContent}</View>
                    </View>
                    <View style={styles.cardStickyFooter}>{termsBlock}</View>
                  </>
                ) : (
                  <>
                    <View style={styles.cardInnerScroll}>
                      <View style={styles.cardInnerScrollContent}>{authScrollContent}</View>
                    </View>
                    {authCardStickyFooter}
                  </>
                )}
              </View>
            </View>
            {footerBlock}
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
