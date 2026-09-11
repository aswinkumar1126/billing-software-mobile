/** Reports domain types — Sales/Purchase reports reuse SaleResponse/Purchase; Stock report is its own shape. */

export interface StockReportRow {
  variantId: number;
  variantName: string;
  productName: string;
  unit: string;
  openingQty: number;
  purchasedQty: number;
  soldQty: number;
  adjustedQty: number;
  closingQty: number;
}

export interface SalesReportQuery {
  fromDate?: string;
  toDate?: string;
  asOnDate?: string;
  salesManId?: number;
  paymentType?: string;
  orderType?: "IN" | "OUT";
}

export interface PurchaseReportQuery {
  fromDate?: string;
  toDate?: string;
  asOnDate?: string;
  supplierId?: number;
  variantId?: number;
}

export interface StockReportQuery {
  asOfDate?: string;
  variantId?: number;
}
