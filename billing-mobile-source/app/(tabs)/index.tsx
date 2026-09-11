import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { SaleResponse } from "@/api/types/sale";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/auth/AuthContext";
import { DashboardHero } from "@/features/dashboard/components/DashboardHero";
import { DashboardStatsRow } from "@/features/dashboard/components/DashboardStatsRow";
import { LowStockPanel, OutOfStockPanel } from "@/features/dashboard/components/StockAlertPanels";
import { RecentTransactionsList } from "@/features/dashboard/components/RecentTransactionsList";
import { SaleDetailModal } from "@/features/dashboard/components/SaleDetailModal";
import { SalesTrendChart } from "@/features/dashboard/components/SalesTrendChart";
import { StockStatusChart } from "@/features/dashboard/components/StockStatusChart";
import { TopProductsList } from "@/features/dashboard/components/TopProductsList";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { BILLING_NAV, INVENTORY_NAV, REPORTS_NAV } from "@/features/nav/appNav";
import { colors, fontSize, fontWeight, radii, shadow, spacing } from "@/theme/colors";

export default function DashboardScreen() {
  const { user, logout, hasPermission, hasAnyPermission } = useAuth();
  const router = useRouter();

  const canSeeBilling = hasPermission(BILLING_NAV.permission);
  const canSeeInventory = hasAnyPermission(INVENTORY_NAV.map((i) => i.permission));
  const canSeeReports = hasAnyPermission(REPORTS_NAV.map((i) => i.permission));

  // The web dashboard shows zeros/empty states rather than gating itself by
  // permission — we match that simplicity, but skip firing the underlying
  // queries entirely for a user with none of the relevant permissions so we
  // don't hit endpoints they have no reason to call.
  const canSeeDashboardData = canSeeBilling || canSeeInventory || canSeeReports;

  const dashboard = useDashboard({ enabled: canSeeDashboardData });
  const [selectedSale, setSelectedSale] = useState<SaleResponse | null>(null);

  const availableCount = dashboard.stockCount - dashboard.lowStock.length - dashboard.outOfStock.length;

  return (
    <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={dashboard.isFetching} onRefresh={dashboard.refetch} tintColor={colors.primary} />
        }
      >
        <DashboardHero userName={user?.userName} />

        <View style={styles.quickLinkRow}>
          {canSeeBilling && (
            <QuickLink label="Billing" emoji="🧾" accent={colors.primary} onPress={() => router.push("/billing")} />
          )}
          {canSeeInventory && (
            <QuickLink
              label="Inventory"
              emoji="📦"
              accent={colors.sectionPurchase}
              onPress={() => router.push("/inventory")}
            />
          )}
          {canSeeReports && (
            <QuickLink
              label="Reports"
              emoji="📊"
              accent={colors.sectionSalesReport}
              onPress={() => router.push("/reports")}
            />
          )}
          <QuickLink label="Log out" emoji="🚪" accent={colors.danger} onPress={logout} />
        </View>

        {!canSeeDashboardData ? (
          <View style={styles.welcomeCard}>
            <EmptyState
              emoji="👋"
              title={`Welcome, ${user?.userName ?? "there"}`}
              subtitle="Your account doesn't have access to sales, inventory or report data yet. Ask an admin to grant permissions to see the full dashboard."
            />
          </View>
        ) : dashboard.isLoading ? (
          <View style={styles.centerFill}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : dashboard.isError ? (
          <View style={styles.centerFill}>
            <EmptyState emoji="⚠️" title="Couldn't load dashboard data" subtitle="Pull down to try again." />
          </View>
        ) : (
          <View style={styles.sections}>
            <DashboardStatsRow
              today={dashboard.today}
              averageTurnover={dashboard.averageTurnover}
              lowStockCount={dashboard.lowStock.length}
              outOfStockCount={dashboard.outOfStock.length}
            />

            <SalesTrendChart points={dashboard.trend} />

            <StockStatusChart
              availableCount={Math.max(availableCount, 0)}
              lowStockCount={dashboard.lowStock.length}
              outOfStockCount={dashboard.outOfStock.length}
            />

            <TopProductsList products={dashboard.topProducts} />

            <LowStockPanel rows={dashboard.lowStock} />

            <OutOfStockPanel rows={dashboard.outOfStock} />

            <RecentTransactionsList sales={dashboard.recent} onSelect={setSelectedSale} />
          </View>
        )}
      </ScrollView>

      <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
    </SafeAreaView>
  );
}

function QuickLink({
  label,
  emoji,
  accent,
  onPress,
}: {
  label: string;
  emoji: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.quickLink, pressed && styles.quickLinkPressed]} onPress={onPress}>
      <Text style={styles.quickLinkEmoji}>{emoji}</Text>
      <Text style={[styles.quickLinkLabel, { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  centerFill: { paddingVertical: 60, alignItems: "center", justifyContent: "center" },
  welcomeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...shadow.card,
  },
  quickLinkRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  quickLink: {
    flexGrow: 1,
    flexBasis: "23%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: 12,
    ...shadow.card,
  },
  quickLinkPressed: { opacity: 0.8 },
  quickLinkEmoji: { fontSize: fontSize.md },
  quickLinkLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  sections: { gap: spacing.lg },
});
