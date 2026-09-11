import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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

import type { AddOn, AdditionalCharge } from "@/api/types/addon";
import type { OrderType } from "@/api/types/sale";
import { PickerModal, type PickerOption } from "@/features/billing/components/PickerModal";
import { QtyStepper } from "@/features/billing/components/QtyStepper";
import { formatCurrency } from "@/features/billing/format";
import type { UseCartReturn } from "@/features/billing/hooks/useCart";
import { availableStock } from "@/features/billing/stockLock";
import type { StockStatusRow } from "@/api/types/stock";
import type { ProductVariant } from "@/api/types/variant";
import { colors, radii, spacing } from "@/theme/colors";

const PAYMENT_TYPES = ["CASH", "CARD", "UPI"] as const;
type PaymentType = (typeof PAYMENT_TYPES)[number];

const ORDER_TYPES: { value: OrderType; label: string }[] = [
  { value: "IN", label: "Dine-in" },
  { value: "OUT", label: "Takeaway" },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  cart: UseCartReturn;
  variantsById: Map<number, ProductVariant>;
  stockByVariantId: Map<number, StockStatusRow>;
  addOns: AddOn[];
  additionalCharges: AdditionalCharge[];
  onSubmit: (params: {
    paymentType: PaymentType;
    orderType: OrderType;
    discount: number;
    tax: number;
  }) => Promise<void> | void;
  isSubmitting: boolean;
  submitError: string | null;
}

export function CartSheet({
  visible,
  onClose,
  cart,
  variantsById,
  stockByVariantId,
  addOns,
  additionalCharges,
  onSubmit,
  isSubmitting,
  submitError,
}: Props) {
  const [orderType, setOrderType] = useState<OrderType>("IN");
  const [paymentType, setPaymentType] = useState<PaymentType>("CASH");
  const [discountText, setDiscountText] = useState("0");
  const [taxText, setTaxText] = useState("0");
  const [addonPickerLine, setAddonPickerLine] = useState<number | null>(null);
  const [chargePickerOpen, setChargePickerOpen] = useState(false);

  const discount = Math.max(0, Number(discountText) || 0);
  const tax = Math.max(0, Number(taxText) || 0);

  const total = useMemo(() => {
    const raw = cart.subTotal - discount + tax;
    return Math.max(0, raw);
  }, [cart.subTotal, discount, tax]);

  const addonOptions: PickerOption[] = addOns
    .filter((a) => a.active)
    .map((a) => ({ id: a.addonId, name: a.name, price: a.price }));

  const chargeOptions: PickerOption[] = additionalCharges
    .filter((c) => c.active)
    .map((c) => ({ id: c.additionalChargeId, name: c.name, price: c.price }));

  const handleSubmit = async () => {
    if (cart.lines.length === 0) {
      Alert.alert("Cart is empty", "Add at least one item before completing the sale.");
      return;
    }
    await onSubmit({ paymentType, orderType, discount, tax });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.headerClose}>Done</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          {cart.lines.length === 0 ? (
            <Text style={styles.emptyText}>No items in cart yet. Add products from the grid.</Text>
          ) : (
            cart.lines.map((line) => {
              const variant = variantsById.get(line.variantId);
              const cap = variant ? availableStock(variant, stockByVariantId) : null;
              const incrementDisabled = cap !== null && line.qty >= cap;
              return (
                <View key={line.key} style={styles.lineCard}>
                  <View style={styles.lineHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lineProductName}>{line.productName}</Text>
                      <Text style={styles.lineVariantName}>
                        {line.variantName} · {formatCurrency(line.unitPrice)}
                      </Text>
                    </View>
                    <Pressable onPress={() => cart.removeLine(line.variantId)} hitSlop={8}>
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>

                  <View style={styles.lineFooterRow}>
                    <QtyStepper
                      qty={line.qty}
                      onDecrement={() => cart.setLineQty(line.variantId, line.qty - 1)}
                      onIncrement={() => cart.setLineQty(line.variantId, line.qty + 1)}
                      incrementDisabled={incrementDisabled}
                    />
                    <Text style={styles.lineTotal}>{formatCurrency(cart.lineTotal(line))}</Text>
                  </View>

                  {line.addons.length > 0 && (
                    <View style={styles.addonList}>
                      {line.addons.map((addon) => (
                        <View key={addon.addonId} style={styles.addonRow}>
                          <Text style={styles.addonName} numberOfLines={1}>
                            + {addon.addonName} ({formatCurrency(addon.unitPrice)})
                          </Text>
                          <QtyStepper
                            qty={addon.qty}
                            onDecrement={() =>
                              cart.setAddonQty(line.variantId, addon.addonId, addon.qty - 1)
                            }
                            onIncrement={() =>
                              cart.setAddonQty(line.variantId, addon.addonId, addon.qty + 1)
                            }
                          />
                        </View>
                      ))}
                    </View>
                  )}

                  <Pressable
                    style={styles.addAddonBtn}
                    onPress={() => setAddonPickerLine(line.variantId)}
                  >
                    <Text style={styles.addAddonText}>+ Add addon</Text>
                  </Pressable>
                </View>
              );
            })
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Additional charges</Text>
              <Pressable onPress={() => setChargePickerOpen(true)}>
                <Text style={styles.addAddonText}>+ Add charge</Text>
              </Pressable>
            </View>
            {cart.charges.length === 0 ? (
              <Text style={styles.mutedText}>No additional charges.</Text>
            ) : (
              cart.charges.map((charge) => (
                <View key={charge.additionalChargeId} style={styles.chargeRow}>
                  <Text style={styles.chargeName} numberOfLines={1}>
                    {charge.name} ({formatCurrency(charge.price)})
                  </Text>
                  <View style={styles.chargeControls}>
                    <QtyStepper
                      qty={charge.qty}
                      onDecrement={() =>
                        cart.setChargeQty(charge.additionalChargeId, charge.qty - 1)
                      }
                      onIncrement={() =>
                        cart.setChargeQty(charge.additionalChargeId, charge.qty + 1)
                      }
                    />
                    <Pressable
                      onPress={() => cart.removeCharge(charge.additionalChargeId)}
                      hitSlop={8}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order type</Text>
            <View style={styles.segmentRow}>
              {ORDER_TYPES.map((opt) => {
                const selected = opt.value === orderType;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.segment, selected && styles.segmentSelected]}
                    onPress={() => setOrderType(opt.value)}
                  >
                    <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment mode</Text>
            <View style={styles.segmentRow}>
              {PAYMENT_TYPES.map((opt) => {
                const selected = opt === paymentType;
                return (
                  <Pressable
                    key={opt}
                    style={[styles.segment, selected && styles.segmentSelected]}
                    onPress={() => setPaymentType(opt)}
                  >
                    <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <Text style={styles.sectionTitle}>Discount</Text>
                <TextInput
                  style={styles.numInput}
                  keyboardType="decimal-pad"
                  value={discountText}
                  onChangeText={setDiscountText}
                  placeholder="0"
                />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.sectionTitle}>Tax</Text>
                <TextInput
                  style={styles.numInput}
                  keyboardType="decimal-pad"
                  value={taxText}
                  onChangeText={setTaxText}
                  placeholder="0"
                />
              </View>
            </View>
          </View>

          <View style={styles.totalsBox}>
            <TotalsRow label="Sub Total (items)" value={formatCurrency(cart.itemsTotal)} />
            <TotalsRow label="Other Charges" value={formatCurrency(cart.chargesTotal)} />
            <TotalsRow label="Discount" value={`− ${formatCurrency(discount)}`} />
            <TotalsRow label="Tax" value={`+ ${formatCurrency(tax)}`} />
            <View style={styles.totalsDivider} />
            <TotalsRow label="Total" value={formatCurrency(total)} bold />
          </View>

          {submitError && <Text style={styles.errorText}>{submitError}</Text>}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Complete Sale · {formatCurrency(total)}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <PickerModal
        visible={addonPickerLine !== null}
        title="Add an addon"
        options={addonOptions}
        onClose={() => setAddonPickerLine(null)}
        emptyLabel="No addons available."
        onSelect={(option) => {
          if (addonPickerLine !== null) {
            cart.addAddon(addonPickerLine, {
              addonId: option.id,
              addonName: option.name,
              unitPrice: option.price,
            });
          }
          setAddonPickerLine(null);
        }}
      />

      <PickerModal
        visible={chargePickerOpen}
        title="Add a charge"
        options={chargeOptions}
        onClose={() => setChargePickerOpen(false)}
        emptyLabel="No additional charges available."
        onSelect={(option) => {
          cart.addCharge({
            additionalChargeId: option.id,
            name: option.name,
            price: option.price,
          });
          setChargePickerOpen(false);
        }}
      />
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
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  headerClose: { fontSize: 15, fontWeight: "600", color: colors.primary },
  scrollContent: { padding: 16, paddingBottom: 32 },
  emptyText: { textAlign: "center", color: colors.textMuted, marginTop: 32, fontSize: 14 },
  lineCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lineHeaderRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  lineProductName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  lineVariantName: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  removeText: { fontSize: 12, color: colors.danger, fontWeight: "600" },
  lineFooterRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lineTotal: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  addonList: { marginTop: 10, gap: 6 },
  addonRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  addonName: { fontSize: 12, color: colors.textSecondary, flex: 1, marginRight: 8 },
  addAddonBtn: { marginTop: 8, alignSelf: "flex-start" },
  addAddonText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  section: { marginBottom: 18 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, marginBottom: 8 },
  mutedText: { fontSize: 13, color: colors.textMuted },
  chargeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  chargeName: { fontSize: 13, color: colors.textPrimary, flex: 1, marginRight: 8 },
  chargeControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  segmentRow: { flexDirection: "row", gap: 8 },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  segmentSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  segmentText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  segmentTextSelected: { color: "#fff" },
  inputRow: { flexDirection: "row", gap: 12 },
  inputCol: { flex: 1 },
  numInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  totalsBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    marginTop: 4,
  },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalsLabel: { fontSize: 13, color: colors.textSecondary },
  totalsLabelBold: { fontSize: 15, color: colors.textPrimary, fontWeight: "700" },
  totalsValue: { fontSize: 13, color: colors.textPrimary, fontWeight: "600" },
  totalsValueBold: { fontSize: 16, color: colors.primary, fontWeight: "800" },
  totalsDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.primarySoft, marginVertical: 6 },
  errorText: { color: colors.danger, fontSize: 13, marginTop: 12, textAlign: "center" },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
