import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { formatCurrency } from "@/features/billing/format";
import type { ProductDemandRow } from "@/features/dashboard/utils/dashboardAggregates";
import { EmptyState } from "@/components/EmptyState";
import { colors, fontSize, fontWeight, radii, shadow, spacing } from "@/theme/colors";

/** Top 5 products by qty sold — ranked list with numbered badges. */
export function TopProductsList({ products }: { products: ProductDemandRow[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>High Demand Products</Text>

      {products.length === 0 ? (
        <EmptyState emoji="📈" title="No sales yet" subtitle="Top products will show up here once bills come in." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {products.map((product, index) => (
            <View key={product.variantId} style={styles.row}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {product.variantName}
                </Text>
                <Text style={styles.meta}>{product.qtySold} units sold</Text>
              </View>
              <Text style={styles.revenue}>{formatCurrency(product.revenue)}</Text>
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
  title: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.md },
  row: { flexDirection: "row", alignItems: "center" },
  badge: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  badgeText: { fontSize: fontSize.sm, fontWeight: fontWeight.extrabold, color: colors.primary },
  name: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  meta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  revenue: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
});
