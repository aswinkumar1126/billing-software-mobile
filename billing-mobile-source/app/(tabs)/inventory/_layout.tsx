import { Stack } from "expo-router";
import React from "react";

export default function InventoryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="stock-status" />
      <Stack.Screen name="opening-stock" />
      <Stack.Screen name="purchase" />
      <Stack.Screen name="stock-adjustment" />
    </Stack>
  );
}
