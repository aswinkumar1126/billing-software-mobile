import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, fontSize, fontWeight, radii, shadow, spacing } from "@/theme/colors";
import { formatDateLong, formatTime, weekdayLong } from "@/utils/date";

function greetingFor(hour: number): string {
  if (hour >= 5 && hour <= 11) return "Good Morning";
  if (hour >= 12 && hour <= 16) return "Good Afternoon";
  if (hour >= 17 && hour <= 20) return "Good Evening";
  return "Good Night";
}

interface Props {
  userName?: string;
}

/**
 * Rich gradient-style hero card: greeting, live clock, and today's date.
 * No expo-linear-gradient dependency — depth is simulated with layered
 * semi-transparent overlays on a solid primary base, avoiding a new install
 * for a purely decorative effect.
 */
export function DashboardHero({ userName }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const greeting = greetingFor(now.getHours());

  return (
    <View style={styles.card}>
      <View style={styles.overlayBlobTop} />
      <View style={styles.overlayBlobBottom} />

      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            {greeting}
            {userName ? `, ${userName}` : ""}
          </Text>
          <Text style={styles.dateText}>
            {weekdayLong(now)}, {formatDateLong(now)}
          </Text>
        </View>
        <View style={styles.clockPill}>
          <Text style={styles.clockText}>{formatTime(now)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    padding: spacing.xl,
    overflow: "hidden",
    ...shadow.cardLg,
  },
  overlayBlobTop: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: colors.accent,
    opacity: 0.35,
  },
  overlayBlobBottom: {
    position: "absolute",
    bottom: -70,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
    opacity: 0.3,
  },
  topRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  greeting: { color: "#fff", fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold },
  dateText: { color: "rgba(255,255,255,0.85)", fontSize: fontSize.base, marginTop: 6, fontWeight: fontWeight.medium },
  clockPill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  clockText: { color: "#fff", fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
