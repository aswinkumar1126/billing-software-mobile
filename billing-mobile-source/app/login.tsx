import { Redirect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/auth/AuthContext";
import { colors, fontSize, fontWeight, radii, shadow, spacing } from "@/theme/colors";

export default function LoginScreen() {
  const { user, isLoading, isLoggingIn, login } = useAuth();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isLoading && user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSubmit = async () => {
    setError(null);
    if (!userName.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }
    try {
      await login(userName.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.fill}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.brandBlobTop} />
          <View style={styles.brandBlobBottom} />

          <View style={styles.logoWrap}>
            <Text style={styles.logoEmoji}>🧾</Text>
          </View>
          <Text style={styles.title}>Billing POS</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={userName}
              onChangeText={setUserName}
              placeholder="Enter your username"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoggingIn}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoggingIn}
              onSubmitEditing={handleSubmit}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={[styles.button, isLoggingIn && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 28, overflow: "hidden" },
  brandBlobTop: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    opacity: 0.7,
  },
  brandBlobBottom: {
    position: "absolute",
    bottom: -100,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    opacity: 0.35,
  },
  logoWrap: {
    alignSelf: "center",
    width: 76,
    height: 76,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    ...shadow.fab,
  },
  logoEmoji: { fontSize: 36 },
  title: { fontSize: fontSize.display + 2, fontWeight: fontWeight.extrabold, color: colors.textPrimary, textAlign: "center" },
  subtitle: { fontSize: fontSize.lg, color: colors.textSecondary, textAlign: "center", marginTop: 6, marginBottom: 36 },
  form: {
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadow.cardLg,
  },
  label: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    minHeight: 50,
  },
  error: { color: colors.danger, fontSize: fontSize.base, marginTop: 14, textAlign: "center" },
  button: {
    marginTop: 28,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    ...shadow.fab,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.textOnPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
});
