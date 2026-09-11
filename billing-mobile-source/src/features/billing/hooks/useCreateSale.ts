import { useMutation, useQueryClient } from "@tanstack/react-query";

import * as billingApi from "@/features/billing/api/billingApi";
import type { SaleCreateRequest, SaleResponse } from "@/api/types/sale";

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation<SaleResponse, Error, SaleCreateRequest>({
    mutationFn: billingApi.createSale,
    onSuccess: () => {
      // Stock levels change after a sale — refresh so the grid reflects it.
      queryClient.invalidateQueries({ queryKey: ["stock-status"] });
    },
  });
}
