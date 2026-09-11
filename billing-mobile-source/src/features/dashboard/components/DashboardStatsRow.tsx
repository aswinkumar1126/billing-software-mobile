import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { formatCurrency } from "@/features/billing/format";
import type { TodaySummary } from "@/features/dashboard/utils/dashboardAggregates";
import { colors, fontSize, fontWeight, radii, shadow, spacing } from "@/theme/colors";

interface Props {
  today: TodaySummary;
  averageTurnover: number;
  lowStockCount: number;
  outOfStockCount: number;
}

/** 2x2 grid of stat tiles — the mobile-width version of the web dashboard's 4-across row. */
export function DashboardStatsRow({ today, averageTurnover, lowStockCount, outOfStockCount }: Props) {
  const alertAccent =
    outOfStockCount > 0 ? colors.danger : lowStockCount > 0 ? colors.warning : colors.success;
  const alertLight =
    outOfStockCount > 0 ? colors.dangerLight : lowStockCount > 0 ? colors.warningLight : colors.successLight;
  const alertHelper =
    outOfStockCount > 0
      ? `${lowStockCount} low, ${outOfStockCount} out of stock`
      : lowStockCount > 0
        ? `${lowStockCount} running low`
        : "Everything is well stocked";

  return (
    <View style={styles.grid}>
      <StatTile
        label="Today's Sales"
        value={formatCurrency(today.totalSales)}
        helper={`${today.billCount} bill${today.billCount === 1 ? "" : "s"}`}
        accent={colors.primary}
        accentLight={colors.primaryLight}
      />
      <StatTile
        label="Average Bill Value"
        value={formatCurrency(today.averageBillValue)}
        helper="per bill today"
        accent={colors.info}
        accentLight={colors.infoLight}
      />
      <StatTile
        label="Inventory Turnover"
        value={`${averageTurnover.toFixed(2)}x`}
        helper="sold vs on-hand"
        accent={colors.success}
        accentLight={colors.successLight}
      />
      <StatTile
        label="Stock Alerts"
        value={String(lowStockCount + outOfStockCount)}
        helper={alertHelper}
        accent={alertAccent}
        accentLight={alertLight}
      />
    </View>
  );
}

function StatTile({
  label,
  value,
  helper,
  accent,
  accentLight,
}: {
  label: string;
  value: string;
  helper: string;
  accent: string;
  accentLight: string;
}) {
  return (
    <View style={styles.tile}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.tileBody}>
        <Text style={styles.tileLabel}>{label}</Text>
        <Text style={[styles.tileValue, { color: accent }]} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        <View style={[styles.helperPill, { backgroundColor: accentLight }]}>
          <Text style={[styles.helperText, { color: accent }]} numberOfLines={1}>
            {helper}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  tile: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: "hidden",
    flexDirection: "row",
    ...shadow.card,
  },
  accentBar: { width: 4 },
  tileBody: { flex: 1, padding: spacing.md, gap: 6 },
  tileLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  tileValue: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold },
  helperPill: { alignSelf: "flex-start", borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
  helperText: { fontSize: 10, fontWeight: fontWeight.bold },
});
