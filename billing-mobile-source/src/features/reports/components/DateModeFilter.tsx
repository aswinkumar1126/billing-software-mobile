import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DatePickerField } from "@/components/DatePickerField";
import { colors, fontSize, fontWeight, radii, spacing } from "@/theme/colors";
import type { DateMode } from "@/features/reports/reportDateFilter";

interface Props {
  dateMode: DateMode;
  onDateModeChange: (mode: DateMode) => void;
  fromDate: Date | null;
  onFromDateChange: (date: Date | null) => void;
  toDate: Date | null;
  onToDateChange: (date: Date | null) => void;
  asOnDate: Date | null;
  onAsOnDateChange: (date: Date | null) => void;
  accent?: string;
}

/** Segmented Range/As On toggle + native calendar-picker date fields. */
export function DateModeFilter({
  dateMode,
  onDateModeChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  asOnDate,
  onAsOnDateChange,
  accent = colors.primary,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.segmentRow}>
        <Pressable
          style={[styles.segment, dateMode === "range" && { backgroundColor: accent, borderColor: accent }]}
          onPress={() => onDateModeChange("range")}
        >
          <Text style={[styles.segmentText, dateMode === "range" && styles.segmentTextActive]}>
            Date range
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segment, dateMode === "asOn" && { backgroundColor: accent, borderColor: accent }]}
          onPress={() => onDateModeChange("asOn")}
        >
          <Text style={[styles.segmentText, dateMode === "asOn" && styles.segmentTextActive]}>
            As on date
          </Text>
        </Pressable>
      </View>

      {dateMode === "range" ? (
        <View style={styles.dateRow}>
          <View style={styles.dateCol}>
            <DatePickerField label="From" value={fromDate} onChange={onFromDateChange} accent={accent} maximumDate={toDate ?? undefined} />
          </View>
          <View style={styles.dateCol}>
            <DatePickerField label="To" value={toDate} onChange={onToDateChange} accent={accent} minimumDate={fromDate ?? undefined} />
          </View>
        </View>
      ) : (
        <View style={styles.dateRow}>
          <View style={styles.dateCol}>
            <DatePickerField label="As on" value={asOnDate} onChange={onAsOnDateChange} accent={accent} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  segmentRow: { flexDirection: "row", gap: spacing.sm },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  segmentTextActive: { color: colors.textOnPrimary },
  dateRow: { flexDirection: "row", gap: spacing.sm },
  dateCol: { flex: 1 },
});
