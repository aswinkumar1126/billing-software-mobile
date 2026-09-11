import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { OpeningStock, OpeningStockCreateRequest } from "@/api/types";
import * as inventoryApi from "@/features/inventory/api/inventoryApi";

export function useOpeningStockList() {
  return useQuery({
    queryKey: ["opening-stock"],
    queryFn: inventoryApi.fetchOpeningStock,
  });
}

export function useCreateOpeningStock() {
  const queryClient = useQueryClient();
  return useMutation<OpeningStock, Error, OpeningStockCreateRequest>({
    mutationFn: inventoryApi.createOpeningStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opening-stock"] });
      queryClient.invalidateQueries({ queryKey: ["stock-status"] });
    },
  });
}
