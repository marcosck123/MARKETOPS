"use client";

import type { CartItem } from "../hooks/useCart";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

type Props = {
  items: CartItem[];
  selectedIndex: number;
  onSelectIndex: (i: number) => void;
  subtotal: number;
  discountAmt: number;
  discountPct: number;
  total: number;
};

export function Cart({ items, selectedIndex, onSelectIndex, subtotal, discountAmt, discountPct, total }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 48px 80px",
          padding: "8px 20px",
          borderBottom: "1px solid #E4E2DC",
          gap: 8,
          background: "#F8F7F4",
        }}
      >
        {(["Produto", "Qtd", "Valor"] as const).map((h) => (
          <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "#A8A29E", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {items.length === 0 ? (
          <div
            style={{
              height: "100%", minHeight: 180,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 36, opacity: 0.3 }}>🛒</span>
            <p style={{ fontSize: 13, color: "#C7C5BF", margin: 0 }}>Carrinho vazio</p>
            <p style={{ fontSize: 11, color: "#D6D4CE", margin: 0 }}>Pressione F1 para buscar produtos</p>
          </div>
        ) : (
          items.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectIndex(idx)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 48px 80px",
                  width: "100%",
                  padding: "10px 20px",
                  gap: 8,
                  textAlign: "left",
                  background: isSelected ? "rgba(239,159,39,0.06)" : "transparent",
                  borderLeft: isSelected ? "2px solid #EF9F27" : "2px solid transparent",
                  borderRight: "none", borderTop: "none",
                  borderBottom: "1px solid #F0EEE9",
                  cursor: "pointer",
                  transition: "background 120ms",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1A1917", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 10, color: "#A8A29E" }}>{item.sku}</p>
                </div>
                <span style={{ fontSize: 13, color: "#57534E", alignSelf: "center" }}>
                  {item.quantity}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1917", alignSelf: "center", textAlign: "right" }}>
                  {fmt(item.total)}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Totals footer */}
      <div
        style={{
          borderTop: "1px solid #E4E2DC",
          padding: "14px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          background: "#F8F7F4",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#A8A29E" }}>Subtotal</span>
          <span style={{ fontSize: 12, color: "#78716C" }}>{fmt(subtotal)}</span>
        </div>
        {discountPct > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "#EF4444" }}>Desconto ({discountPct}%)</span>
            <span style={{ fontSize: 12, color: "#EF4444" }}>− {fmt(discountAmt)}</span>
          </div>
        )}
        <div
          style={{
            display: "flex", justifyContent: "space-between",
            paddingTop: 8, borderTop: "1px solid #E4E2DC", marginTop: 2,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1917" }}>TOTAL</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#EF9F27" }}>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}
