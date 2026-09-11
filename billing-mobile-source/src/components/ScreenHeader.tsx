import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { colors, fontSize, fontWeight, radii, spacing } from "@/theme/colors";

interface Props {
  title: string;
  subtitle?: string;
  accent?: string;
  /** Renders a back chevron that navigates back. Defaults true for nested screens. */
  showBack?: boolean;
  right?: React.ReactNode;
}

/** Consistent colorful header used across all Inventory/Reports screens. */
export function ScreenHeader({ title, subtitle, accent = colors.primary, showBack = true, right }: Props) {
  const router = useRouter();
  return (
    <View style={[styles.wrap, { backgroundColor: accent }]}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.backBtnSpacer} />
        )}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <View>{right}</View> : <View style={styles.backBtnSpacer} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },
  row: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnSpacer: { width: 34, height: 34 },
  backText: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: -2 },
  titleWrap: { flex: 1, alignItems: "center" },
  title: { color: "#fff", fontSize: fontSize.xl, fontWeight: fontWeight.extrabold },
  subtitle: { color: "rgba(255,255,255,0.85)", fontSize: fontSize.sm, marginTop: 2 },
});
