import { useCallback, useMemo, useState } from "react";

/** One line item in the purchase-creation cart (local UI state only). */
export interface PurchaseCartLine {
  /** Equal to variantId — a variant only ever occupies one line. */
  key: number;
  variantId: number;
  variantName: string;
  unit: string;
  qty: number;
  purchasePrice: number;
  discount: number;
  tax: number;
}

export function lineAmount(line: PurchaseCartLine): number {
  const gross = line.qty * line.purchasePrice;
  return Math.max(0, gross - line.discount + line.tax);
}

/** Local cart hook for the Purchase creation form — modeled loosely on billing's useCart. */
export function usePurchaseCart() {
  const [lines, setLines] = useState<PurchaseCartLine[]>([]);

  const addLine = useCallback((variant: { variantId: number; variantName: string; unit: string }) => {
    setLines((prev) => {
      if (prev.some((l) => l.key === variant.variantId)) {
        return prev;
      }
      const newLine: PurchaseCartLine = {
        key: variant.variantId,
        variantId: variant.variantId,
        variantName: variant.variantName,
        unit: variant.unit,
        qty: 1,
        purchasePrice: 0,
        discount: 0,
        tax: 0,
      };
      return [...prev, newLine];
    });
  }, []);

  const updateLine = useCallback((variantId: number, patch: Partial<PurchaseCartLine>) => {
    setLines((prev) => prev.map((l) => (l.key === variantId ? { ...l, ...patch } : l)));
  }, []);

  const removeLine = useCallback((variantId: number) => {
    setLines((prev) => prev.filter((l) => l.key !== variantId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const subTotal = useMemo(() => lines.reduce((sum, l) => sum + l.qty * l.purchasePrice, 0), [lines]);
  const totalDiscount = useMemo(() => lines.reduce((sum, l) => sum + l.discount, 0), [lines]);
  const totalTax = useMemo(() => lines.reduce((sum, l) => sum + l.tax, 0), [lines]);
  const total = useMemo(() => lines.reduce((sum, l) => sum + lineAmount(l), 0), [lines]);

  return {
    lines,
    addLine,
    updateLine,
    removeLine,
    clear,
    lineAmount,
    subTotal,
    totalDiscount,
    totalTax,
    total,
  };
}

export type UsePurchaseCartReturn = ReturnType<typeof usePurchaseCart>;
