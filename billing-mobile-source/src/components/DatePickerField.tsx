import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSize, fontWeight, radii, spacing } from "@/theme/colors";
import { formatDateDisplay } from "@/utils/date";

interface Props {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  accent?: string;
  /** Disallow picking a date after this one (e.g. "to" can't precede "from"). */
  maximumDate?: Date;
  minimumDate?: Date;
}

/**
 * Tappable, calendar-backed date field. Renders a styled Pressable "input"
 * showing the value as dd-mm-yyyy; tapping opens the native
 * @react-native-community/datetimepicker in mode="date".
 *
 * Android shows its picker as a transient dialog — it must be manually
 * shown/hidden via local state, and `onChange` fires once per interaction
 * (a "dismissed" event type fires on Cancel). iOS is rendered inline inside
 * our own bottom-sheet Modal so the user can see the wheel and confirm,
 * matching the polished feel of the rest of the app's sheets.
 */
export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = "Select date",
  accent = colors.primary,
  maximumDate,
  minimumDate,
}: Props) {
  const [open, setOpen] = useState(false);
  // iOS: staged value inside the sheet, committed on "Done".
  const [draft, setDraft] = useState<Date>(value ?? new Date());

  const openPicker = () => {
    setDraft(value ?? new Date());
    setOpen(true);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    // Android auto-dismisses; close our state regardless of outcome so a
    // second tap doesn't hit a "two-open" picker stuck from a stale flag.
    setOpen(false);
    if (event.type === "set" && selected) {
      onChange(selected);
    }
  };

  const handleIosChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (selected) {
      setDraft(selected);
    }
  };

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={styles.field} onPress={openPicker}>
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value ? formatDateDisplay(value) : placeholder}
        </Text>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}1A` }]}>
          <Text style={[styles.icon, { color: accent }]}>📅</Text>
        </View>
      </Pressable>

      {Platform.OS === "android" && open && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display="default"
          onChange={handleAndroidChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}

      {Platform.OS === "ios" && (
        <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Text style={styles.sheetTitle}>{label ?? "Select date"}</Text>
              <Pressable
                onPress={() => {
                  onChange(draft);
                  setOpen(false);
                }}
                hitSlop={12}
              >
                <Text style={[styles.doneText, { color: accent }]}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={draft}
              mode="date"
              display="inline"
              onChange={handleIosChange}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              style={styles.iosPicker}
            />
          </View>
        </Modal>
      )}

      {Platform.OS === "web" && open && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          onChange={handleAndroidChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginBottom: 4 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  value: { fontSize: fontSize.md, color: colors.textPrimary, fontWeight: fontWeight.medium, flex: 1 },
  placeholder: { color: colors.textMuted, fontWeight: fontWeight.regular },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  icon: { fontSize: 13 },
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
  sheetTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  cancelText: { fontSize: fontSize.md, color: colors.textSecondary, fontWeight: fontWeight.medium },
  doneText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  iosPicker: { alignSelf: "center" },
});
