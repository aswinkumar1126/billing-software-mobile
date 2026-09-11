import { useQuery } from "@tanstack/react-query";

import * as billingApi from "@/features/billing/api/billingApi";

/**
 * All the reference data the billing screen's product grid, addon picker and
 * charge picker need. Kept as separate queries (rather than one combined
 * query) so each can be refetched/invalidated independently and partial
 * failures don't blank the whole screen.
 */
export function useBillingData() {
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: billingApi.fetchCategories,
  });

  const products = useQuery({
    queryKey: ["products"],
    queryFn: billingApi.fetchProducts,
  });

  const variants = useQuery({
    queryKey: ["product-variants"],
    queryFn: billingApi.fetchProductVariants,
  });

  const addOns = useQuery({
    queryKey: ["addons"],
    queryFn: billingApi.fetchAddOns,
  });

  const additionalCharges = useQuery({
    queryKey: ["additional-charges"],
    queryFn: billingApi.fetchAdditionalCharges,
  });

  const stockStatus = useQuery({
    queryKey: ["stock-status"],
    queryFn: billingApi.fetchStockStatus,
  });

  const isLoading =
    categories.isLoading ||
    products.isLoading ||
    variants.isLoading ||
    addOns.isLoading ||
    additionalCharges.isLoading ||
    stockStatus.isLoading;

  const isError =
    categories.isError ||
    products.isError ||
    variants.isError ||
    addOns.isError ||
    additionalCharges.isError ||
    stockStatus.isError;

  const refetchAll = () => {
    categories.refetch();
    products.refetch();
    variants.refetch();
    addOns.refetch();
    additionalCharges.refetch();
    stockStatus.refetch();
  };

  return {
    categories: categories.data ?? [],
    products: products.data ?? [],
    variants: variants.data ?? [],
    addOns: addOns.data ?? [],
    additionalCharges: additionalCharges.data ?? [],
    stockStatus: stockStatus.data ?? [],
    isLoading,
    isError,
    refetchAll,
  };
}
