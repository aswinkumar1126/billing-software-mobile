import { useCallback, useMemo, useState } from "react";

import type { CartAddon, CartCharge, CartLine } from "@/api/types/sale";

export interface AddLineInput {
  variantId: number;
  variantName: string;
  productName: string;
  unitPrice: number;
}

function addonTotal(addon: CartAddon): number {
  return addon.unitPrice * addon.qty;
}

export function lineAddonsTotal(line: CartLine): number {
  return line.addons.reduce((sum, a) => sum + addonTotal(a), 0);
}

/** Line total = (unit price * qty) + all addon totals. */
export function lineTotal(line: CartLine): number {
  return line.unitPrice * line.qty + lineAddonsTotal(line);
}

export function chargeTotal(charge: CartCharge): number {
  return charge.price * charge.qty;
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [charges, setCharges] = useState<CartCharge[]>([]);

  /** Adds a variant to the cart, or increments its qty if already present. */
  const addLine = useCallback((input: AddLineInput, qty: number = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.key === input.variantId);
      if (existing) {
        return prev.map((l) => (l.key === input.variantId ? { ...l, qty: l.qty + qty } : l));
      }
      const newLine: CartLine = {
        key: input.variantId,
        variantId: input.variantId,
        variantName: input.variantName,
        productName: input.productName,
        qty,
        unitPrice: input.unitPrice,
        addons: [],
      };
      return [...prev, newLine];
    });
  }, []);

  /** Setting qty to 0 or below removes the line entirely. */
  const setLineQty = useCallback((variantId: number, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) {
        return prev.filter((l) => l.key !== variantId);
      }
      return prev.map((l) => (l.key === variantId ? { ...l, qty } : l));
    });
  }, []);

  const removeLine = useCallback((variantId: number) => {
    setLines((prev) => prev.filter((l) => l.key !== variantId));
  }, []);

  /** Adds an addon to a line, or increments its qty if already present on that line. */
  const addAddon = useCallback(
    (variantId: number, addon: { addonId: number; addonName: string; unitPrice: number }, qty: number = 1) => {
      setLines((prev) =>
        prev.map((l) => {
          if (l.key !== variantId) return l;
          const existing = l.addons.find((a) => a.addonId === addon.addonId);
          if (existing) {
            return {
              ...l,
              addons: l.addons.map((a) =>
                a.addonId === addon.addonId ? { ...a, qty: a.qty + qty } : a
              ),
            };
          }
          return { ...l, addons: [...l.addons, { ...addon, qty }] };
        })
      );
    },
    []
  );

  /** Setting an addon's qty to 0 or below removes it from the line. */
  const setAddonQty = useCallback((variantId: number, addonId: number, qty: number) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.key !== variantId) return l;
        if (qty <= 0) {
          return { ...l, addons: l.addons.filter((a) => a.addonId !== addonId) };
        }
        return {
          ...l,
          addons: l.addons.map((a) => (a.addonId === addonId ? { ...a, qty } : a)),
        };
      })
    );
  }, []);

  /** Adds an additional charge, or increments its qty if already present. */
  const addCharge = useCallback(
    (charge: { additionalChargeId: number; name: string; price: number }, qty: number = 1) => {
      setCharges((prev) => {
        const existing = prev.find((c) => c.additionalChargeId === charge.additionalChargeId);
        if (existing) {
          return prev.map((c) =>
            c.additionalChargeId === charge.additionalChargeId ? { ...c, qty: c.qty + qty } : c
          );
        }
        return [...prev, { ...charge, qty }];
      });
    },
    []
  );

  /** Setting a charge's qty to 0 or below removes it. */
  const setChargeQty = useCallback((additionalChargeId: number, qty: number) => {
    setCharges((prev) => {
      if (qty <= 0) {
        return prev.filter((c) => c.additionalChargeId !== additionalChargeId);
      }
      return prev.map((c) => (c.additionalChargeId === additionalChargeId ? { ...c, qty } : c));
    });
  }, []);

  const removeCharge = useCallback((additionalChargeId: number) => {
    setCharges((prev) => prev.filter((c) => c.additionalChargeId !== additionalChargeId));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setCharges([]);
  }, []);

  /** Sum of all line totals (unit price * qty + addons), excluding additional charges. */
  const itemsTotal = useMemo(() => lines.reduce((sum, l) => sum + lineTotal(l), 0), [lines]);

  /** Sum of all additional charge totals. */
  const chargesTotal = useMemo(() => charges.reduce((sum, c) => sum + chargeTotal(c), 0), [charges]);

  /** Sub total = items total + charges total (pre discount/tax). */
  const subTotal = useMemo(() => itemsTotal + chargesTotal, [itemsTotal, chargesTotal]);

  return {
    lines,
    charges,
    addLine,
    setLineQty,
    removeLine,
    addAddon,
    setAddonQty,
    addCharge,
    setChargeQty,
    removeCharge,
    clear,
    lineTotal,
    itemsTotal,
    chargesTotal,
    subTotal,
  };
}

export type UseCartReturn = ReturnType<typeof useCart>;
