import { apiClient, unwrap } from "@/api/client";
import type {
  OpeningStock,
  OpeningStockCreateRequest,
  Purchase,
  PurchaseCreateRequest,
  StockAdjustment,
  StockAdjustmentCreateRequest,
  Supplier,
} from "@/api/types";
import type { ProductVariant } from "@/api/types/variant";
import type { StockStatusRow } from "@/api/types/stock";

// ---- Stock status (reused for the Inventory tab's read-only view) ---------

export function fetchStockStatus(): Promise<StockStatusRow[]> {
  return unwrap(apiClient.get<StockStatusRow[]>("/stock/status"));
}

// ---- Opening stock ----------------------------------------------------------

interface RawOpeningStock extends Omit<OpeningStock, "id"> {}

function mapOpeningStock(raw: RawOpeningStock): OpeningStock {
  return { ...raw, id: raw.openingStockId };
}

export async function fetchOpeningStock(): Promise<OpeningStock[]> {
  const rows = await unwrap(apiClient.get<RawOpeningStock[]>("/opening-stock"));
  return rows.map(mapOpeningStock);
}

export async function createOpeningStock(
  payload: OpeningStockCreateRequest
): Promise<OpeningStock> {
  const row = await unwrap(apiClient.post<RawOpeningStock>("/opening-stock", payload));
  return mapOpeningStock(row);
}

// ---- Purchase ----------------------------------------------------------------

interface RawPurchase extends Omit<Purchase, "id"> {}

function mapPurchase(raw: RawPurchase): Purchase {
  return { ...raw, id: raw.purchaseId };
}

export async function fetchPurchases(): Promise<Purchase[]> {
  const rows = await unwrap(apiClient.get<RawPurchase[]>("/purchase"));
  return rows.map(mapPurchase);
}

export async function fetchPurchaseById(id: number): Promise<Purchase> {
  const row = await unwrap(apiClient.get<RawPurchase>(`/purchase/${id}`));
  return mapPurchase(row);
}

export async function createPurchase(payload: PurchaseCreateRequest): Promise<Purchase> {
  const row = await unwrap(apiClient.post<RawPurchase>("/purchase", payload));
  return mapPurchase(row);
}

export function fetchSuppliers(): Promise<Supplier[]> {
  return unwrap(apiClient.get<Supplier[]>("/supplier"));
}

// ---- Stock adjustment ---------------------------------------------------------

interface RawStockAdjustment extends Omit<StockAdjustment, "id"> {}

function mapStockAdjustment(raw: RawStockAdjustment): StockAdjustment {
  return { ...raw, id: raw.stockAdjustmentId };
}

export async function fetchStockAdjustments(): Promise<StockAdjustment[]> {
  const rows = await unwrap(apiClient.get<RawStockAdjustment[]>("/stock-adjustment"));
  return rows.map(mapStockAdjustment);
}

export async function createStockAdjustment(
  payload: StockAdjustmentCreateRequest
): Promise<StockAdjustment> {
  const row = await unwrap(apiClient.post<RawStockAdjustment>("/stock-adjustment", payload));
  return mapStockAdjustment(row);
}

// ---- Shared reference data ----------------------------------------------------

export function fetchProductVariants(): Promise<ProductVariant[]> {
  return unwrap(apiClient.get<ProductVariant[]>("/product-variant"));
}
