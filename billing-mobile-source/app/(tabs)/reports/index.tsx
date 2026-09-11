import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/auth/AuthContext";
import { HubCard } from "@/components/HubCard";
import { EmptyState } from "@/components/EmptyState";
import { colors, fontSize, fontWeight, spacing } from "@/theme/colors";

const SECTIONS = [
  {
    key: "sales",
    label: "Sales Report",
    subtitle: "Bills, revenue & payment breakdown",
    emoji: "🧾",
    permission: "SALES_CREATE",
    accent: colors.sectionSalesReport,
    accentLight: colors.sectionSalesReportLight,
    href: "/reports/sales" as const,
  },
  {
    key: "purchase",
    label: "Purchase Report",
    subtitle: "Supplier purchases over time",
    emoji: "📦",
    permission: "PURCHASE_VIEW",
    accent: colors.sectionPurchaseReport,
    accentLight: colors.sectionPurchaseReportLight,
    href: "/reports/purchase" as const,
  },
  {
    key: "stock",
    label: "Stock Report",
    subtitle: "Opening, purchased, sold & closing stock",
    emoji: "📈",
    permission: "STOCK_VIEW",
    accent: colors.sectionStockReport,
    accentLight: colors.sectionStockReportLight,
    href: "/reports/stock" as const,
  },
];

export default function ReportsHubScreen() {
  const { hasPermission } = useAuth();
  const router = useRouter();
  const visible = SECTIONS.filter((s) => hasPermission(s.permission));

  return (
    <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroWrap}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>📊</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Reports</Text>
            <Text style={styles.subtitle}>Sales, purchases & stock at a glance</Text>
          </View>
        </View>

        {visible.length === 0 ? (
          <EmptyState emoji="🔒" title="Nothing available" subtitle="Your account has no report permissions yet." />
        ) : (
          <View style={{ marginTop: spacing.lg }}>
            {visible.map((s) => (
              <HubCard
                key={s.key}
                emoji={s.emoji}
                title={s.label}
                subtitle={s.subtitle}
                accent={s.accent}
                accentLight={s.accentLight}
                onPress={() => router.push(s.href)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  heroWrap: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.sectionSalesReportLight,
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmoji: { fontSize: 26 },
  title: { fontSize: fontSize.display, fontWeight: fontWeight.extrabold, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: 2 },
});
