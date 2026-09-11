import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, fontSize, fontWeight, radii, shadow, spacing } from "@/theme/colors";

interface Props {
  availableCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}

/** 3-way Available/Low/Out breakdown as a stacked bar + count tiles. Zero dependencies. */
export function StockStatusChart({ availableCount, lowStockCount, outOfStockCount }: Props) {
  const rawTotal = availableCount + lowStockCount + outOfStockCount;
  const total = Math.max(rawTotal, 1);
  const segments = [
    { label: "Available", count: availableCount, color: colors.success },
    { label: "Low stock", count: lowStockCount, color: colors.warning },
    { label: "Out of stock", count: outOfStockCount, color: colors.danger },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Stock Status</Text>

      <View style={styles.stackedBar}>
        {rawTotal === 0 ? (
          <View style={[styles.segment, { flex: 1, backgroundColor: colors.border }]} />
        ) : (
          segments.map((seg) =>
            seg.count > 0 ? (
              <View
                key={seg.label}
                style={[styles.segment, { flex: seg.count / total, backgroundColor: seg.color }]}
              />
            ) : null
          )
        )}
      </View>

      <View style={styles.legendRow}>
        {segments.map((seg) => (
          <View key={seg.label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: seg.color }]} />
            <Text style={styles.legendLabel}>{seg.label}</Text>
            <Text style={[styles.legendValue, { color: seg.color }]}>{seg.count}</Text>
          </View>
        ))}
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
  title: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.md },
  stackedBar: {
    flexDirection: "row",
    height: 14,
    borderRadius: radii.pill,
    overflow: "hidden",
    backgroundColor: colors.border,
  },
  segment: { height: "100%" },
  legendRow: { marginTop: spacing.md, gap: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { flex: 1, fontSize: fontSize.base, color: colors.textSecondary, fontWeight: fontWeight.medium },
  legendValue: { fontSize: fontSize.base, fontWeight: fontWeight.extrabold },
});
