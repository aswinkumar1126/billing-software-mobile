/**
 * Shared design tokens for the whole app. One cohesive direction: indigo/violet
 * as the primary brand color, with semantic colors for stock/status states and
 * a distinct accent per Inventory/Reports section so hub screens are scannable.
 *
 * Import from here instead of hardcoding hex values in screens/components.
 */

export const colors = {
  // Brand
  primary: "#4F46E5", // indigo-600
  primaryDark: "#3730A3", // indigo-800
  primaryLight: "#EEF2FF", // indigo-50
  primarySoft: "#C7D2FE", // indigo-200

  // Secondary accent (used sparingly for highlights / links on dark surfaces)
  accent: "#7C3AED", // violet-600

  // Semantic — status / amounts
  success: "#059669", // emerald-600
  successLight: "#D1FAE5",
  successDark: "#065F46",
  warning: "#D97706", // amber-600
  warningLight: "#FEF3C7",
  warningDark: "#92400E",
  danger: "#DC2626", // red-600
  dangerLight: "#FEE2E2",
  dangerDark: "#991B1B",
  info: "#0284C7", // sky-600
  infoLight: "#E0F2FE",
  infoDark: "#075985",

  // Section accents — Inventory
  sectionStockStatus: "#0D9488", // teal-600
  sectionStockStatusLight: "#CCFBF1",
  sectionOpeningStock: "#2563EB", // blue-600
  sectionOpeningStockLight: "#DBEAFE",
  sectionPurchase: "#9333EA", // purple-600
  sectionPurchaseLight: "#F3E8FF",
  sectionStockAdjustment: "#EA580C", // orange-600
  sectionStockAdjustmentLight: "#FFEDD5",

  // Section accents — Reports
  sectionSalesReport: "#059669", // emerald-600
  sectionSalesReportLight: "#D1FAE5",
  sectionPurchaseReport: "#9333EA", // purple-600
  sectionPurchaseReportLight: "#F3E8FF",
  sectionStockReport: "#0D9488", // teal-600
  sectionStockReportLight: "#CCFBF1",

  // Neutrals
  bg: "#F5F5FA", // app background — soft indigo-tinted gray, not stark white
  surface: "#FFFFFF",
  surfaceAlt: "#F8F7FC",
  border: "#E5E3F2",
  borderStrong: "#D8D5EE",

  textPrimary: "#1E1B32",
  textSecondary: "#5B5675",
  textMuted: "#8B87A3",
  textOnPrimary: "#FFFFFF",

  overlay: "rgba(30, 27, 50, 0.45)",
  shadow: "#4F46E5",
} as const;

export const gradients = {
  primary: ["#4F46E5", "#7C3AED"] as const,
  header: ["#4338CA", "#6D28D9"] as const,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const shadow = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  cardLg: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 6,
  },
  fab: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 8,
  },
} as const;

/** Font-size scale — use instead of ad-hoc numeric literals in new screens. */
export const fontSize = {
  xs: 11,
  sm: 12,
  base: 13,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  display: 28,
} as const;

/** Font-weight scale (RN wants string literals for fontWeight). */
export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;

/** Maps a StockStatus value to its semantic pill colors. */
export function stockStatusColors(status: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK") {
  switch (status) {
    case "AVAILABLE":
      return { bg: colors.successLight, fg: colors.successDark, dot: colors.success };
    case "LOW_STOCK":
      return { bg: colors.warningLight, fg: colors.warningDark, dot: colors.warning };
    case "OUT_OF_STOCK":
      return { bg: colors.dangerLight, fg: colors.dangerDark, dot: colors.danger };
    default:
      return { bg: colors.border, fg: colors.textSecondary, dot: colors.textMuted };
  }
}

/** Maps an OrderType value ("IN"|"OUT") to badge colors. */
export function orderTypeColors(orderType: "IN" | "OUT") {
  return orderType === "IN"
    ? { bg: colors.infoLight, fg: colors.infoDark }
    : { bg: colors.sectionPurchaseLight, fg: colors.sectionPurchase };
}
