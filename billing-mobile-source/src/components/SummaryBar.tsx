import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, fontSize, fontWeight, radii, shadow, spacing } from "@/theme/colors";

export interface SummaryStat {
  label: string;
  value: string;
  color?: string;
}

/** Row of summary stat tiles shown above report/list screens. */
export function SummaryBar({ stats }: { stats: SummaryStat[] }) {
  return (
    <View style={styles.row}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.tile}>
          <Text style={[styles.value, stat.color ? { color: stat.color } : null]}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  value: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.textPrimary },
  label: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, textAlign: "center" },
});
