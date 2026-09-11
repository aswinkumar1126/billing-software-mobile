import { Stack } from "expo-router";
import React from "react";

export default function ReportsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sales" />
      <Stack.Screen name="purchase" />
      <Stack.Screen name="stock" />
    </Stack>
  );
}
