import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ApiError } from "@/api/client";
import type { PurchaseCreateRequest } from "@/api/types";
import { DatePickerField } from "@/components/DatePickerField";
import { SelectField, type SelectOption } from "@/components/SelectField";
import { formatCurrency } from "@/features/billing/format";
import { usePurchaseCart } from "@/features/inventory/hooks/usePurchaseCart";
import { useProductVariants } from "@/features/inventory/hooks/useProductVariants";
import { useCreatePurchase, useSuppliers } from "@/features/inventory/hooks/usePurchases";
import { toDateKey } from "@/features/reports/reportDateFilter";
import { colors, radii, spacing } from "@/theme/colors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function PurchaseCreateForm({ visible, onClose }: Props) {
  const { data: suppliers } = useSuppliers();
  const { data: variants } = useProductVariants();
  const createMutation = useCreatePurchase();
  const cart = usePurchaseCart();

  const [supplier, setSupplier] = useState<SelectOption | null>(null);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [variantPickerOpen, setVariantPickerOpen] = useState(false);

  const supplierOptions: SelectOption[] = useMemo(
    () => (suppliers ?? []).filter((s) => s.active !== false).map((s) => ({ id: s.supplierId, label: s.supplierName })),
    [suppliers]
  );

  const variantOptions: SelectOption[] = useMemo(
    () =>
      (variants ?? [])
        .filter((v) => v.active && !cart.lines.some((l) => l.key === v.variantId))
        .map((v) => ({ id: v.variantId, label: v.variantName, sublabel: v.product.productName ?? undefined })),
    [variants, cart.lines]
  );

  const variantsById = useMemo(() => new Map((variants ?? []).map((v) => [v.variantId, v])), [variants]);

  const reset = () => {
    setSupplier(null);
    setInvoiceNo("");
    setPurchaseDate(new Date());
    setError(null);
    cart.clear();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    if (!supplier) {
      setError("Please select a supplier.");
      return;
    }
    if (!invoiceNo.trim()) {
      setError("Please enter an invoice number.");
      return;
    }
    if (cart.lines.length === 0) {
      setError("Add at least one line item.");
      return;
    }
    for (const line of cart.lines) {
      if (line.qty <= 0) {
        setError(`Enter a valid quantity for ${line.variantName}.`);
        return;
      }
      if (line.purchasePrice < 0) {
        setError(`Enter a valid purchase price for ${line.variantName}.`);
        return;
      }
    }

    const payload: PurchaseCreateRequest = {
      supplierId: supplier.id,
      invoiceNo: invoiceNo.trim(),
      purchaseDate: purchaseDate ? toDateKey(purchaseDate) : toDateKey(new Date()),
      items: cart.lines.map((l) => ({
        variantId: l.variantId,
        qty: l.qty,
        purchasePrice: l.purchasePrice,
        discount: l.discount,
        tax: l.tax,
      })),
    };

    try {
      const purchase = await createMutation.mutateAsync(payload);
      Alert.alert("Purchase saved", `Invoice: ${purchase.invoiceNo}`);
      handleClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save. Please try again.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose} presentationStyle="pageSheet">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Purchase</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Text style={styles.headerClose}>Cancel</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          <SelectField label="Supplier" value={supplier} options={supplierOptions} onSelect={setSupplier} />

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Invoice No</Text>
            <TextInput
              style={styles.input}
              value={invoiceNo}
              onChangeText={setInvoiceNo}
              placeholder="e.g. INV-1023"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.field}>
            <DatePickerField
              label="Purchase Date"
              value={purchaseDate}
              onChange={setPurchaseDate}
              accent={colors.sectionPurchase}
            />
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Items</Text>
            <Pressable onPress={() => setVariantPickerOpen(true)}>
              <Text style={styles.addItemText}>+ Add item</Text>
            </Pressable>
          </View>

          {cart.lines.length === 0 ? (
            <Text style={styles.mutedText}>No items added yet.</Text>
          ) : (
            cart.lines.map((line) => (
              <View key={line.key} style={styles.lineCard}>
                <View style={styles.lineHeaderRow}>
                  <Text style={styles.lineName} numberOfLines={1}>
                    {line.variantName}
                  </Text>
                  <Pressable onPress={() => cart.removeLine(line.key)} hitSlop={8}>
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
                <View style={styles.lineInputRow}>
                  <View style={styles.lineInputCol}>
                    <Text style={styles.miniLabel}>Qty ({line.unit})</Text>
                    <TextInput
                      style={styles.lineInput}
                      keyboardType="decimal-pad"
                      value={line.qty === 0 ? "" : String(line.qty)}
                      onChangeText={(t) => cart.updateLine(line.key, { qty: Number(t) || 0 })}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                  <View style={styles.lineInputCol}>
                    <Text style={styles.miniLabel}>Price</Text>
                    <TextInput
                      style={styles.lineInput}
                      keyboardType="decimal-pad"
                      value={line.purchasePrice === 0 ? "" : String(line.purchasePrice)}
                      onChangeText={(t) => cart.updateLine(line.key, { purchasePrice: Number(t) || 0 })}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>
                <View style={styles.lineInputRow}>
                  <View style={styles.lineInputCol}>
                    <Text style={styles.miniLabel}>Discount</Text>
                    <TextInput
                      style={styles.lineInput}
                      keyboardType="decimal-pad"
                      value={line.discount === 0 ? "" : String(line.discount)}
                      onChangeText={(t) => cart.updateLine(line.key, { discount: Number(t) || 0 })}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                  <View style={styles.lineInputCol}>
                    <Text style={styles.miniLabel}>Tax</Text>
                    <TextInput
                      style={styles.lineInput}
                      keyboardType="decimal-pad"
                      value={line.tax === 0 ? "" : String(line.tax)}
                      onChangeText={(t) => cart.updateLine(line.key, { tax: Number(t) || 0 })}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>
                <Text style={styles.lineAmount}>Amount: {formatCurrency(cart.lineAmount(line))}</Text>
              </View>
            ))
          )}

          <View style={styles.totalsBox}>
            <TotalsRow label="Sub Total" value={formatCurrency(cart.subTotal)} />
            <TotalsRow label="Discount" value={`− ${formatCurrency(cart.totalDiscount)}`} />
            <TotalsRow label="Tax" value={`+ ${formatCurrency(cart.totalTax)}`} />
            <View style={styles.totalsDivider} />
            <TotalsRow label="Total" value={formatCurrency(cart.total)} bold />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.submitBtn, createMutation.isPending && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Save Purchase · {formatCurrency(cart.total)}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={variantPickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setVariantPickerOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVariantPickerOpen(false)} />
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Add item</Text>
            <Pressable onPress={() => setVariantPickerOpen(false)} hitSlop={12}>
              <Text style={styles.headerClose}>Close</Text>
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 360 }}>
            {variantOptions.length === 0 ? (
              <Text style={styles.mutedText}>No more variants available.</Text>
            ) : (
              variantOptions.map((opt) => {
                const variant = variantsById.get(opt.id);
                return (
                  <Pressable
                    key={opt.id}
                    style={styles.pickerRow}
                    onPress={() => {
                      cart.addLine({
                        variantId: opt.id,
                        variantName: opt.label,
                        unit: variant?.unit ?? "",
                      });
                      setVariantPickerOpen(false);
                    }}
                  >
                    <Text style={styles.pickerRowLabel}>{opt.label}</Text>
                    {opt.sublabel ? <Text style={styles.pickerRowSub}>{opt.sublabel}</Text> : null}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </Modal>
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
  flex: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  headerClose: { fontSize: 15, fontWeight: "600", color: colors.sectionPurchase },
  scrollContent: { padding: 16, paddingBottom: 32, gap: spacing.md },
  field: { gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
  addItemText: { fontSize: 13, fontWeight: "700", color: colors.sectionPurchase },
  mutedText: { fontSize: 13, color: colors.textMuted, paddingVertical: 8 },
  lineCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  lineHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lineName: { fontSize: 13, fontWeight: "700", color: colors.textPrimary, flex: 1, marginRight: 8 },
  removeText: { fontSize: 12, color: colors.danger, fontWeight: "600" },
  lineInputRow: { flexDirection: "row", gap: spacing.sm },
  lineInputCol: { flex: 1 },
  miniLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  lineInput: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 13,
    color: colors.textPrimary,
  },
  lineAmount: { fontSize: 12, fontWeight: "700", color: colors.sectionPurchase, textAlign: "right" },
  totalsBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalsLabel: { fontSize: 13, color: colors.textSecondary },
  totalsLabelBold: { fontSize: 15, color: colors.textPrimary, fontWeight: "700" },
  totalsValue: { fontSize: 13, color: colors.textPrimary, fontWeight: "600" },
  totalsValueBold: { fontSize: 16, color: colors.sectionPurchase, fontWeight: "800" },
  totalsDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong, marginVertical: 6 },
  errorText: { color: colors.danger, fontSize: 13, textAlign: "center" },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  submitBtn: {
    backgroundColor: colors.sectionPurchase,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  pickerSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingBottom: 24,
    paddingTop: 12,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  pickerTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  pickerRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  pickerRowLabel: { fontSize: 14, color: colors.textPrimary, fontWeight: "600" },
  pickerRowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
