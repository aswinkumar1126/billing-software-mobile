/** Stock Adjustment domain types (inventory module). */

export type AdjustmentType = "DAMAGE" | "MISSING" | "EXPIRED" | "CORRECTION";

export const ADJUSTMENT_TYPES: { value: AdjustmentType; label: string }[] = [
  { value: "DAMAGE", label: "Damaged items" },
  { value: "MISSING", label: "Missing items" },
  { value: "EXPIRED", label: "Expired products" },
  { value: "CORRECTION", label: "Manual / physical count correction" },
];

export interface StockAdjustment {
  /** Alias of stockAdjustmentId. */
  id: number;
  stockAdjustmentId: number;
  variantId: number;
  variantName: string;
  unit: string;
  adjustmentQty: number;
  adjustmentType: AdjustmentType;
  reason?: string | null;
  /** yyyy-MM-dd */
  adjustmentDate: string;
  createdAt: string;
}

/**
 * Create payload shape is NOT the same as the response — adjustmentQty here
 * is signed (negative = remove, positive = add), computed client-side from a
 * magnitude + direction toggle in the form.
 */
export interface StockAdjustmentCreateRequest {
  variantId: number;
  adjustmentQty: number;
  adjustmentType: AdjustmentType;
  reason: string | null;
  /** yyyy-MM-dd, or null. */
  adjustmentDate: string | null;
}
