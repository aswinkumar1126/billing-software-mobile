import { useQuery } from "@tanstack/react-query";

import type { SalesReportQuery } from "@/api/types";
import * as reportsApi from "@/features/reports/api/reportsApi";
import { toReportDateQuery, type ReportDateFilterValues } from "@/features/reports/reportDateFilter";

export interface SalesReportFilters extends ReportDateFilterValues {
  salesManId: number | null;
  paymentType: string | null;
  orderType: "IN" | "OUT" | null;
}

export function useSalesReport(filters: SalesReportFilters) {
  const query: SalesReportQuery = {
    ...toReportDateQuery(filters),
    salesManId: filters.salesManId ?? undefined,
    paymentType: filters.paymentType ?? undefined,
    orderType: filters.orderType ?? undefined,
  };

  return useQuery({
    queryKey: ["sales-report", query],
    queryFn: () => reportsApi.fetchSalesReport(query),
  });
}

export function useUsers(enabled: boolean) {
  return useQuery({
    queryKey: ["users"],
    queryFn: reportsApi.fetchUsers,
    enabled,
    retry: false,
  });
}
