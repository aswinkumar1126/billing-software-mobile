import { useQuery } from "@tanstack/react-query";

import type { StockReportQuery } from "@/api/types";
import * as reportsApi from "@/features/reports/api/reportsApi";
import { toDateKey, type ReportDateFilterValues } from "@/features/reports/reportDateFilter";

export interface StockReportFilters extends ReportDateFilterValues {
  variantId: number | null;
}

/**
 * Stock report is point-in-time only — no true range. A range mode's toDate
 * is read as the as-of boundary, per the web app's resolveAsOfKey helper.
 */
function resolveAsOfKey(filters: Pick<ReportDateFilterValues, "dateMode" | "toDate" | "asOnDate">): string | undefined {
  const date = filters.dateMode === "asOn" ? filters.asOnDate : filters.toDate;
  return date ? toDateKey(date) : undefined;
}

export function useStockReport(filters: StockReportFilters) {
  const query: StockReportQuery = {
    asOfDate: resolveAsOfKey(filters),
    variantId: filters.variantId ?? undefined,
  };

  return useQuery({
    queryKey: ["stock-report", query],
    queryFn: () => reportsApi.fetchStockReport(query),
  });
}
