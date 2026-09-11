import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { StockAdjustment, StockAdjustmentCreateRequest } from "@/api/types";
import * as inventoryApi from "@/features/inventory/api/inventoryApi";

export function useStockAdjustmentList() {
  return useQuery({
    queryKey: ["stock-adjustments"],
    queryFn: inventoryApi.fetchStockAdjustments,
  });
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();
  return useMutation<StockAdjustment, Error, StockAdjustmentCreateRequest>({
    mutationFn: inventoryApi.createStockAdjustment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["stock-status"] });
    },
  });
}
