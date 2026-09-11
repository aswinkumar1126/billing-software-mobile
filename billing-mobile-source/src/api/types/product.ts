/** Product / Category domain types (settings module). */

export interface Category {
  categoryId: number;
  categoryName: string;
  active: boolean;
}

export interface Product {
  productId: number;
  productName: string;
  active: boolean;
  image?: string | null;
  category?: Category;
}
