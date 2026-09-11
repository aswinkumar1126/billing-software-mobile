/** Stock status domain types — used to lock out-of-stock variants on the billing screen. */

export type StockStatus = "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface StockStatusRow {
  variantId: number;
  variantName: string;
  productName: string;
  unit: string;
  currentStock: number;
  minStockLevel: number | null;
  status: StockStatus;
  averageCost: number;
}
