"use client";
import { useState, useEffect, useRef } from "react";
import type { CartItem } from "../hooks/useCart";
import { persistFinishedSale } from "@/lib/actions/sales";
import type { PaymentMethod } from "@/lib/sale-data";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

type Props = {
  open: boolean;
  total: number;
  subtotal: number;
  discountAmt: number;
  items: CartItem[];
  cashSessionId: string;
  operator: string;
  onSuccess: (sale: { saleId: string; saleCode: string }) => void;
  onClose: () => void;
};

const METHODS: { method: PaymentMethod; label: string; icon: string }[] = [
  { method: "cash",   label: "Dinheiro", icon: "💵" },
  { method: "pix",    label: "PIX",      icon: "📱" },
  { method: "debit",  label: "Débito",   icon: "💳" },
  { method: "credit", label: "Crédito",  icon: "💳" },
];

export function PaymentModal({ open, total, subtotal, discountAmt, items, cashSessionId, operator, onSuccess, onClose }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [amountStr, setAmountStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setMethod("cash");
      setAmountStr(total.toFixed(2).replace(".", ","));
      setError("");
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, total]);

  const paid = parseFloat(amountStr.replace(",", ".")) || 0;
  const change = method === "cash" ? Math.max(0, paid - total) : 0;
  const canConfirm = paid >= total && items.length > 0;

  async function handleConfirm() {
    if (!canConfirm) return;
    setLoading(true);
    setError("");

    const sale = {
      id: crypto.randomUUID(),
      code: "",
      customerId: "",
      cashSessionId,
      operator,
      status: "finished" as const,
      createdAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      canceledAt: "",
      subtotal,
      discount: discountAmt,
      total,
      notes: "",
      payments: [{ id: crypto.randomUUID(), method, amount: paid }],
      items: items.map((i) => ({
        id: crypto.randomUUID(),
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discount: 0,
        total: i.total,
      })),
    };

    const result = await persistFinishedSale(sale);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    onSuccess({ saleId: result.data.id, saleCode: result.data.code });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && canConfirm && !loading) void handleConfirm();
  }

  if (!open) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={onKeyDown}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: 380,
          background: "#FFFFFF",
          border: "1px solid #E4E2DC",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.14)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #E4E2DC", background: "#F8F7F4" }}>
          <p style={{ margin: 0, fontSize: 11, color: "#A8A29E", letterSpacing: "0.12em", textTransform: "uppercase" }}>Pagamento</p>
          <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 800, color: "#EF9F27" }}>{fmt(total)}</p>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Method selector */}
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: "#A8A29E", textTransform: "uppercase", letterSpacing: "0.1em" }}>Forma de pagamento</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {METHODS.map(({ method: m, label, icon }) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: m === method ? "1px solid #EF9F27" : "1px solid #E4E2DC",
                    background: m === method ? "rgba(239,159,39,0.08)" : "#F8F7F4",
                    color: m === method ? "#B45309" : "#78716C",
                    fontSize: 13, fontWeight: m === method ? 600 : 400,
                    cursor: "pointer", transition: "all 120ms",
                  }}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "#A8A29E", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {method === "cash" ? "Valor recebido (R$)" : "Valor (R$)"}
            </p>
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              style={{
                width: "100%", height: 44,
                background: "#F8F7F4",
                border: "1px solid #E4E2DC",
                borderRadius: 8, padding: "0 14px",
                fontSize: 18, fontWeight: 700,
                color: "#1A1917", outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.select()}
            />
          </div>

          {/* Change */}
          {method === "cash" && change > 0 && (
            <div
              style={{
                background: "rgba(59,109,17,0.06)",
                border: "1px solid rgba(59,109,17,0.2)",
                borderRadius: 8, padding: "12px 16px",
                display: "flex", justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 13, color: "#3B6D11" }}>Troco</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#3B6D11" }}>{fmt(change)}</span>
            </div>
          )}

          {error && (
            <p style={{ margin: 0, fontSize: 12, color: "#EF4444", background: "rgba(239,68,68,0.06)", borderRadius: 6, padding: "8px 12px" }}>
              {error}
            </p>
          )}

          {/* Confirm */}
          <button
            type="button"
            disabled={!canConfirm || loading}
            onClick={() => void handleConfirm()}
            style={{
              height: 48, borderRadius: 10,
              background: canConfirm && !loading ? "#EF9F27" : "#F0EEE9",
              color: canConfirm && !loading ? "#1A1917" : "#A8A29E",
              fontWeight: 700, fontSize: 14, border: "none",
              cursor: canConfirm && !loading ? "pointer" : "not-allowed",
              transition: "all 150ms",
            }}
          >
            {loading ? "Finalizando…" : "Confirmar pagamento ↵"}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none", border: "none",
              fontSize: 12, color: "#A8A29E",
              cursor: "pointer", padding: "4px 0",
            }}
          >
            Cancelar (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
