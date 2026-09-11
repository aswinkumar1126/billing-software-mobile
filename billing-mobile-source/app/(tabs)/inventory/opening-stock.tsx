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
import { DatePickerField } from "@/components/DatePickerField";
import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SelectField, type SelectOption } from "@/components/SelectField";
import { useCreateOpeningStock, useOpeningStockList } from "@/features/inventory/hooks/useOpeningStock";
import { useProductVariants } from "@/features/inventory/hooks/useProductVariants";
import { toDateKey } from "@/features/reports/reportDateFilter";
import { colors, radii, shadow, spacing } from "@/theme/colors";
import { formatDateDisplay } from "@/utils/date";

export default function OpeningStockScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useOpeningStockList();
  const [formVisible, setFormVisible] = useState(false);
  const rows = data ?? [];

  return (
    <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
      <ScreenHeader title="Opening Stock" subtitle="Starting stock quantities" accent={colors.sectionOpeningStock} />

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.sectionOpeningStock} />
        </View>
      ) : isError ? (
        <View style={styles.centerFill}>
          <EmptyState emoji="⚠️" title="Couldn't load opening stock" />
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
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.variantName}>{item.variantName}</Text>
                <Text style={styles.dateText}>{formatDateDisplay(item.openingDate)}</Text>
              </View>
              <Text style={styles.qtyText}>
                {item.openingQty} {item.unit}
              </Text>
            </View>
          )}
          ListEmptyComponent={<EmptyState emoji="📥" title="No opening stock recorded yet" />}
        />
      )}

      <FloatingAddButton accent={colors.sectionOpeningStock} onPress={() => setFormVisible(true)} />

      <OpeningStockForm visible={formVisible} onClose={() => setFormVisible(false)} />
    </SafeAreaView>
  );
}

function OpeningStockForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { data: variants } = useProductVariants();
  const createMutation = useCreateOpeningStock();

  const [variant, setVariant] = useState<SelectOption | null>(null);
  const [qtyText, setQtyText] = useState("");
  const [openingDate, setOpeningDate] = useState<Date | null>(new Date());
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
    setOpeningDate(new Date());
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
    const qty = Number(qtyText);
    if (!Number.isFinite(qty) || qty < 0) {
      setError("Please enter a valid quantity.");
      return;
    }
    try {
      await createMutation.mutateAsync({
        variantId: variant.id,
        openingQty: qty,
        openingDate: openingDate ? toDateKey(openingDate) : null,
      });
      Alert.alert("Saved", "Opening stock recorded.");
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
            <Text style={styles.sheetTitle}>New Opening Stock</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>

          <View style={styles.formBody}>
            <SelectField label="Variant" value={variant} options={variantOptions} onSelect={setVariant} />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Opening Qty</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={qtyText}
                onChangeText={setQtyText}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.field}>
              <DatePickerField
                label="Opening Date"
                value={openingDate}
                onChange={setOpeningDate}
                accent={colors.sectionOpeningStock}
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
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  productName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  variantName: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  dateText: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  qtyText: { fontSize: 15, fontWeight: "800", color: colors.sectionOpeningStock },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.sectionOpeningStock,
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
  close: { fontSize: 14, color: colors.sectionOpeningStock, fontWeight: "600" },
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
  errorText: { color: colors.danger, fontSize: 13, textAlign: "center" },
  submitBtn: {
    backgroundColor: colors.sectionOpeningStock,
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
