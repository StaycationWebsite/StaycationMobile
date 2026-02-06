import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/Styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AuthNavigator';
import GoogleOAuthButton from '../components/GoogleOAuthButton';

export default function MeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  

  const handleHavenLogin = () => {
    Alert.alert('Haven Login', 'Continue with Haven...');
  };

  const handleGuestLogin = () => {
    Alert.alert('Guest Login', 'Continuing as guest...');
  };

  const handleTermsPress = () => {
    Linking.openURL('/terms');
  };

  const handlePrivacyPress = () => {
    Linking.openURL('/privacy');
  };

  return (
    <View style={styles.container}>
      {/* Login Card */}
      <View style={styles.card}>
        {/* Logo Section */}
        <View style={styles.cardLogoContainer}>
          <Image 
            source={require('../../assets/haven_logo.png')} 
            style={styles.cardLogo}
            resizeMode="contain"
          />
          <Text style={styles.cardLogoText}>taycation Haven</Text>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your booking</Text>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Login Options */}
        <View style={styles.socialButtonsContainer}>
          {/* Google Login - Real OAuth Implementation */}
          <GoogleOAuthButton
            onSuccess={(email) => {
              console.log('Google login successful:', email);
              // User will be authenticated automatically
            }}
            onError={(error) => {
              console.error('Google login error:', error);
            }}
          />

          {/* Facebook Login */}
          <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Facebook Login', 'Continue with Facebook...')}>
            <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            <Text style={styles.socialButtonText}>Continue with Facebook</Text>
          </TouchableOpacity>

          {/* Haven Login */}
          <TouchableOpacity style={styles.havenButton} onPress={handleHavenLogin}>
            <Image
              source={require('../../assets/haven_logo.png')}
              style={styles.havenLogoIcon}
              resizeMode="contain"
            />
            <Text style={styles.havenButtonText}>Continue with Haven</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Login Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or continue as guest</Text>
          <View style={styles.divider} />
        </View>

        {/* Guest Login */}
        <View style={styles.guestContainer}>
          <TouchableOpacity 
            style={styles.guestButton} 
            onPress={handleGuestLogin}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
          <Text style={styles.guestNote}>Guest users can book rooms with smart defaults</Text>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink} onPress={handleTermsPress}>
              Terms
            </Text>
            {' '}and{' '}
            <Text style={styles.termsLink} onPress={handlePrivacyPress}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  cardLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  cardLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  cardLogoText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: Colors.brand.primary,
    fontFamily: Fonts.poppins,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Fonts.poppins,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: Fonts.inter,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[200],
  },
  dividerText: {
    fontSize: 12,
    color: Colors.gray[500],
    marginHorizontal: 16,
    fontFamily: Fonts.inter,
  },
  socialButtonsContainer: {
    marginBottom: 24,
  },
  socialButton: {
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
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
    marginLeft: 4,
    fontFamily: Fonts.inter,
  },
  havenButton: {
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
  },
  havenLogoIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  havenButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
    marginLeft: 4,
    fontFamily: Fonts.inter,
  },
  guestContainer: {
    alignItems: 'center',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    width: '100%',
    height: 48,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
    fontFamily: Fonts.inter,
    textAlignVertical: 'center',
  },
  guestNote: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
    marginTop: 8,
    fontFamily: Fonts.inter,
  },
  termsContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  termsText: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
    fontFamily: Fonts.inter,
  },
  termsLink: {
    color: Colors.brand.primary,
    textDecorationLine: 'underline',
  },
});
