import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { formatCurrency } from "@/features/billing/format";
import { PurchaseCreateForm } from "@/features/inventory/components/PurchaseCreateForm";
import { usePurchaseList } from "@/features/inventory/hooks/usePurchases";
import { colors, radii, shadow, spacing } from "@/theme/colors";
import { formatDateDisplay } from "@/utils/date";
import type { Purchase } from "@/api/types";

export default function PurchaseScreen() {
  const { data, isLoading, isError, refetch, isFetching } = usePurchaseList();
  const [formVisible, setFormVisible] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const rows = data ?? [];

  return (
    <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
      <ScreenHeader title="Purchase" subtitle="Supplier purchases & invoices" accent={colors.sectionPurchase} />

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.sectionPurchase} />
        </View>
      ) : isError ? (
        <View style={styles.centerFill}>
          <EmptyState emoji="⚠️" title="Couldn't load purchases" />
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshing={isFetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <PurchaseRow
              purchase={item}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
            />
          )}
          ListEmptyComponent={<EmptyState emoji="🛒" title="No purchases recorded yet" />}
        />
      )}

      <FloatingAddButton accent={colors.sectionPurchase} onPress={() => setFormVisible(true)} />

      <PurchaseCreateForm visible={formVisible} onClose={() => setFormVisible(false)} />
    </SafeAreaView>
  );
}

function PurchaseRow({
  purchase,
  expanded,
  onToggle,
}: {
  purchase: Purchase;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onToggle}>
      <View style={styles.rowHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.invoiceNo}>{purchase.invoiceNo}</Text>
          <Text style={styles.supplierName}>{purchase.supplierName}</Text>
          <Text style={styles.dateText}>{formatDateDisplay(purchase.purchaseDate)}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.totalText}>{formatCurrency(purchase.total)}</Text>
          <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.itemsWrap}>
          {purchase.items.map((item) => (
            <View key={item.purchaseItemId} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.variantName}</Text>
                <Text style={styles.itemMeta}>
                  {item.qty} {item.unit} × {formatCurrency(item.purchasePrice)}
                  {item.discount > 0 ? ` − ${formatCurrency(item.discount)}` : ""}
                  {item.tax > 0 ? ` + ${formatCurrency(item.tax)} tax` : ""}
                </Text>
              </View>
              <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Sub total</Text>
            <Text style={styles.totalsValue}>{formatCurrency(purchase.subTotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Discount</Text>
            <Text style={styles.totalsValue}>− {formatCurrency(purchase.discount)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax</Text>
            <Text style={styles.totalsValue}>+ {formatCurrency(purchase.tax)}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  rowHeader: { flexDirection: "row", alignItems: "flex-start" },
  invoiceNo: { fontSize: 14, fontWeight: "800", color: colors.textPrimary },
  supplierName: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  dateText: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  totalText: { fontSize: 15, fontWeight: "800", color: colors.sectionPurchase },
  chevron: { fontSize: 10, color: colors.textMuted, marginTop: 6 },
  itemsWrap: { marginTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.sm },
  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  itemName: { fontSize: 13, fontWeight: "600", color: colors.textPrimary },
  itemMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  itemAmount: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalsLabel: { fontSize: 12, color: colors.textSecondary },
  totalsValue: { fontSize: 12, fontWeight: "600", color: colors.textPrimary },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.sectionPurchase,
    borderRadius: radii.md,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
