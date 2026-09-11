/** Product variant domain type (settings module) — needed by the billing product grid. */

export interface ProductVariant {
  id: number;
  variantId: number;
  variantName: string;
  product: {
    productId: number;
    productName?: string;
  };
  price: number;
  unit: string;
  trackStock: boolean;
  minStockLevel: number | null;
  active: boolean;
  createdAt: string;
  updatedAt?: string | null;
}
