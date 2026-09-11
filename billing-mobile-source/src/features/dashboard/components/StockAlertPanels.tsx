import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { StockStatusRow } from "@/api/types/stock";
import { EmptyState } from "@/components/EmptyState";
import { colors, fontSize, fontWeight, radii, shadow, spacing } from "@/theme/colors";

/** Worst-first low-stock insight panel — shows currentStock / minStockLevel unit. */
export function LowStockPanel({ rows }: { rows: StockStatusRow[] }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Low Stock</Text>
        {rows.length > 0 && (
          <View style={[styles.countPill, { backgroundColor: colors.warningLight }]}>
            <Text style={[styles.countText, { color: colors.warningDark }]}>{rows.length}</Text>
          </View>
        )}
      </View>

      {rows.length === 0 ? (
        <EmptyState emoji="✅" title="No low-stock items" />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {rows.slice(0, 6).map((row) => (
            <View key={row.variantId} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {row.variantName}
                </Text>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  {row.productName}
                </Text>
              </View>
              <Text style={styles.stockText}>
                {row.currentStock} / {row.minStockLevel ?? "—"} {row.unit}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** Out-of-stock insight panel — item + product name. */
export function OutOfStockPanel({ rows }: { rows: StockStatusRow[] }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Out of Stock</Text>
        {rows.length > 0 && (
          <View style={[styles.countPill, { backgroundColor: colors.dangerLight }]}>
            <Text style={[styles.countText, { color: colors.dangerDark }]}>{rows.length}</Text>
          </View>
        )}
      </View>

      {rows.length === 0 ? (
        <EmptyState emoji="✅" title="Nothing out of stock" />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {rows.slice(0, 6).map((row) => (
            <View key={row.variantId} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {row.variantName}
                </Text>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  {row.productName}
                </Text>
              </View>
              <View style={styles.dangerDot} />
            </View>
          ))}
        </View>
      )}
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
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  title: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  countPill: { borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3 },
  countText: { fontSize: fontSize.sm, fontWeight: fontWeight.extrabold },
  row: { flexDirection: "row", alignItems: "center" },
  itemName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  itemMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  stockText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.warningDark },
  dangerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
});
