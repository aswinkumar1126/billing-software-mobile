import { useQuery } from "@tanstack/react-query";

import type { PurchaseReportQuery } from "@/api/types";
import * as reportsApi from "@/features/reports/api/reportsApi";
import { toReportDateQuery, type ReportDateFilterValues } from "@/features/reports/reportDateFilter";

export interface PurchaseReportFilters extends ReportDateFilterValues {
  supplierId: number | null;
  variantId: number | null;
}

export function usePurchaseReport(filters: PurchaseReportFilters) {
  const query: PurchaseReportQuery = {
    ...toReportDateQuery(filters),
    supplierId: filters.supplierId ?? undefined,
    variantId: filters.variantId ?? undefined,
  };

  return useQuery({
    queryKey: ["purchase-report", query],
    queryFn: () => reportsApi.fetchPurchaseReport(query),
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: reportsApi.fetchSuppliers,
  });
}

export function useProductVariants() {
  return useQuery({
    queryKey: ["product-variants"],
    queryFn: reportsApi.fetchProductVariants,
  });
}
