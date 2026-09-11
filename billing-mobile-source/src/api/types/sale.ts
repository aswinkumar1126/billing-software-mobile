/** Sales / Billing domain types — mirrors billing-software's sale module DTOs. */

export type OrderType = "IN" | "OUT";

// ---- Request payloads ----------------------------------------------------

export interface SaleItemAddonRequest {
  addonId: number;
  unitPrice: number;
  qty: number;
}

export interface SaleItemRequest {
  variantId: number;
  qty: number;
  unitPrice: number;
  addons: SaleItemAddonRequest[];
}

export interface SaleAdditionalChargeRequest {
  additionalChargeId: number;
  price: number;
  qty: number;
}

/**
 * billNo and salesman are intentionally omitted — the backend generates the
 * bill number and assigns the salesman from the authenticated session.
 */
export interface SaleCreateRequest {
  paymentType: string;
  orderType: OrderType;
  discount: number;
  tax: number;
  items: SaleItemRequest[];
  additionalCharges: SaleAdditionalChargeRequest[];
}

// ---- Response payloads -----------------------------------------------------

export interface SaleItemAddonResponse {
  id: number;
  addonId: number;
  addonName: string;
  unitPrice: number;
  qty: number;
  total: number;
}

export interface SaleItemResponse {
  saleItemId: number;
  variantId: number;
  variantName: string;
  qty: number;
  unitPrice: number;
  subTotal: number;
  total: number;
  addons: SaleItemAddonResponse[];
}

export interface SaleAdditionalChargeResponse {
  id: number;
  additionalChargeId: number;
  additionalChargeName: string;
  price: number;
  qty: number;
  total: number;
}

export interface SaleResponse {
  saleId: number;
  billNo: string;
  billDate: string;
  subTotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentType: string;
  orderType: OrderType;
  salesManId?: number;
  salesManName?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  items: SaleItemResponse[];
  additionalCharges: SaleAdditionalChargeResponse[];
}

// ---- Client-only cart state -------------------------------------------------

export interface CartAddon {
  addonId: number;
  addonName: string;
  unitPrice: number;
  qty: number;
}

export interface CartLine {
  /** Equal to variantId — a variant only ever occupies one cart line. */
  key: number;
  variantId: number;
  variantName: string;
  productName: string;
  qty: number;
  unitPrice: number;
  addons: CartAddon[];
}

export interface CartCharge {
  additionalChargeId: number;
  name: string;
  price: number;
  qty: number;
}
