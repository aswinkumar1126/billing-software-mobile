import { useQuery } from "@tanstack/react-query";

import * as inventoryApi from "@/features/inventory/api/inventoryApi";

export function useStockStatus() {
  return useQuery({
    queryKey: ["stock-status"],
    queryFn: inventoryApi.fetchStockStatus,
  });
}
