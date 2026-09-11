import { useQuery } from "@tanstack/react-query";

import * as inventoryApi from "@/features/inventory/api/inventoryApi";

export function useProductVariants() {
  return useQuery({
    queryKey: ["product-variants"],
    queryFn: inventoryApi.fetchProductVariants,
  });
}
