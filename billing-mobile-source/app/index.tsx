import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/auth/AuthContext";
import { colors } from "@/theme/colors";

/**
 * Entry route: while the session-restore check is running, show a spinner;
 * once resolved, redirect to the tabs (if authenticated) or to login.
 */
export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={user ? "/(tabs)" : "/login"} />;
}
