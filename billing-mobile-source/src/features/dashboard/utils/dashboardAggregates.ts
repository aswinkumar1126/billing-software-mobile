/**
 * Pure aggregation functions powering the Dashboard. Ported from the web
 * app's `src/module/dashboard/` — no dedicated backend endpoint exists, so
 * everything here is computed client-side from the sales/stock/purchase
 * list endpoints already used elsewhere in the app.
 */
import type { SaleResponse } from "@/api/types/sale";
import type { StockStatusRow } from "@/api/types/stock";
import { weekdayShort } from "@/utils/date";

export interface DailySalesPoint {
  date: string;
  label: string;
  total: number;
  bills: number;
}

export interface ProductDemandRow {
  variantId: number;
  variantName: string;
  qtySold: number;
  revenue: number;
}

export interface TodaySummary {
  totalSales: number;
  billCount: number;
  averageBillValue: number;
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function isSameDay(iso: string, reference: Date): boolean {
  return toDateKey(iso) === toDateKey(reference.toISOString());
}

export function summarizeToday(sales: SaleResponse[], now = new Date()): TodaySummary {
  const todays = sales.filter((sale) => isSameDay(sale.billDate, now));
  const totalSales = todays.reduce((sum, sale) => sum + sale.total, 0);
  const billCount = todays.length;
  return { totalSales, billCount, averageBillValue: billCount > 0 ? totalSales / billCount : 0 };
}

export function buildDailySalesTrend(sales: SaleResponse[], days = 7, now = new Date()): DailySalesPoint[] {
  // Trailing `days` days, oldest first, zero-filled for days with no sales.
  const buckets = new Map<string, DailySalesPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    // Build the key from local date fields (not toISOString, which is
    // UTC-based) to avoid an off-by-one near midnight in zones ahead of UTC.
    const localKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    buckets.set(localKey, { date: localKey, label: weekdayShort(d), total: 0, bills: 0 });
  }

  for (const sale of sales) {
    const key = toDateKey(sale.billDate);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.total += sale.total;
      bucket.bills += 1;
    }
  }

  return Array.from(buckets.values());
}

export function rankProductDemand(sales: SaleResponse[], limit = 5): ProductDemandRow[] {
  const byVariant = new Map<number, ProductDemandRow>();
  for (const sale of sales) {
    for (const item of sale.items) {
      const existing = byVariant.get(item.variantId);
      if (existing) {
        existing.qtySold += item.qty;
        existing.revenue += item.total;
      } else {
        byVariant.set(item.variantId, {
          variantId: item.variantId,
          variantName: item.variantName,
          qtySold: item.qty,
          revenue: item.total,
        });
      }
    }
  }

  return Array.from(byVariant.values())
    .sort((a, b) => b.qtySold - a.qtySold || b.revenue - a.revenue)
    .slice(0, limit);
}

export function splitStockAlerts(stock: StockStatusRow[]): {
  lowStock: StockStatusRow[];
  outOfStock: StockStatusRow[];
} {
  const lowStock = stock
    .filter((row) => row.status === "LOW_STOCK")
    .sort((a, b) => a.currentStock - b.currentStock);
  const outOfStock = stock
    .filter((row) => row.status === "OUT_OF_STOCK")
    .sort((a, b) => a.variantName.localeCompare(b.variantName));
  return { lowStock, outOfStock };
}

export function estimateAverageTurnover(sales: SaleResponse[], stock: StockStatusRow[]): number {
  const totalUnitsSold = sales.reduce(
    (sum, sale) => sum + sale.items.reduce((s, item) => s + item.qty, 0),
    0
  );
  const totalUnitsOnHand = stock.reduce((sum, row) => sum + Math.max(row.currentStock, 0), 0);
  if (totalUnitsOnHand === 0) {
    return totalUnitsSold > 0 ? totalUnitsSold : 0;
  }
  return totalUnitsSold / totalUnitsOnHand;
}

export function recentSales(sales: SaleResponse[], limit = 8): SaleResponse[] {
  return [...sales]
    .sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())
    .slice(0, limit);
}
