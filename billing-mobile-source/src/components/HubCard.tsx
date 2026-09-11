import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, shadow, spacing } from "@/theme/colors";

interface Props {
  emoji: string;
  title: string;
  subtitle: string;
  accent: string;
  accentLight: string;
  onPress: () => void;
}

/** Colorful tinted card used on the Inventory/Reports hub screens. */
export function HubCard({ emoji, title, subtitle, accent, accentLight, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { backgroundColor: accentLight }, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: accent }]}>
        <Text style={styles.icon}>{emoji}</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: accent }]}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Text style={[styles.chevron, { color: accent }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    ...shadow.card,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    ...shadow.card,
  },
  icon: { fontSize: 26 },
  textWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: "800" },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  chevron: { fontSize: 24, fontWeight: "700", marginLeft: spacing.sm },
});
