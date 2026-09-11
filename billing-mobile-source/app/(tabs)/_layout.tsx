import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/auth/AuthContext";
import { BILLING_NAV, INVENTORY_NAV, REPORTS_NAV } from "@/features/nav/appNav";
import { colors, radii } from "@/theme/colors";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
      <Text style={{ fontSize: 18 }}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { user, isLoading, hasPermission, hasAnyPermission } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingFill}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const canSeeBilling = hasPermission(BILLING_NAV.permission);
  const canSeeInventory = hasAnyPermission(INVENTORY_NAV.map((i) => i.permission));
  const canSeeReports = hasAnyPermission(REPORTS_NAV.map((i) => i.permission));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: "Billing",
          href: canSeeBilling ? undefined : null,
          tabBarIcon: ({ focused }) => <TabIcon label="🧾" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          href: canSeeInventory ? undefined : null,
          tabBarIcon: ({ focused }) => <TabIcon label="📦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          href: canSeeReports ? undefined : null,
          tabBarIcon: ({ focused }) => <TabIcon label="📊" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingFill: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 66,
    paddingBottom: 10,
    paddingTop: 8,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 10,
    elevation: 12,
  },
  tabBarLabel: { fontSize: 11, fontWeight: "700", marginTop: 2 },
  iconWrap: {
    width: 40,
    height: 30,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapFocused: { backgroundColor: colors.primaryLight },
});
