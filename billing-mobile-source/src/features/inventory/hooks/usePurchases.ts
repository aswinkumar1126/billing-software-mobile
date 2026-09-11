import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Purchase, PurchaseCreateRequest } from "@/api/types";
import * as inventoryApi from "@/features/inventory/api/inventoryApi";

export function usePurchaseList() {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: inventoryApi.fetchPurchases,
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: inventoryApi.fetchSuppliers,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation<Purchase, Error, PurchaseCreateRequest>({
    mutationFn: inventoryApi.createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["stock-status"] });
    },
  });
}
