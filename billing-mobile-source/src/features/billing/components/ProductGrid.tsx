import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { Category, Product } from "@/api/types/product";
import type { StockStatusRow } from "@/api/types/stock";
import type { ProductVariant } from "@/api/types/variant";
import { categoryEmoji, formatCurrency } from "@/features/billing/format";
import { buildStockMap, isVariantLocked } from "@/features/billing/stockLock";
import { colors, radii, shadow, spacing } from "@/theme/colors";

interface Props {
  categories: Category[];
  products: Product[];
  variants: ProductVariant[];
  stockStatus: StockStatusRow[];
  onAddVariant: (variant: ProductVariant, product: Product | undefined) => void;
}

const ALL_CATEGORY_ID = -1;

export function ProductGrid({ categories, products, variants, stockStatus, onAddVariant }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<number>(ALL_CATEGORY_ID);
  const [search, setSearch] = useState("");

  const stockMap = useMemo(() => buildStockMap(stockStatus), [stockStatus]);
  const productById = useMemo(() => new Map(products.map((p) => [p.productId, p])), [products]);

  const activeCategories = useMemo(() => categories.filter((c) => c.active), [categories]);

  const filteredVariants = useMemo(() => {
    const query = search.trim().toLowerCase();
    return variants.filter((v) => {
      if (!v.active) return false;
      const product = productById.get(v.product.productId);
      if (product && !product.active) return false;

      if (selectedCategory !== ALL_CATEGORY_ID) {
        const categoryId = product?.category?.categoryId;
        if (categoryId !== selectedCategory) return false;
      }

      if (query) {
        const productName = (product?.productName ?? v.product.productName ?? "").toLowerCase();
        const variantName = v.variantName.toLowerCase();
        if (!productName.includes(query) && !variantName.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [variants, productById, selectedCategory, search]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search products..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
      />

      <FlatList
        data={[{ categoryId: ALL_CATEGORY_ID, categoryName: "All", active: true }, ...activeCategories]}
        horizontal
        keyExtractor={(item) => String(item.categoryId)}
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
        contentContainerStyle={styles.categoryListContent}
        renderItem={({ item }) => {
          const selected = item.categoryId === selectedCategory;
          return (
            <Pressable
              onPress={() => setSelectedCategory(item.categoryId)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {item.categoryName}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={filteredVariants}
        keyExtractor={(item) => String(item.variantId)}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => {
          const product = productById.get(item.product.productId);
          const locked = isVariantLocked(item, stockMap);
          return (
            <Pressable
              disabled={locked}
              onPress={() => onAddVariant(item, product)}
              style={[styles.card, locked && styles.cardLocked]}
            >
              <View style={styles.cardImageWrap}>
                {product?.image ? (
                  <Image source={{ uri: product.image }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.cardEmoji}>{categoryEmoji(product?.category?.categoryName)}</Text>
                )}
                {locked && (
                  <View style={styles.outOfStockBadge}>
                    <Text style={styles.outOfStockText}>Out of stock</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardProductName} numberOfLines={1}>
                {product?.productName ?? item.product.productName ?? "Unnamed"}
              </Text>
              <Text style={styles.cardVariantName} numberOfLines={1}>
                {item.variantName}
              </Text>
              <Text style={styles.cardPrice}>{formatCurrency(item.price)}</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No products found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.textPrimary,
  },
  categoryList: { flexGrow: 0, marginBottom: 8 },
  categoryListContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  chipTextSelected: { color: "#FFFFFF" },
  gridContent: { paddingHorizontal: 12, paddingBottom: 24 },
  gridRow: { gap: 12 },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardLocked: { opacity: 0.5 },
  cardImageWrap: {
    width: "100%",
    height: 84,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: "100%" },
  cardEmoji: { fontSize: 36 },
  outOfStockBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: "rgba(220, 38, 38, 0.92)",
    borderRadius: 6,
    paddingVertical: 2,
    alignItems: "center",
  },
  outOfStockText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  cardProductName: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  cardVariantName: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  cardPrice: { fontSize: 14, fontWeight: "800", color: colors.primary, marginTop: 4 },
  emptyWrap: { padding: 32, alignItems: "center" },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
});
