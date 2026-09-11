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
    key: "stock-status",
    label: "Stock Status",
    subtitle: "Live stock levels for every variant",
    emoji: "📊",
    permission: "STOCK_VIEW",
    accent: colors.sectionStockStatus,
    accentLight: colors.sectionStockStatusLight,
    href: "/inventory/stock-status" as const,
  },
  {
    key: "opening-stock",
    label: "Opening Stock",
    subtitle: "Record starting stock quantities",
    emoji: "📥",
    permission: "OPENING_STOCK_VIEW",
    accent: colors.sectionOpeningStock,
    accentLight: colors.sectionOpeningStockLight,
    href: "/inventory/opening-stock" as const,
  },
  {
    key: "purchase",
    label: "Purchase",
    subtitle: "Log supplier purchases & invoices",
    emoji: "🛒",
    permission: "PURCHASE_VIEW",
    accent: colors.sectionPurchase,
    accentLight: colors.sectionPurchaseLight,
    href: "/inventory/purchase" as const,
  },
  {
    key: "stock-adjustment",
    label: "Stock Adjustment",
    subtitle: "Damage, loss & correction entries",
    emoji: "🛠️",
    permission: "STOCK_ADJUSTMENT_VIEW",
    accent: colors.sectionStockAdjustment,
    accentLight: colors.sectionStockAdjustmentLight,
    href: "/inventory/stock-adjustment" as const,
  },
];

export default function InventoryHubScreen() {
  const { hasPermission } = useAuth();
  const router = useRouter();
  const visible = SECTIONS.filter((s) => hasPermission(s.permission));

  return (
    <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroWrap}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>📦</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Inventory</Text>
            <Text style={styles.subtitle}>Manage stock, purchases & adjustments</Text>
          </View>
        </View>

        {visible.length === 0 ? (
          <EmptyState emoji="🔒" title="Nothing available" subtitle="Your account has no inventory permissions yet." />
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
    backgroundColor: colors.sectionPurchaseLight,
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmoji: { fontSize: 26 },
  title: { fontSize: fontSize.display, fontWeight: fontWeight.extrabold, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: 2 },
});
