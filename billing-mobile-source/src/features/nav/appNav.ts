/**
 * Mirrors the web app's src/module/.../appNav.ts nav structure, adapted to
 * the mobile tab layout. Each leaf item names the permission code that
 * gates it; `undefined` means always visible.
 */
export interface NavItem {
  label: string;
  /** Permission code required to see this item; undefined = always visible. */
  permission?: string;
}

export const HOME_NAV: NavItem = { label: "Home" };

export const BILLING_NAV: NavItem = { label: "Billing", permission: "SALES_CREATE" };

export const INVENTORY_NAV: NavItem[] = [
  { label: "Opening Stock", permission: "OPENING_STOCK_VIEW" },
  { label: "Purchase", permission: "PURCHASE_VIEW" },
  { label: "Stock Adjustment", permission: "STOCK_ADJUSTMENT_VIEW" },
  { label: "Stock Status", permission: "STOCK_VIEW" },
];

export const REPORTS_NAV: NavItem[] = [
  { label: "Sales Report", permission: "SALES_CREATE" },
  { label: "Purchase Report", permission: "PURCHASE_VIEW" },
  { label: "Stock Report", permission: "STOCK_VIEW" },
];
