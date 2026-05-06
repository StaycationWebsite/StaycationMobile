import React, { useState, useMemo } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/hooks/useTheme';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const { theme } = useTheme();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    try {
      const result = await login({ email: email.trim(), password });
      if (!result.success) {
        Alert.alert("Login Failed", result.error ?? "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unexpected login error");
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        scrollContent: {
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        },
        header: {
          alignItems: "center",
          marginBottom: 32,
        },
        logoRow: {
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        },
        logo: {
          width: 48,
          height: 48,
          marginRight: 12,
        },
        appName: {
          fontSize: 22,
          fontWeight: "700",
          color: theme.colors.primary,
        },
        adminBadgeContainer: {
          backgroundColor: theme.colors.primaryLight,
          paddingHorizontal: 16,
          paddingVertical: 5,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.colors.primary,
        },
        adminBadge: {
          fontSize: 11,
          fontWeight: "700",
          color: theme.colors.primary,
          letterSpacing: 1.2,
        },
        formCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: 20,
          padding: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 4,
        },
        title: {
          fontSize: 26,
          fontWeight: "700",
          color: theme.colors.text,
          marginBottom: 4,
        },
        subtitle: {
          fontSize: 15,
          color: theme.colors.textSecondary,
          marginBottom: 24,
        },
        errorBanner: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.errorBg,
          borderRadius: 10,
          padding: 12,
          marginBottom: 16,
          gap: 8,
        },
        errorText: {
          fontSize: 13,
          color: theme.colors.error,
          flex: 1,
        },
        inputContainer: {
          marginBottom: 18,
        },
        inputLabel: {
          fontSize: 13,
          fontWeight: "600",
          color: theme.colors.text,
          marginBottom: 8,
        },
        inputWrapper: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.surfaceSecondary,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          height: 50,
        },
        inputIcon: {
          marginRight: 10,
        },
        input: {
          flex: 1,
          fontSize: 15,
          color: theme.colors.text,
        },
        showPasswordBtn: {
          padding: 4,
        },
        forgotPassword: {
          alignSelf: "flex-end",
          marginBottom: 24,
        },
        forgotPasswordText: {
          fontSize: 13,
          fontWeight: "600",
          color: theme.colors.primary,
        },
        loginButton: {
          backgroundColor: theme.colors.primary,
          borderRadius: 12,
          height: 52,
          justifyContent: "center",
          alignItems: "center",
        },
        loginButtonDisabled: {
          opacity: 0.6,
        },
        loginButtonText: {
          fontSize: 16,
          fontWeight: "700",
          color: theme.colors.surface,
          letterSpacing: 0.3,
        },
        divider: {
          height: 1,
          backgroundColor: theme.colors.divider,
          marginVertical: 20,
        },
        hintText: {
          fontSize: 11,
          color: theme.colors.textTertiary,
          textAlign: "center",
          lineHeight: 18,
        },
        footerNote: {
          fontSize: 12,
          color: theme.colors.textTertiary,
          textAlign: "center",
          marginTop: 24,
        },
      }),
    [theme.colors]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image
              source={require("../../assets/haven_logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Staycation Haven</Text>
          </View>
          <View style={styles.adminBadgeContainer}>
            <Text style={styles.adminBadge}>MANAGEMENT PORTAL</Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {/* Error Banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color={theme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color={theme.colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="email@staycationhavenph.com"
                placeholderTextColor={theme.colors.textTertiary}
                value={email}
                onChangeText={(t) => { setEmail(t); if (error) clearError(); }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color={theme.colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textTertiary}
                value={password}
                onChangeText={(t) => { setPassword(t); if (error) clearError(); }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showPasswordBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color={theme.colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.surface} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Hint for dev */}
          <Text style={styles.hintText}>
            Admin: admin@staycationhavenph.com / admin123
            {'\n'}
            CSR: csr@staycationhavenph.com / csr123
          </Text>
        </View>

        <Text style={styles.footerNote}>Staycation Haven PH © 2026</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

