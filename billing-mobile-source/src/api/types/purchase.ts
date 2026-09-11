/** Purchase domain types (inventory module). */

export interface PurchaseItemRequest {
  variantId: number;
  qty: number;
  purchasePrice: number;
  discount: number;
  tax: number;
}

export interface PurchaseCreateRequest {
  supplierId: number;
  invoiceNo: string;
  /** yyyy-MM-dd */
  purchaseDate: string;
  items: PurchaseItemRequest[];
}

export interface PurchaseItem {
  purchaseItemId: number;
  variantId: number;
  variantName: string;
  unit: string;
  qty: number;
  purchasePrice: number;
  discount: number;
  tax: number;
  amount: number;
}

export interface Purchase {
  /** Alias of purchaseId. */
  id: number;
  purchaseId: number;
  supplierId: number;
  supplierName: string;
  invoiceNo: string;
  /** yyyy-MM-dd */
  purchaseDate: string;
  subTotal: number;
  discount: number;
  tax: number;
  total: number;
  createdAt: string;
  items: PurchaseItem[];
}

export interface Supplier {
  supplierId: number;
  name: string;
  active?: boolean;
}
