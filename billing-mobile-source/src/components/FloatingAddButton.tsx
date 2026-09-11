import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radii, shadow } from "@/theme/colors";

export function FloatingAddButton({ onPress, accent = colors.primary }: { onPress: () => void; accent?: string }) {
  return (
    <Pressable style={[styles.fab, { backgroundColor: accent }]} onPress={onPress} hitSlop={8}>
      <Text style={styles.text}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.fab,
  },
  text: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: -2 },
});
