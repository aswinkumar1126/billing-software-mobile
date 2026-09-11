import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { SaleResponse } from "@/api/types/sale";
import { EmptyState } from "@/components/EmptyState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusPill } from "@/components/StatusPill";
import { SummaryBar } from "@/components/SummaryBar";
import { formatCurrency } from "@/features/billing/format";
import { DateModeFilter } from "@/features/reports/components/DateModeFilter";
import { useSalesReport, useUsers, type SalesReportFilters } from "@/features/reports/hooks/useSalesReport";
import { orderTypeColors, colors, radii, shadow, spacing } from "@/theme/colors";
import { formatDateDisplay } from "@/utils/date";

const ORDER_TYPE_OPTIONS: { value: "IN" | "OUT" | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "IN", label: "Dine-in" },
  { value: "OUT", label: "Takeaway" },
];

const PAYMENT_TYPE_OPTIONS = [
  {value : null , label:"ALL" },
  {value : "CASH" , label:"Cash" },
  {value : "CARD" , label:"Card" },
  {value : "UPI" , label:"UPI" },
]

export default function SalesReportScreen() {
  const [filters, setFilters] = useState<SalesReportFilters>({
    dateMode: "range",
    fromDate: null,
    toDate: null,
    asOnDate: null,
    salesManId: null,
    paymentType: null,
    orderType: null,
  });
  const [selectedSale, setSelectedSale] = useState<SaleResponse | null>(null);

  // Attempt to load salesmen for the filter — if the endpoint 403s for this
  // role, `users` stays empty and the picker section simply doesn't render.
  const { data: users } = useUsers(true);
  const { data, isLoading, isError, refetch, isFetching } = useSalesReport(filters);
  const sales = data ?? [];

  const summary = useMemo(() => {
    const count = sales.length;
    const revenue = sales.reduce((sum, s) => sum + s.total, 0);
    const avg = count > 0 ? revenue / count : 0;
    return { count, revenue, avg };
  }, [sales]);

  return (
    <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
      <ScreenHeader title="Sales Report" subtitle="Bills & revenue" accent={colors.sectionSalesReport} />

      <View style={styles.filterCard}>
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
        <Text style={styles.filterLabel}>Payment type</Text>

          
          <View style={styles.segmentRow}>

            {PAYMENT_TYPE_OPTIONS.map((opt)=>{
              const selected = opt.value === filters.paymentType;
                return (
                  <Pressable
                    key={opt.label}
                    style={[styles.segment, selected && styles.segmentActive]}
                    onPress={() => setFilters((f) => ({ ...f, paymentType: opt.value }))}
                  >
                    <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{opt.label}</Text>
                  </Pressable>
                );
              }
              )}
          </View>
       

        <Text style={styles.filterLabel}>Order type</Text>
        <View style={styles.segmentRow}>
          {ORDER_TYPE_OPTIONS.map((opt) => {
            const selected = opt.value === filters.orderType;
            return (
              <Pressable
                key={opt.label}
                style={[styles.segment, selected && styles.segmentActive]}
                onPress={() => setFilters((f) => ({ ...f, orderType: opt.value }))}
              >
                <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {users && users.length > 0 && (
          <>
            <Text style={styles.filterLabel}>Salesman</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <Pressable
                style={[styles.segment, filters.salesManId === null && styles.segmentActive]}
                onPress={() => setFilters((f) => ({ ...f, salesManId: null }))}
              >
                <Text style={[styles.segmentText, filters.salesManId === null && styles.segmentTextActive]}>
                  All
                </Text>
              </Pressable>
              {users.map((u) => {
                const selected = filters.salesManId === u.userId;
                return (
                  <Pressable
                    key={u.userId}
                    style={[styles.segment, selected && styles.segmentActive]}
                    onPress={() => setFilters((f) => ({ ...f, salesManId: u.userId }))}
                  >
                    <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{u.userName}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        )}
      </View>

      <SummaryBar
        stats={[
          { label: "Bills", value: String(summary.count) },
          { label: "Revenue", value: formatCurrency(summary.revenue), color: colors.sectionSalesReport },
          { label: "Avg bill", value: formatCurrency(summary.avg) },
        ]}
      />

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.sectionSalesReport} />
        </View>
      ) : isError ? (
        <View style={styles.centerFill}>
          <EmptyState emoji="⚠️" title="Couldn't load sales report" />
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => String(item.saleId)}
          contentContainerStyle={styles.listContent}
          refreshing={isFetching}
          onRefresh={refetch}
          renderItem={({ item }) => <SaleRow sale={item} onPress={() => setSelectedSale(item)} />}
          ListEmptyComponent={<EmptyState emoji="🧾" title="No bills match these filters" />}
        />
      )}

      <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
    </SafeAreaView>
  );
}

function SaleRow({ sale, onPress }: { sale: SaleResponse; onPress: () => void }) {
  const badge = orderTypeColors(sale.orderType);
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.billNo}>{sale.billNo}</Text>
        <Text style={styles.dateText}>{formatDateDisplay(sale.billDate)}</Text>
        <View style={styles.badgeRow}>
          <StatusPill label={sale.orderType === "IN" ? "Dine-in" : "Takeaway"} bg={badge.bg} fg={badge.fg} />
          <Text style={styles.paymentText}>{sale.paymentType}</Text>
        </View>
      </View>
      <Text style={styles.totalText}>{formatCurrency(sale.total)}</Text>
    </Pressable>
  );
}

function SaleDetailModal({ sale, onClose }: { sale: SaleResponse | null; onClose: () => void }) {
  return (
    <Modal visible={sale !== null} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.detailSheet}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>{sale?.billNo}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
        {sale && (
          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={styles.detailBody}>
            {sale.items.map((item) => (
              <View key={item.saleItemId} style={styles.detailItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailItemName}>{item.variantName}</Text>
                  <Text style={styles.detailItemMeta}>
                    {item.qty} × {formatCurrency(item.unitPrice)}
                  </Text>
                  {item.addons.map((addon) => (
                    <Text key={addon.id} style={styles.detailAddon}>
                      + {addon.addonName} ({addon.qty} × {formatCurrency(addon.unitPrice)})
                    </Text>
                  ))}
                </View>
                <Text style={styles.detailItemTotal}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
            {sale.additionalCharges.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Additional charges</Text>
                {sale.additionalCharges.map((c) => (
                  <View key={c.id} style={styles.detailItemRow}>
                    <Text style={styles.detailItemName}>{c.additionalChargeName}</Text>
                    <Text style={styles.detailItemTotal}>{formatCurrency(c.total)}</Text>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.totalsBox}>
              <TotalsRow label="Sub total" value={formatCurrency(sale.subTotal)} />
              <TotalsRow label="Discount" value={`− ${formatCurrency(sale.discount)}`} />
              <TotalsRow label="Tax" value={`+ ${formatCurrency(sale.tax)}`} />
              <View style={styles.totalsDivider} />
              <TotalsRow label="Total" value={formatCurrency(sale.total)} bold />
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

function TotalsRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.totalsRow}>
      <Text style={[styles.totalsLabel, bold && styles.totalsLabelBold]}>{label}</Text>
      <Text style={[styles.totalsValue, bold && styles.totalsValueBold]}>{value}</Text>
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
    marginBottom: spacing.md,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  filterRow: { flexDirection: "row", gap: spacing.sm },
  filterCol: { flex: 1 },
  filterLabel: { fontSize: 12, fontWeight: "600", color: colors.textSecondary, marginTop: 4 },
  filterInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  segmentRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentActive: { backgroundColor: colors.sectionSalesReport, borderColor: colors.sectionSalesReport },
  segmentText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  segmentTextActive: { color: "#fff" },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  billNo: { fontSize: 14, fontWeight: "800", color: colors.textPrimary },
  dateText: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  paymentText: { fontSize: 11, color: colors.textSecondary, fontWeight: "600" },
  totalText: { fontSize: 15, fontWeight: "800", color: colors.sectionSalesReport },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.sectionSalesReport,
    borderRadius: radii.md,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  detailSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingBottom: 28,
    paddingTop: 12,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  detailTitle: { fontSize: 16, fontWeight: "800", color: colors.textPrimary },
  close: { fontSize: 14, color: colors.sectionSalesReport, fontWeight: "600" },
  detailBody: { paddingHorizontal: 20, paddingTop: 8, gap: 4 },
  detailItemRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 6 },
  detailItemName: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  detailItemMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  detailAddon: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  detailItemTotal: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  detailSection: { marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.sm },
  detailSectionTitle: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginBottom: 4 },
  totalsBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 14,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalsLabel: { fontSize: 13, color: colors.textSecondary },
  totalsLabelBold: { fontSize: 15, color: colors.textPrimary, fontWeight: "700" },
  totalsValue: { fontSize: 13, color: colors.textPrimary, fontWeight: "600" },
  totalsValueBold: { fontSize: 16, color: colors.sectionSalesReport, fontWeight: "800" },
  totalsDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong, marginVertical: 6 },
});
