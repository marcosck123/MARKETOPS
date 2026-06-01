"use client";
import { useState, useCallback } from "react";
import type { Product } from "@/lib/product-data";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  total: number;
};

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [discountPct, setDiscountPct] = useState(0);

  const addProduct = useCallback((product: Product, qty = 1) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.productId === product.id);
      if (existingIdx >= 0) {
        const updated = prev.map((item, i) => {
          if (i !== existingIdx) return item;
          const newQty = item.quantity + qty;
          return { ...item, quantity: newQty, total: newQty * item.unitPrice };
        });
        setSelectedIndex(existingIdx);
        return updated;
      }
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        unit: product.unit,
        unitPrice: product.salePrice,
        quantity: qty,
        total: qty * product.salePrice,
      };
      const newIdx = prev.length;
      setSelectedIndex(newIdx);
      return [...prev, newItem];
    });
  }, []);

  const removeSelected = useCallback(() => {
    setItems((prev) => {
      if (prev.length === 0 || selectedIndex < 0) return prev;
      const next = prev.filter((_, i) => i !== selectedIndex);
      setSelectedIndex(next.length === 0 ? -1 : Math.min(selectedIndex, next.length - 1));
      return next;
    });
  }, [selectedIndex]);

  const clearCart = useCallback(() => {
    setItems([]);
    setSelectedIndex(-1);
    setDiscountPct(0);
  }, []);

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const discountAmt = subtotal * (discountPct / 100);
  const total = subtotal - discountAmt;

  return {
    items,
    selectedIndex,
    setSelectedIndex,
    discountPct,
    setDiscountPct,
    addProduct,
    removeSelected,
    clearCart,
    subtotal,
    discountAmt,
    total,
  };
}
