import { apiClient, unwrap } from "@/api/client";
import type {
  Purchase,
  PurchaseReportQuery,
  SalesReportQuery,
  StockReportQuery,
  StockReportRow,
  Supplier,
} from "@/api/types";
import type { SaleResponse } from "@/api/types/sale";
import type { ProductVariant } from "@/api/types/variant";

export function fetchSalesReport(query: SalesReportQuery): Promise<SaleResponse[]> {
  return unwrap(apiClient.get<SaleResponse[]>("/sales/report", { params: query }));
}

interface RawPurchase extends Omit<Purchase, "id"> {}

export async function fetchPurchaseReport(query: PurchaseReportQuery): Promise<Purchase[]> {
  const rows = await unwrap(apiClient.get<RawPurchase[]>("/purchase/report", { params: query }));
  return rows.map((raw) => ({ ...raw, id: raw.purchaseId }));
}

export function fetchStockReport(query: StockReportQuery): Promise<StockReportRow[]> {
  return unwrap(apiClient.get<StockReportRow[]>("/stock/report", { params: query }));
}

export function fetchSuppliers(): Promise<Supplier[]> {
  return unwrap(apiClient.get<Supplier[]>("/supplier"));
}

export function fetchProductVariants(): Promise<ProductVariant[]> {
  return unwrap(apiClient.get<ProductVariant[]>("/product-variant"));
}

export interface AppUser {
  userId: number;
  userName: string;
}

export function fetchUsers(): Promise<AppUser[]> {
  return unwrap(apiClient.get<AppUser[]>("/user"));
}
