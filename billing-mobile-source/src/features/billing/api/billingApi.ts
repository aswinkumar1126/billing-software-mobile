import { apiClient, unwrap } from "@/api/client";
import type { AddOn, AdditionalCharge } from "@/api/types/addon";
import type { Category, Product } from "@/api/types/product";
import type { SaleCreateRequest, SaleResponse } from "@/api/types/sale";
import type { StockStatusRow } from "@/api/types/stock";
import type { ProductVariant } from "@/api/types/variant";

export function fetchCategories(): Promise<Category[]> {
  return unwrap(apiClient.get<Category[]>("/category"));
}

export function fetchProducts(): Promise<Product[]> {
  return unwrap(apiClient.get<Product[]>("/product"));
}

export function fetchProductVariants(): Promise<ProductVariant[]> {
  return unwrap(apiClient.get<ProductVariant[]>("/product-variant"));
}

export function fetchAddOns(): Promise<AddOn[]> {
  return unwrap(apiClient.get<AddOn[]>("/addon"));
}

export function fetchAdditionalCharges(): Promise<AdditionalCharge[]> {
  return unwrap(apiClient.get<AdditionalCharge[]>("/additional-charge"));
}

export function fetchStockStatus(): Promise<StockStatusRow[]> {
  return unwrap(apiClient.get<StockStatusRow[]>("/stock/status"));
}

export function createSale(payload: SaleCreateRequest): Promise<SaleResponse> {
  return unwrap(apiClient.post<SaleResponse>("/sales", payload));
}

/** All sales, unfiltered — used by the Dashboard. Mirrors the web app's salesApi.getAll(). */
export function fetchSales(): Promise<SaleResponse[]> {
  return unwrap(apiClient.get<SaleResponse[]>("/sales"));
}
