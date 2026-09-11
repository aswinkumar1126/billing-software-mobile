import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { StockStatus, StockStatusRow } from "@/api/types/stock";
import { EmptyState } from "@/components/EmptyState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusPill } from "@/components/StatusPill";
import { SummaryBar } from "@/components/SummaryBar";
import { formatCurrency } from "@/features/billing/format";
import { useStockStatus } from "@/features/inventory/hooks/useStockStatus";
import { colors, radii, shadow, spacing, stockStatusColors } from "@/theme/colors";

const FILTERS: { value: StockStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "AVAILABLE", label: "Available" },
  { value: "LOW_STOCK", label: "Low stock" },
  { value: "OUT_OF_STOCK", label: "Out of stock" },
];

function statusLabel(status: StockStatus): string {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "LOW_STOCK":
      return "Low stock";
    case "OUT_OF_STOCK":
      return "Out of stock";
  }
}

export default function StockStatusScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useStockStatus();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockStatus | "ALL">("ALL");

  const rows = data ?? [];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter !== "ALL" && row.status !== filter) return false;
      if (query) {
        const haystack = `${row.productName} ${row.variantName}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [rows, search, filter]);

  const counts = useMemo(() => {
    const available = rows.filter((r) => r.status === "AVAILABLE").length;
    const low = rows.filter((r) => r.status === "LOW_STOCK").length;
    const out = rows.filter((r) => r.status === "OUT_OF_STOCK").length;
    return { available, low, out };
  }, [rows]);

  return (
    <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
      <ScreenHeader title="Stock Status" subtitle="Live variant stock levels" accent={colors.sectionStockStatus} />

      <SummaryBar
        stats={[
          { label: "Available", value: String(counts.available), color: colors.success },
          { label: "Low stock", value: String(counts.low), color: colors.warning },
          { label: "Out of stock", value: String(counts.out), color: colors.danger },
        ]}
      />

      <View style={styles.filterRow}>
        <TextInput
          style={styles.search}
          placeholder="Search product or variant..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={(item) => item.value}
        style={styles.chipList}
        contentContainerStyle={styles.chipListContent}
        renderItem={({ item }) => {
          const selected = item.value === filter;
          return (
            <Pressable
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => setFilter(item.value)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item.label}</Text>
            </Pressable>
          );
        }}
      />

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.sectionStockStatus} />
        </View>
      ) : isError ? (
        <View style={styles.centerFill}>
          <EmptyState emoji="⚠️" title="Couldn't load stock status" subtitle="Check your connection and try again." />
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.variantId)}
          contentContainerStyle={styles.listContent}
          refreshing={isFetching}
          onRefresh={refetch}
          renderItem={({ item }) => <StockRow row={item} />}
          ListEmptyComponent={<EmptyState emoji="📦" title="No matching items" />}
        />
      )}
    </SafeAreaView>
  );
}

function StockRow({ row }: { row: StockStatusRow }) {
  const pill = stockStatusColors(row.status);
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.productName}>{row.productName}</Text>
        <Text style={styles.variantName}>{row.variantName}</Text>
        <View style={styles.rowMeta}>
          <Text style={styles.metaText}>
            {row.currentStock} {row.unit} in stock
          </Text>
          {row.minStockLevel !== null && (
            <Text style={styles.metaText}> · min {row.minStockLevel} {row.unit}</Text>
          )}
        </View>
        {row.averageCost !== null && (
          <Text style={styles.avgCost}>Avg cost {formatCurrency(row.averageCost)}</Text>
        )}
      </View>
      <StatusPill label={statusLabel(row.status)} bg={pill.bg} fg={pill.fg} dot={pill.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  filterRow: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  search: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipList: { flexGrow: 0, marginTop: spacing.sm, marginBottom: spacing.sm },
  chipListContent: { paddingHorizontal: spacing.lg, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.sectionStockStatus, borderColor: colors.sectionStockStatus },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  productName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  variantName: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  rowMeta: { flexDirection: "row", marginTop: 4 },
  metaText: { fontSize: 12, color: colors.textSecondary },
  avgCost: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.sectionStockStatus,
    borderRadius: radii.md,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
