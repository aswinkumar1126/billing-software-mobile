import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { StockReportRow } from "@/api/types";
import { EmptyState } from "@/components/EmptyState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SelectField, type SelectOption } from "@/components/SelectField";
import { SummaryBar } from "@/components/SummaryBar";
import { DateModeFilter } from "@/features/reports/components/DateModeFilter";
import { useProductVariants } from "@/features/reports/hooks/usePurchaseReport";
import { useStockReport, type StockReportFilters } from "@/features/reports/hooks/useStockReport";
import { colors, radii, shadow, spacing } from "@/theme/colors";

export default function StockReportScreen() {
  const [filters, setFilters] = useState<StockReportFilters>({
    dateMode: "range",
    fromDate: null,
    toDate: null,
    asOnDate: null,
    variantId: null,
  });

  const { data: variants } = useProductVariants();
  const { data, isLoading, isError, refetch, isFetching } = useStockReport(filters);
  const rows = data ?? [];

  const variantOptions: SelectOption[] = useMemo(
    () => (variants ?? []).map((v) => ({ id: v.variantId, label: v.variantName, sublabel: v.product.productName ?? undefined })),
    [variants]
  );
  const selectedVariant = variantOptions.find((o) => o.id === filters.variantId) ?? null;

  const summary = useMemo(() => {
    const variantCount = rows.length;
    const totalUnits = rows.reduce((sum, r) => sum + r.closingQty, 0);
    const negativeCount = rows.filter((r) => r.closingQty < 0).length;
    return { variantCount, totalUnits, negativeCount };
  }, [rows]);

  return (
    <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
      <ScreenHeader title="Stock Report" subtitle="Opening → closing stock movement" accent={colors.sectionStockReport} />

      <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={styles.filterCard}>
        <Text style={styles.hintText}>
          This report is point-in-time — the "To" / "As on" date is used as the as-of boundary.
        </Text>
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
          { label: "Variants", value: String(summary.variantCount) },
          { label: "Total units", value: String(summary.totalUnits), color: colors.sectionStockReport },
          {
            label: "Negative rows",
            value: String(summary.negativeCount),
            color: summary.negativeCount > 0 ? colors.danger : undefined,
          },
        ]}
      />

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.sectionStockReport} />
        </View>
      ) : isError ? (
        <View style={styles.centerFill}>
          <EmptyState emoji="⚠️" title="Couldn't load stock report" />
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.variantId)}
          contentContainerStyle={styles.listContent}
          refreshing={isFetching}
          onRefresh={refetch}
          renderItem={({ item }) => <StockReportRowView row={item} />}
          ListEmptyComponent={<EmptyState emoji="📈" title="No stock movement for these filters" />}
        />
      )}
    </SafeAreaView>
  );
}

function StockReportRowView({ row }: { row: StockReportRow }) {
  const negative = row.closingQty < 0;
  return (
    <View style={[styles.row, negative && styles.rowNegative]}>
      <View style={styles.rowTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{row.productName}</Text>
          <Text style={styles.variantName}>{row.variantName}</Text>
        </View>
        <Text style={[styles.closingQty, negative && styles.closingQtyNegative]}>
          {row.closingQty} {row.unit}
        </Text>
      </View>
      <View style={styles.breakdownRow}>
        <Breakdown label="Opening" value={row.openingQty} />
        <Breakdown label="Purchased" value={row.purchasedQty} color={colors.success} />
        <Breakdown label="Sold" value={row.soldQty} color={colors.danger} />
        <Breakdown label="Adjusted" value={row.adjustedQty} />
      </View>
      {negative && <Text style={styles.warningText}>⚠ Negative closing stock — data needs review</Text>}
    </View>
  );
}

function Breakdown({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <View style={styles.breakdownCol}>
      <Text style={[styles.breakdownValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.breakdownLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  filterCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  hintText: { fontSize: 11, color: colors.textMuted, fontStyle: "italic" },
  clearText: { fontSize: 11, color: colors.sectionStockReport, fontWeight: "600" },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  rowNegative: { borderWidth: 1.5, borderColor: colors.danger },
  rowTop: { flexDirection: "row", alignItems: "center" },
  productName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  variantName: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  closingQty: { fontSize: 15, fontWeight: "800", color: colors.sectionStockReport },
  closingQtyNegative: { color: colors.danger },
  breakdownRow: {
    flexDirection: "row",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  breakdownCol: { flex: 1, alignItems: "center" },
  breakdownValue: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  breakdownLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  warningText: { fontSize: 11, color: colors.danger, fontWeight: "600", marginTop: spacing.sm },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.sectionStockReport,
    borderRadius: radii.md,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
