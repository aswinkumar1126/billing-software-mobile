import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiError } from "@/api/client";
import { ADJUSTMENT_TYPES, type AdjustmentType } from "@/api/types/stockAdjustment";
import { DatePickerField } from "@/components/DatePickerField";
import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SelectField, type SelectOption } from "@/components/SelectField";
import { StatusPill } from "@/components/StatusPill";
import {
  useCreateStockAdjustment,
  useStockAdjustmentList,
} from "@/features/inventory/hooks/useStockAdjustments";
import { useProductVariants } from "@/features/inventory/hooks/useProductVariants";
import { toDateKey } from "@/features/reports/reportDateFilter";
import { colors, radii, shadow, spacing } from "@/theme/colors";
import { formatDateDisplay } from "@/utils/date";

type Direction = "add" | "remove";

function adjustmentTypeLabel(type: AdjustmentType): string {
  return ADJUSTMENT_TYPES.find((t) => t.value === type)?.label ?? type;
}

export default function StockAdjustmentScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useStockAdjustmentList();
  const [formVisible, setFormVisible] = useState(false);
  const rows = data ?? [];

  return (
    <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
      <ScreenHeader
        title="Stock Adjustment"
        subtitle="Damage, loss & corrections"
        accent={colors.sectionStockAdjustment}
      />

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.sectionStockAdjustment} />
        </View>
      ) : isError ? (
        <View style={styles.centerFill}>
          <EmptyState emoji="⚠️" title="Couldn't load stock adjustments" />
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
          renderItem={({ item }) => {
            const isPositive = item.adjustmentQty >= 0;
            return (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.variantName}>{item.variantName}</Text>
                  <View style={styles.metaRow}>
                    <StatusPill
                      label={adjustmentTypeLabel(item.adjustmentType)}
                      bg={colors.sectionStockAdjustmentLight}
                      fg={colors.sectionStockAdjustment}
                    />
                  </View>
                  {item.reason ? <Text style={styles.reasonText}>{item.reason}</Text> : null}
                  <Text style={styles.dateText}>{formatDateDisplay(item.adjustmentDate)}</Text>
                </View>
                <Text style={[styles.qtyText, { color: isPositive ? colors.success : colors.danger }]}>
                  {isPositive ? "+" : ""}
                  {item.adjustmentQty} {item.unit}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={<EmptyState emoji="🛠️" title="No stock adjustments recorded yet" />}
        />
      )}

      <FloatingAddButton accent={colors.sectionStockAdjustment} onPress={() => setFormVisible(true)} />

      <StockAdjustmentForm visible={formVisible} onClose={() => setFormVisible(false)} />
    </SafeAreaView>
  );
}

function StockAdjustmentForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { data: variants } = useProductVariants();
  const createMutation = useCreateStockAdjustment();

  const [variant, setVariant] = useState<SelectOption | null>(null);
  const [qtyText, setQtyText] = useState("");
  const [direction, setDirection] = useState<Direction>("remove");
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>("DAMAGE");
  const [reason, setReason] = useState("");
  const [adjustmentDate, setAdjustmentDate] = useState<Date | null>(new Date());
  const [error, setError] = useState<string | null>(null);

  const variantOptions: SelectOption[] = useMemo(
    () =>
      (variants ?? [])
        .filter((v) => v.active)
        .map((v) => ({ id: v.variantId, label: v.variantName, sublabel: v.product.productName ?? undefined })),
    [variants]
  );

  const reset = () => {
    setVariant(null);
    setQtyText("");
    setDirection("remove");
    setAdjustmentType("DAMAGE");
    setReason("");
    setAdjustmentDate(new Date());
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    if (!variant) {
      setError("Please select a variant.");
      return;
    }
    const magnitude = Number(qtyText);
    if (!Number.isFinite(magnitude) || magnitude <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }
    const signedQty = direction === "remove" ? -Math.abs(magnitude) : Math.abs(magnitude);
    try {
      await createMutation.mutateAsync({
        variantId: variant.id,
        adjustmentQty: signedQty,
        adjustmentType,
        reason: reason.trim() || null,
        adjustmentDate: adjustmentDate ? toDateKey(adjustmentDate) : null,
      });
      Alert.alert("Saved", "Stock adjustment recorded.");
      handleClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save. Please try again.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>New Stock Adjustment</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>

          <View style={styles.formBody}>
            <SelectField label="Variant" value={variant} options={variantOptions} onSelect={setVariant} />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Quantity</Text>
              <View style={styles.qtyDirectionRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  keyboardType="decimal-pad"
                  value={qtyText}
                  onChangeText={setQtyText}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
                <View style={styles.directionToggle}>
                  <Pressable
                    style={[styles.directionBtn, direction === "add" && styles.directionBtnAddActive]}
                    onPress={() => setDirection("add")}
                  >
                    <Text style={[styles.directionText, direction === "add" && styles.directionTextActive]}>
                      Add
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.directionBtn, direction === "remove" && styles.directionBtnRemoveActive]}
                    onPress={() => setDirection("remove")}
                  >
                    <Text style={[styles.directionText, direction === "remove" && styles.directionTextActive]}>
                      Remove
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Type</Text>
              <View style={styles.typeGrid}>
                {ADJUSTMENT_TYPES.map((t) => {
                  const selected = t.value === adjustmentType;
                  return (
                    <Pressable
                      key={t.value}
                      style={[styles.typeChip, selected && styles.typeChipSelected]}
                      onPress={() => setAdjustmentType(t.value)}
                    >
                      <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Reason (optional)</Text>
              <TextInput
                style={styles.input}
                value={reason}
                onChangeText={setReason}
                placeholder="e.g. broken during transit"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.field}>
              <DatePickerField
                label="Date"
                value={adjustmentDate}
                onChange={setAdjustmentDate}
                accent={colors.sectionStockAdjustment}
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              style={[styles.submitBtn, createMutation.isPending && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  variantName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  metaRow: { flexDirection: "row", marginTop: 6 },
  reasonText: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
  dateText: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  qtyText: { fontSize: 15, fontWeight: "800" },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.sectionStockAdjustment,
    borderRadius: radii.md,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingBottom: 28,
    maxHeight: "88%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  close: { fontSize: 14, color: colors.sectionStockAdjustment, fontWeight: "600" },
  formBody: { paddingHorizontal: 20, gap: spacing.md },
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
  qtyDirectionRow: { flexDirection: "row", gap: spacing.sm },
  directionToggle: { flexDirection: "row", borderRadius: radii.sm, overflow: "hidden" },
  directionBtn: {
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  directionBtnAddActive: { backgroundColor: colors.success, borderColor: colors.success },
  directionBtnRemoveActive: { backgroundColor: colors.danger, borderColor: colors.danger },
  directionText: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
  directionTextActive: { color: "#fff" },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipSelected: { backgroundColor: colors.sectionStockAdjustment, borderColor: colors.sectionStockAdjustment },
  typeChipText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  typeChipTextSelected: { color: "#fff" },
  errorText: { color: colors.danger, fontSize: 13, textAlign: "center" },
  submitBtn: {
    backgroundColor: colors.sectionStockAdjustment,
    borderRadius: radii.md,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    marginTop: spacing.xs,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
