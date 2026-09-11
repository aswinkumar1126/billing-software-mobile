export function formatCurrency(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `₹${safe.toFixed(2)}`;
}

/** Simple deterministic emoji fallback for products without an image, based on category name. */
export function categoryEmoji(categoryName?: string): string {
  if (!categoryName) return "🛒";
  const name = categoryName.toLowerCase();
  if (name.includes("drink") || name.includes("beverage")) return "🥤";
  if (name.includes("coffee") || name.includes("tea")) return "☕";
  if (name.includes("dessert") || name.includes("sweet") || name.includes("cake")) return "🍰";
  if (name.includes("pizza")) return "🍕";
  if (name.includes("burger")) return "🍔";
  if (name.includes("rice") || name.includes("biryani")) return "🍛";
  if (name.includes("noodle") || name.includes("pasta")) return "🍜";
  if (name.includes("bread") || name.includes("bakery")) return "🥖";
  if (name.includes("snack")) return "🍟";
  if (name.includes("salad") || name.includes("veg")) return "🥗";
  if (name.includes("meat") || name.includes("chicken")) return "🍗";
  if (name.includes("seafood") || name.includes("fish")) return "🐟";
  return "🍽️";
}
