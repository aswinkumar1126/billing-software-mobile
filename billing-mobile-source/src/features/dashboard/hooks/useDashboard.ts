import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import * as billingApi from "@/features/billing/api/billingApi";
import * as inventoryApi from "@/features/inventory/api/inventoryApi";
import {
  buildDailySalesTrend,
  estimateAverageTurnover,
  rankProductDemand,
  recentSales,
  splitStockAlerts,
  summarizeToday,
} from "@/features/dashboard/utils/dashboardAggregates";

interface UseDashboardOptions {
  /** When false, the sales/stock/purchase queries don't fire at all. */
  enabled?: boolean;
}

export function useDashboard({ enabled = true }: UseDashboardOptions = {}) {
  const salesQuery = useQuery({
    queryKey: ["dashboard-sales"],
    queryFn: billingApi.fetchSales,
    enabled,
  });
  const stockQuery = useQuery({
    queryKey: ["stock-status"],
    queryFn: inventoryApi.fetchStockStatus,
    enabled,
  });
  const purchaseQuery = useQuery({
    queryKey: ["purchases"],
    queryFn: inventoryApi.fetchPurchases,
    enabled,
  });

  const sales = salesQuery.data ?? [];
  const stock = stockQuery.data ?? [];
  const purchases = purchaseQuery.data ?? [];

  const today = useMemo(() => summarizeToday(sales), [sales]);
  const trend = useMemo(() => buildDailySalesTrend(sales, 7), [sales]);
  const topProducts = useMemo(() => rankProductDemand(sales, 5), [sales]);
  const { lowStock, outOfStock } = useMemo(() => splitStockAlerts(stock), [stock]);
  const averageTurnover = useMemo(() => estimateAverageTurnover(sales, stock), [sales, stock]);
  const recent = useMemo(() => recentSales(sales, 8), [sales]);

  return {
    today,
    trend,
    topProducts,
    lowStock,
    outOfStock,
    averageTurnover,
    recent,
    stockCount: stock.length,
    purchaseCount: purchases.length,
    isLoading: enabled && (salesQuery.isLoading || stockQuery.isLoading || purchaseQuery.isLoading),
    isError: salesQuery.isError || stockQuery.isError || purchaseQuery.isError,
    refetch: () => {
      salesQuery.refetch();
      stockQuery.refetch();
      purchaseQuery.refetch();
    },
    isFetching: salesQuery.isFetching || stockQuery.isFetching || purchaseQuery.isFetching,
  };
}
