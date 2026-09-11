import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { SaleResponse } from "@/api/types/sale";
import { formatCurrency } from "@/features/billing/format";
import { colors, fontSize, fontWeight, radii, spacing } from "@/theme/colors";
import { formatDateDisplay } from "@/utils/date";

/** Compact bill-detail sheet reused by the Dashboard's recent transactions list. */
export function SaleDetailModal({ sale, onClose }: { sale: SaleResponse | null; onClose: () => void }) {
  return (
    <Modal visible={sale !== null} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{sale?.billNo}</Text>
            {sale && <Text style={styles.subtitle}>{formatDateDisplay(sale.billDate)}</Text>}
          </View>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
        {sale && (
          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={styles.body}>
            {sale.items.map((item) => (
              <View key={item.saleItemId} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.variantName}</Text>
                  <Text style={styles.itemMeta}>
                    {item.qty} × {formatCurrency(item.unitPrice)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
            <View style={styles.totalsBox}>
              <TotalsRow label="Sub total" value={formatCurrency(sale.subTotal)} />
              <TotalsRow label="Discount" value={`− ${formatCurrency(sale.discount)}`} />
              <TotalsRow label="Tax" value={`+ ${formatCurrency(sale.tax)}`} />
              <View style={styles.divider} />
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
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingBottom: 28,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  close: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.semibold },
  body: { paddingHorizontal: 20, paddingTop: 8, gap: 4 },
  itemRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 6 },
  itemName: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
  itemMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  itemTotal: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
  totalsBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 14,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalsLabel: { fontSize: fontSize.base, color: colors.textSecondary },
  totalsLabelBold: { fontSize: fontSize.lg, color: colors.textPrimary, fontWeight: fontWeight.bold },
  totalsValue: { fontSize: fontSize.base, color: colors.textPrimary, fontWeight: fontWeight.semibold },
  totalsValueBold: { fontSize: fontSize.xl, color: colors.primary, fontWeight: fontWeight.extrabold },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong, marginVertical: 6 },
});
