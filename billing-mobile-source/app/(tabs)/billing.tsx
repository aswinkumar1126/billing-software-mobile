import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiError } from "@/api/client";
import type { Product } from "@/api/types/product";
import type { SaleCreateRequest } from "@/api/types/sale";
import type { ProductVariant } from "@/api/types/variant";
import { CartSheet } from "@/features/billing/components/CartSheet";
import { ProductGrid } from "@/features/billing/components/ProductGrid";
import { useBillingData } from "@/features/billing/hooks/useBillingData";
import { useCart } from "@/features/billing/hooks/useCart";
import { useCreateSale } from "@/features/billing/hooks/useCreateSale";
import { buildStockMap, isVariantLocked } from "@/features/billing/stockLock";
import { colors, radii, shadow, spacing } from "@/theme/colors";

export default function BillingScreen() {
  const {
    categories,
    products,
    variants,
    addOns,
    additionalCharges,
    stockStatus,
    isLoading,
    isError,
    refetchAll,
  } = useBillingData();

  const cart = useCart();
  const createSale = useCreateSale();
  const [cartVisible, setCartVisible] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stockByVariantId = useMemo(() => buildStockMap(stockStatus), [stockStatus]);
  const variantsById = useMemo(() => new Map(variants.map((v) => [v.variantId, v])), [variants]);

  const cartItemCount = cart.lines.reduce((sum, l) => sum + l.qty, 0);

  const handleAddVariant = (variant: ProductVariant, product: Product | undefined) => {
    if (isVariantLocked(variant, stockByVariantId)) {
      return;
    }
    cart.addLine({
      variantId: variant.variantId,
      variantName: variant.variantName,
      productName: product?.productName ?? variant.product.productName ?? "Item",
      unitPrice: variant.price,
    });
  };

  const handleSubmit = async ({
    paymentType,
    orderType,
    discount,
    tax,
  }: {
    paymentType: string;
    orderType: "IN" | "OUT";
    discount: number;
    tax: number;
  }) => {
    setSubmitError(null);
    const payload: SaleCreateRequest = {
      paymentType,
      orderType,
      discount,
      tax,
      items: cart.lines.map((line) => ({
        variantId: line.variantId,
        qty: line.qty,
        unitPrice: line.unitPrice,
        addons: line.addons.map((addon) => ({
          addonId: addon.addonId,
          unitPrice: addon.unitPrice,
          qty: addon.qty,
        })),
      })),
      additionalCharges: cart.charges.map((charge) => ({
        additionalChargeId: charge.additionalChargeId,
        price: charge.price,
        qty: charge.qty,
      })),
    };

    try {
      const sale = await createSale.mutateAsync(payload);
      cart.clear();
      setCartVisible(false);
      Alert.alert("Sale completed", `Bill No: ${sale.billNo}`);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not complete the sale. Please try again.";
      setSubmitError(message);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerFill}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading products…</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.centerFill}>
        <Text style={styles.errorTitle}>Couldn't load billing data</Text>
        <Text style={styles.errorSubtitle}>Check your connection to the server and try again.</Text>
        <Pressable style={styles.retryBtn} onPress={refetchAll}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Billing</Text>
      </View>

      <ProductGrid
        categories={categories}
        products={products}
        variants={variants}
        stockStatus={stockStatus}
        onAddVariant={handleAddVariant}
      />

      {cartItemCount > 0 && (
        <Pressable style={styles.cartFab} onPress={() => setCartVisible(true)}>
          <Text style={styles.cartFabText}>View Cart ({cartItemCount})</Text>
        </Pressable>
      )}

      <CartSheet
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        cart={cart}
        variantsById={variantsById}
        stockByVariantId={stockByVariantId}
        addOns={addOns}
        additionalCharges={additionalCharges}
        onSubmit={handleSubmit}
        isSubmitting={createSale.isPending}
        submitError={submitError}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, padding: 24 },
  loadingText: { marginTop: 12, color: colors.textSecondary, fontSize: 14 },
  errorTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 6 },
  errorSubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: "center", marginBottom: 16 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: 20, paddingVertical: 12 },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  headerRow: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: colors.textPrimary },
  cartFab: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: "center",
    ...shadow.fab,
  },
  cartFabText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
