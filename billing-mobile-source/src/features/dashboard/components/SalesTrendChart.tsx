import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { formatCurrency } from "@/features/billing/format";
import type { DailySalesPoint } from "@/features/dashboard/utils/dashboardAggregates";
import { colors, fontSize, fontWeight, radii, shadow, spacing } from "@/theme/colors";

const CHART_HEIGHT = 120;

/**
 * 7-day sales trend as a hand-rolled bar chart using plain Views with
 * height percentages — zero new dependencies (see task notes: this project
 * already had one dependency-resolution scare, so charts stay dependency-free).
 */
export function SalesTrendChart({ points }: { points: DailySalesPoint[] }) {
  const max = Math.max(...points.map((p) => p.total), 1);
  const totalWeek = points.reduce((sum, p) => sum + p.total, 0);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>7-Day Sales Trend</Text>
        <Text style={styles.totalText}>{formatCurrency(totalWeek)}</Text>
      </View>

      <View style={styles.chartArea}>
        {points.map((point) => {
          const heightPct = point.total > 0 ? Math.max((point.total / max) * 100, 6) : 3;
          return (
            <View key={point.date} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${heightPct}%`,
                      backgroundColor: point.total > 0 ? colors.primary : colors.border,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{point.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  title: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  totalText: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.primary },
  chartArea: { flexDirection: "row", alignItems: "flex-end", height: CHART_HEIGHT, gap: 6 },
  barCol: { flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" },
  barTrack: { flex: 1, width: "100%", justifyContent: "flex-end", alignItems: "center" },
  bar: { width: "70%", borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 10, color: colors.textMuted, marginTop: 6, fontWeight: fontWeight.semibold },
});
