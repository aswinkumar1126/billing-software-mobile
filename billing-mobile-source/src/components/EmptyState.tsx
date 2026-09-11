import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, fontSize, fontWeight, radii, spacing } from "@/theme/colors";

export function EmptyState({ emoji = "📭", title, subtitle }: { emoji?: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingVertical: 40, paddingHorizontal: spacing.xl },
  emojiWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emoji: { fontSize: 30 },
  title: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: "center" },
  subtitle: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: 4, textAlign: "center", maxWidth: 280 },
});
