import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Purchase } from "@/api/types";
import { EmptyState } from "@/components/EmptyState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SelectField, type SelectOption } from "@/components/SelectField";
import { SummaryBar } from "@/components/SummaryBar";
import { formatCurrency } from "@/features/billing/format";
import { DateModeFilter } from "@/features/reports/components/DateModeFilter";
import {
  usePurchaseReport,
  useProductVariants,
  useSuppliers,
  type PurchaseReportFilters,
} from "@/features/reports/hooks/usePurchaseReport";
import { colors, radii, shadow, spacing } from "@/theme/colors";
import { formatDateDisplay } from "@/utils/date";

export default function PurchaseReportScreen() {
  const [filters, setFilters] = useState<PurchaseReportFilters>({
    dateMode: "range",
    fromDate: null,
    toDate: null,
    asOnDate: null,
    supplierId: null,
    variantId: null,
  });
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: suppliers } = useSuppliers();

  const { data: variants } = useProductVariants();
  const { data, isLoading, isError, refetch, isFetching } = usePurchaseReport(filters);
  const purchases = data ?? [];

  const supplierOptions: SelectOption[] = useMemo(
    () => (suppliers ?? []).map((s) => ({ id: s.supplierId, label: s.name })),
    [suppliers]
  );
  const variantOptions: SelectOption[] = useMemo(
    () => (variants ?? []).map((v) => ({ id: v.variantId, label: v.variantName, sublabel: v.product.productName ?? undefined })),
    [variants]
  );
  const selectedSupplier = supplierOptions.find((o) => o.id === filters.supplierId) ?? null;
  const selectedVariant = variantOptions.find((o) => o.id === filters.variantId) ?? null;

  const summary = useMemo(() => {
    const count = purchases.length;
    const total = purchases.reduce((sum, p) => sum + p.total, 0);
    const totalQty = purchases.reduce(
      (sum, p) => sum + p.items.reduce((s, i) => s + i.qty, 0),
      0
    );
    return { count, total, totalQty };
  }, [purchases]);

  return (
    <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
      <ScreenHeader title="Purchase Report" subtitle="Supplier purchases over time" accent={colors.sectionPurchaseReport} />

      <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={styles.filterCard}>
        <DateModeFilter
          dateMode={filters.dateMode}
          onDateModeChange={(dateMode) => setFilters((f) => ({ ...f, dateMode }))}
          fromDate={filters.fromDate}
          onFromDateChange={(fromDate) => setFilters((f) => ({ ...f, fromDate }))}
          toDate={filters.toDate}
          onToDateChange={(toDate) => setFilters((f) => ({ ...f, toDate }))}
          asOnDate={filters.asOnDate}
          onAsOnDateChange={(asOnDate) => setFilters((f) => ({ ...f, asOnDate }))}
        />

        <SelectField
          label="Supplier"
          placeholder="All suppliers"
          value={selectedSupplier}
          options={supplierOptions}
          onSelect={(opt) => setFilters((f) => ({ ...f, supplierId: opt.id }))}
        />
        {selectedSupplier && (
          <Pressable onPress={() => setFilters((f) => ({ ...f, supplierId: null }))}>
            <Text style={styles.clearText}>Clear supplier filter</Text>
          </Pressable>
        )}

        <SelectField
          label="Product / Variant"
          placeholder="All products"
          value={selectedVariant}
          options={variantOptions}
          onSelect={(opt) => setFilters((f) => ({ ...f, variantId: opt.id }))}
        />
        {selectedVariant && (
          <Pressable onPress={() => setFilters((f) => ({ ...f, variantId: null }))}>
            <Text style={styles.clearText}>Clear product filter</Text>
          </Pressable>
        )}
      </ScrollView>

      <SummaryBar
        stats={[
          { label: "Purchases", value: String(summary.count) },
          { label: "Total", value: formatCurrency(summary.total), color: colors.sectionPurchaseReport },
          { label: "Total Qty", value: String(summary.totalQty) },
        ]}
      />

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.sectionPurchaseReport} />
        </View>
      ) : isError ? (
        <View style={styles.centerFill}>
          <EmptyState emoji="⚠️" title="Couldn't load purchase report" />
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={purchases}
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
          ListEmptyComponent={<EmptyState emoji="📦" title="No purchases match these filters" />}
        />
      )}
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
        <Text style={styles.totalText}>{formatCurrency(purchase.total)}</Text>
      </View>
      {expanded && (
        <View style={styles.itemsWrap}>
          {purchase.items.map((item) => (
            <View key={item.purchaseItemId} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.variantName} · {item.qty} {item.unit}
              </Text>
              <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  filterCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  clearText: { fontSize: 11, color: colors.sectionPurchaseReport, fontWeight: "600" },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
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
  totalText: { fontSize: 15, fontWeight: "800", color: colors.sectionPurchaseReport },
  itemsWrap: { marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.sm },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  itemName: { fontSize: 12, color: colors.textPrimary },
  itemAmount: { fontSize: 12, fontWeight: "700", color: colors.textPrimary },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.sectionPurchaseReport,
    borderRadius: radii.md,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
