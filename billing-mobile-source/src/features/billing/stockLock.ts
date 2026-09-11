import type { StockStatusRow } from "@/api/types/stock";
import type { ProductVariant } from "@/api/types/variant";

/**
 * A variant is locked (cannot be added / cannot increase qty past current
 * stock) when it tracks stock AND either has no stock-status row at all, or
 * its row reports OUT_OF_STOCK. Non-tracked variants are never locked.
 * Mirrors the web app's existing behavior exactly.
 */
export function isVariantLocked(
  variant: Pick<ProductVariant, "trackStock" | "variantId">,
  stockByVariantId: Map<number, StockStatusRow>
): boolean {
  if (!variant.trackStock) {
    return false;
  }
  const row = stockByVariantId.get(variant.variantId);
  return !row || row.status === "OUT_OF_STOCK";
}

export function buildStockMap(rows: StockStatusRow[]): Map<number, StockStatusRow> {
  return new Map(rows.map((r) => [r.variantId, r]));
}

/**
 * Available stock to cap the qty stepper at. Returns null for non-tracked
 * variants (no cap applies).
 */
export function availableStock(
  variant: Pick<ProductVariant, "trackStock" | "variantId">,
  stockByVariantId: Map<number, StockStatusRow>
): number | null {
  if (!variant.trackStock) {
    return null;
  }
  const row = stockByVariantId.get(variant.variantId);
  return row ? row.currentStock : 0;
}
