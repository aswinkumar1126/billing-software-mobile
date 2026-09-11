import React, { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radii, spacing } from "@/theme/colors";

export interface SelectOption {
  id: number;
  label: string;
  sublabel?: string;
}

interface Props {
  label: string;
  placeholder?: string;
  value: SelectOption | null;
  options: SelectOption[];
  onSelect: (option: SelectOption) => void;
  searchable?: boolean;
}

/** Tap-to-open modal picker for variant/supplier/user selects — avoids adding a picker dependency. */
export function SelectField({ label, placeholder = "Select…", value, options, onSelect, searchable = true }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.trim().toLowerCase()))
    : options;

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={[styles.fieldText, !value && styles.placeholder]} numberOfLines={1}>
          {value ? value.label : placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={12}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>
          {searchable && (
            <TextInput
              style={styles.search}
              placeholder="Search…"
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
          )}
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            style={{ maxHeight: 360 }}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  onSelect(item);
                  setSearch("");
                  setOpen(false);
                }}
              >
                <Text style={styles.rowLabel}>{item.label}</Text>
                {item.sublabel ? <Text style={styles.rowSublabel}>{item.sublabel}</Text> : null}
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Nothing found.</Text>}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "600", color: colors.textSecondary, marginBottom: 4 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fieldText: { fontSize: 14, color: colors.textPrimary, flex: 1 },
  placeholder: { color: colors.textMuted },
  chevron: { color: colors.textMuted, fontSize: 12, marginLeft: 8 },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingBottom: 24,
    paddingTop: 12,
    maxHeight: "75%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  close: { fontSize: 14, color: colors.primary, fontWeight: "600" },
  search: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowLabel: { fontSize: 14, color: colors.textPrimary, fontWeight: "600" },
  rowSublabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empty: { textAlign: "center", color: colors.textMuted, paddingVertical: 24 },
});
