import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { SaleResponse } from "@/api/types/sale";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/StatusPill";
import { formatCurrency } from "@/features/billing/format";
import { colors, fontSize, fontWeight, orderTypeColors, radii, shadow, spacing } from "@/theme/colors";
import { formatDateDisplay, formatTime } from "@/utils/date";

interface Props {
  sales: SaleResponse[];
  onSelect?: (sale: SaleResponse) => void;
}

/** Last N sales as a scrollable card list (not a table — no room on mobile width). */
export function RecentTransactionsList({ sales, onSelect }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Recent Transactions</Text>

      {sales.length === 0 ? (
        <EmptyState emoji="🧾" title="No bills yet" subtitle="Recent sales will show up here." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {sales.map((sale) => (
            <TransactionRow key={sale.saleId} sale={sale} onPress={onSelect ? () => onSelect(sale) : undefined} />
          ))}
        </View>
      )}
    </View>
  );
}

function TransactionRow({ sale, onPress }: { sale: SaleResponse; onPress?: () => void }) {
  const badge = orderTypeColors(sale.orderType);
  const billDate = new Date(sale.billDate);
  const hasTime = !Number.isNaN(billDate.getTime());

  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={{ flex: 1 }}>
        <View style={styles.topLine}>
          <Text style={styles.billNo}>{sale.billNo}</Text>
          <StatusPill label={sale.orderType === "IN" ? "Dine-in" : "Takeaway"} bg={badge.bg} fg={badge.fg} />
        </View>
        <Text style={styles.metaText}>
          {formatDateDisplay(sale.billDate)}
          {hasTime ? ` · ${formatTime(billDate)}` : ""} · {sale.paymentType}
        </Text>
        <Text style={styles.salesman}>{sale.salesManName ?? "—"}</Text>
      </View>
      <Text style={styles.total}>{formatCurrency(sale.total)}</Text>
    </Pressable>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  billNo: { fontSize: fontSize.base, fontWeight: fontWeight.extrabold, color: colors.textPrimary },
  metaText: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4 },
  salesman: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  total: { fontSize: fontSize.base, fontWeight: fontWeight.extrabold, color: colors.primary, marginLeft: spacing.sm },
});
