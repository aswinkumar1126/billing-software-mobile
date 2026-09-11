import React from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { formatCurrency } from "@/features/billing/format";
import { colors, radii } from "@/theme/colors";

export interface PickerOption {
  id: number;
  name: string;
  price: number;
}

interface Props {
  visible: boolean;
  title: string;
  options: PickerOption[];
  onSelect: (option: PickerOption) => void;
  onClose: () => void;
  emptyLabel?: string;
}

/** Generic bottom-sheet-style picker used for both the addon picker and the additional-charge picker. */
export function PickerModal({ visible, title, options, onSelect, onClose, emptyLabel }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
        <FlatList
          data={options}
          keyExtractor={(item) => String(item.id)}
          style={{ maxHeight: 360 }}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => onSelect(item)}>
              <Text style={styles.rowLabel}>{item.name}</Text>
              <Text style={styles.rowPrice}>{formatCurrency(item.price)}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>{emptyLabel ?? "Nothing available."}</Text>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingBottom: 24,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  close: { fontSize: 14, color: colors.primary, fontWeight: "600" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowLabel: { fontSize: 14, color: colors.textPrimary, flex: 1, marginRight: 12 },
  rowPrice: { fontSize: 14, fontWeight: "700", color: colors.primary },
  empty: { textAlign: "center", color: colors.textMuted, paddingVertical: 24 },
});
