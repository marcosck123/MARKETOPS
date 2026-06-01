"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Product } from "@/lib/product-data";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

type Props = {
  open: boolean;
  products: Product[];
  onAdd: (product: Product) => void;
  onClose: () => void;
};

export function SearchModal({ open, products, onAdd, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? products.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.sku.toLowerCase().includes(q)
        );
      })
    : products.slice(0, 20);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlightIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setHighlightIdx(0);
  }, [query]);

  const confirmItem = useCallback(
    (product: Product) => {
      if (product.currentStock === 0) return;
      onAdd(product);
      onClose();
    },
    [onAdd, onClose],
  );

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[highlightIdx];
      if (item) confirmItem(item);
    }
  }

  useEffect(() => {
    const el = listRef.current?.children[highlightIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIdx]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(2px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", paddingTop: 80,
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: 600,
          background: "#FFFFFF",
          borderRadius: 14,
          border: "1px solid #E4E2DC",
          boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          maxHeight: "calc(100vh - 160px)",
        }}
      >
        {/* Input */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "0 18px",
            borderBottom: "1px solid #E4E2DC",
            background: "#F8F7F4",
          }}
        >
          <span style={{ fontSize: 16, color: "#C7C5BF", flexShrink: 0 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Nome, código de barras ou SKU…"
            style={{
              flex: 1, height: 52, background: "transparent",
              border: "none", outline: "none",
              fontSize: 15, color: "#1A1917",
            }}
          />
          <kbd
            style={{
              fontSize: 10, color: "#A8A29E",
              border: "1px solid #E4E2DC", borderRadius: 4,
              padding: "2px 6px", flexShrink: 0,
              background: "#FFFFFF",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <p style={{ padding: "24px 20px", textAlign: "center", fontSize: 13, color: "#A8A29E", margin: 0 }}>
              Nenhum produto encontrado
            </p>
          ) : (
            filtered.map((product, idx) => {
              const isZero = product.currentStock === 0;
              const isLow = !isZero && product.currentStock <= product.minimumStock;
              const isHighlighted = idx === highlightIdx;
              return (
                <button
                  key={product.id}
                  type="button"
                  disabled={isZero}
                  onClick={() => confirmItem(product)}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  style={{
                    display: "flex", alignItems: "center",
                    width: "100%", padding: "10px 18px", gap: 12,
                    textAlign: "left", border: "none",
                    background: isHighlighted ? "rgba(239,159,39,0.06)" : "#FFFFFF",
                    borderLeft: isHighlighted ? "2px solid #EF9F27" : "2px solid transparent",
                    borderBottom: "1px solid #F0EEE9",
                    borderRight: "none", borderTop: "none",
                    cursor: isZero ? "not-allowed" : "pointer",
                    opacity: isZero ? 0.45 : 1,
                    transition: "background 80ms",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1A1917", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {product.name}
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: "#A8A29E" }}>
                      {product.sku} · {product.barcode}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1A1917" }}>
                      {fmt(product.salePrice)}
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: isZero ? "#EF4444" : isLow ? "#854F0B" : "#3B6D11" }}>
                      {isZero ? "Sem estoque" : `${product.currentStock} ${product.unit}`}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div
          style={{
            padding: "8px 18px", borderTop: "1px solid #E4E2DC",
            display: "flex", gap: 16, background: "#F8F7F4",
          }}
        >
          {[["↑↓", "Navegar"], ["↵", "Adicionar"], ["Esc", "Fechar"]].map(([key, label]) => (
            <span key={key} style={{ fontSize: 10, color: "#A8A29E", display: "flex", gap: 4, alignItems: "center" }}>
              <kbd style={{ border: "1px solid #E4E2DC", borderRadius: 3, padding: "1px 5px", color: "#78716C", fontSize: 10, background: "#FFFFFF" }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
