/** Opening Stock domain types (inventory module). */

export interface OpeningStock {
  /** Alias of openingStockId — kept for convenient list keys, mirrors the web app. */
  id: number;
  openingStockId: number;
  variantId: number;
  variantName: string;
  productName: string;
  unit: string;
  openingQty: number;
  /** yyyy-MM-dd */
  openingDate: string;
  createdAt: string;
}

export interface OpeningStockCreateRequest {
  variantId: number;
  openingQty: number;
  /** yyyy-MM-dd, or null. */
  openingDate: string | null;
}
