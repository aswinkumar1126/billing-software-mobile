import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { radii } from "@/theme/colors";

interface Props {
  label: string;
  bg: string;
  fg: string;
  dot?: string;
}

/** Small color-coded status/badge pill used throughout Inventory and Reports lists. */
export function StatusPill({ label, bg, fg, dot }: Props) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: dot }]} />}
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    alignSelf: "flex-start",
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  text: { fontSize: 11, fontWeight: "700" },
});
