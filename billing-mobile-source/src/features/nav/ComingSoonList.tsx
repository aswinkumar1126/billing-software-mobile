import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/auth/AuthContext";
import type { NavItem } from "@/features/nav/appNav";

interface Props {
  title: string;
  items: NavItem[];
}

/** Shared placeholder for the Inventory and Reports tabs — each row is gated by its permission. */
export function ComingSoonList({ title, items }: Props) {
  const { hasPermission } = useAuth();
  const visibleItems = items.filter((item) => hasPermission(item.permission));

  return (
    <SafeAreaView style={styles.fill}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>

        {visibleItems.length === 0 ? (
          <Text style={styles.emptyText}>Nothing available for your account yet.</Text>
        ) : (
          visibleItems.map((item) => (
            <Pressable
              key={item.label}
              style={styles.row}
              onPress={() => Alert.alert(item.label, "Coming soon.")}
            >
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </Pressable>
          ))
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  title: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 16 },
  emptyText: { color: "#6B7280", fontSize: 14, marginTop: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  rowLabel: { fontSize: 16, color: "#111827", fontWeight: "500" },
  rowChevron: { fontSize: 20, color: "#9CA3AF" },
});
