import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii } from "@/theme/colors";

interface Props {
  qty: number;
  onDecrement: () => void;
  onIncrement: () => void;
  /** When true, the increment button is disabled (e.g. qty has hit available stock). */
  incrementDisabled?: boolean;
}

export function QtyStepper({ qty, onDecrement, onIncrement, incrementDisabled }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.btn} onPress={onDecrement} hitSlop={6}>
        <Text style={styles.btnText}>−</Text>
      </Pressable>
      <Text style={styles.qty}>{qty}</Text>
      <Pressable
        style={[styles.btn, incrementDisabled && styles.btnDisabled]}
        onPress={onIncrement}
        disabled={incrementDisabled}
        hitSlop={6}
      >
        <Text style={[styles.btnText, incrementDisabled && styles.btnTextDisabled]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  btn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.35 },
  btnText: { fontSize: 18, fontWeight: "700", color: colors.primary },
  btnTextDisabled: { color: colors.textMuted },
  qty: { minWidth: 24, textAlign: "center", fontSize: 14, fontWeight: "700", color: colors.textPrimary },
});
