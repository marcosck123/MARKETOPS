"use client";
import { useState, useEffect, useRef } from "react";
import type { Product } from "@/lib/product-data";
import type { ActiveSession } from "@/lib/actions/cash-sessions";
import { closeCashSession } from "@/lib/actions/cash-sessions";
import { useRouter } from "next/navigation";

import { useCart } from "../hooks/useCart";
import { useKeyboard } from "../hooks/useKeyboard";
import { PromoCarousel, type PromoItem } from "./PromoCarousel";
import { Cart } from "./Cart";
import { SearchModal } from "./SearchModal";
import { PaymentModal } from "./PaymentModal";

type Props = {
  products: Product[];
  cashSession: ActiveSession;
  promotions: PromoItem[];
  companyName: string;
  slogan?: string;
};

type ActiveModal = "search" | "payment" | "discount" | "close" | null;

const SHORTCUTS = [
  { key: "F1",  label: "Buscar" },
  { key: "F2",  label: "Pagamento" },
  { key: "F3",  label: "Desconto" },
  { key: "F4",  label: "Remover" },
  { key: "F12", label: "Fechar caixa" },
];

export function PdvClient({ products, cashSession, promotions, companyName, slogan }: Props) {
  const router = useRouter();
  const cart = useCart();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const [discountInput, setDiscountInput] = useState("");
  const discountRef = useRef<HTMLInputElement>(null);

  const [closingBalance, setClosingBalance] = useState("");
  const [closeLoading, setCloseLoading] = useState(false);
  const [closeError, setCloseError] = useState("");

  const [clock, setClock] = useState(() => new Date().toLocaleTimeString("pt-BR"));
  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString("pt-BR")), 1000);
    return () => clearInterval(t);
  }, []);

  const noModal = activeModal === null;

  useKeyboard({
    enabled: noModal,
    onF1:  () => setActiveModal("search"),
    onF2:  () => cart.items.length > 0 && setActiveModal("payment"),
    onF3:  () => { setDiscountInput(cart.discountPct.toString()); setActiveModal("discount"); },
    onF4:  () => cart.removeSelected(),
    onF12: () => { setClosingBalance(""); setCloseError(""); setActiveModal("close"); },
    onArrowUp:   () => cart.setSelectedIndex(Math.max(0, cart.selectedIndex - 1)),
    onArrowDown: () => cart.setSelectedIndex(Math.min(cart.items.length - 1, cart.selectedIndex + 1)),
  });

  useEffect(() => {
    if (activeModal === "discount") setTimeout(() => discountRef.current?.focus(), 60);
  }, [activeModal]);

  function applyDiscount() {
    const val = parseFloat(discountInput.replace(",", "."));
    if (!Number.isNaN(val) && val >= 0 && val <= 100) cart.setDiscountPct(val);
    setActiveModal(null);
  }

  async function handleCloseSession() {
    const balance = parseFloat(closingBalance.replace(",", "."));
    if (Number.isNaN(balance) || balance < 0) {
      setCloseError("Informe o saldo de fechamento.");
      return;
    }
    setCloseLoading(true);
    const result = await closeCashSession({ sessionId: cashSession.id, closingBalance: balance });
    setCloseLoading(false);
    if (!result.success) { setCloseError(result.error ?? "Erro ao fechar o caixa."); return; }
    router.refresh();
  }

  return (
    <>
      {/* Main layout */}
      <div style={{ display: "flex", height: "100dvh", overflow: "hidden" }}>

        {/* Left panel — promo / brand */}
        <div style={{ width: "50%", flexShrink: 0, borderRight: "1px solid #E4E2DC" }}>
          <PromoCarousel promotions={promotions} companyName={companyName} slogan={slogan} />
        </div>

        {/* Right panel — POS */}
        <div style={{ width: "50%", display: "flex", flexDirection: "column", background: "#FFFFFF", overflow: "hidden" }}>

          {/* Top bar: clock + session info */}
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 20px",
              borderBottom: "1px solid #E4E2DC",
              background: "#F8F7F4",
              flexShrink: 0,
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 10, color: "#A8A29E", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {cashSession.cashRegisterName}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#78716C" }}>{cashSession.operatorName}</p>
            </div>
            <span
              style={{
                fontSize: 24, fontWeight: 800, color: "#1A1917",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "0.04em",
              }}
            >
              {clock}
            </span>
          </div>

          {/* F1 hint bar */}
          <button
            type="button"
            onClick={() => setActiveModal("search")}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 20px",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid #E4E2DC",
              cursor: "pointer",
              textAlign: "left",
              flexShrink: 0,
              transition: "background 120ms",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#F8F7F4"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <kbd
              style={{
                fontSize: 10, fontWeight: 700, color: "#EF9F27",
                border: "1px solid rgba(239,159,39,0.4)", borderRadius: 4,
                padding: "2px 7px", background: "rgba(239,159,39,0.06)",
              }}
            >
              F1
            </kbd>
            <span style={{ fontSize: 12, color: "#A8A29E" }}>Buscar produto por nome, código ou SKU</span>
          </button>

          {/* Cart */}
          <Cart
            items={cart.items}
            selectedIndex={cart.selectedIndex}
            onSelectIndex={cart.setSelectedIndex}
            subtotal={cart.subtotal}
            discountAmt={cart.discountAmt}
            discountPct={cart.discountPct}
            total={cart.total}
          />

          {/* Shortcut bar */}
          <div
            style={{
              display: "flex",
              borderTop: "1px solid #E4E2DC",
              background: "#F8F7F4",
              flexShrink: 0,
            }}
          >
            {SHORTCUTS.map(({ key, label }, i) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === "F1")  setActiveModal("search");
                  if (key === "F2" && cart.items.length > 0) setActiveModal("payment");
                  if (key === "F3")  { setDiscountInput(cart.discountPct.toString()); setActiveModal("discount"); }
                  if (key === "F4")  cart.removeSelected();
                  if (key === "F12") { setClosingBalance(""); setCloseError(""); setActiveModal("close"); }
                }}
                style={{
                  flex: 1, padding: "8px 0",
                  background: "transparent", border: "none",
                  borderRight: i < SHORTCUTS.length - 1 ? "1px solid #E4E2DC" : "none",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  transition: "background 100ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#F0EEE9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 9, color: "#EF9F27", fontWeight: 700 }}>{key}</span>
                <span style={{ fontSize: 9, color: "#A8A29E", letterSpacing: "0.04em" }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search modal */}
      <SearchModal
        open={activeModal === "search"}
        products={products}
        onAdd={cart.addProduct}
        onClose={() => setActiveModal(null)}
      />

      {/* Payment modal */}
      <PaymentModal
        open={activeModal === "payment"}
        total={cart.total}
        subtotal={cart.subtotal}
        discountAmt={cart.discountAmt}
        items={cart.items}
        cashSessionId={cashSession.id}
        operator={cashSession.operatorName}
        onSuccess={() => { cart.clearCart(); setActiveModal(null); }}
        onClose={() => setActiveModal(null)}
      />

      {/* Discount modal */}
      {activeModal === "discount" && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            background: "rgba(0,0,0,0.25)", backdropFilter: "blur(2px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 320, background: "#FFFFFF",
              border: "1px solid #E4E2DC", borderRadius: 14,
              padding: "24px", boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyDiscount();
              if (e.key === "Escape") setActiveModal(null);
            }}
          >
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#A8A29E", textTransform: "uppercase", letterSpacing: "0.1em" }}>Desconto</p>
            <p style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#1A1917" }}>Aplicar desconto (%)</p>
            <input
              ref={discountRef}
              type="text"
              inputMode="decimal"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="0"
              style={{
                width: "100%", height: 44,
                background: "#F8F7F4", border: "1px solid #E4E2DC",
                borderRadius: 8, padding: "0 14px",
                fontSize: 18, fontWeight: 700, color: "#1A1917",
                outline: "none", boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.select()}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                type="button"
                onClick={applyDiscount}
                style={{
                  flex: 1, height: 40, borderRadius: 8,
                  background: "#EF9F27", color: "#1A1917",
                  fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer",
                }}
              >
                Aplicar ↵
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  flex: 1, height: 40, borderRadius: 8,
                  background: "#F0EEE9", color: "#78716C",
                  fontSize: 13, border: "none", cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close session modal */}
      {activeModal === "close" && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            background: "rgba(0,0,0,0.3)", backdropFilter: "blur(3px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 360, background: "#FFFFFF",
              border: "1px solid #E4E2DC", borderRadius: 14,
              padding: "28px 24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
            }}
          >
            <p style={{ margin: "0 0 4px", fontSize: 10, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>⚠ Atenção</p>
            <p style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#1A1917" }}>Fechar caixa?</p>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#78716C", lineHeight: 1.5 }}>
              Esta ação encerra sua sessão em <strong style={{ color: "#1A1917" }}>{cashSession.cashRegisterName}</strong>.
              Informe o saldo de fechamento.
            </p>
            <label>
              <span style={{ display: "block", fontSize: 11, color: "#A8A29E", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Saldo de fechamento (R$)
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={closingBalance}
                onChange={(e) => setClosingBalance(e.target.value)}
                placeholder="0,00"
                autoFocus
                style={{
                  width: "100%", height: 44,
                  background: "#F8F7F4", border: "1px solid #E4E2DC",
                  borderRadius: 8, padding: "0 14px",
                  fontSize: 16, fontWeight: 700, color: "#1A1917",
                  outline: "none", boxSizing: "border-box", marginBottom: 8,
                }}
              />
            </label>
            {closeError && (
              <p style={{ margin: "0 0 8px", fontSize: 12, color: "#EF4444" }}>{closeError}</p>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                disabled={closeLoading}
                onClick={() => void handleCloseSession()}
                style={{
                  flex: 1, height: 42, borderRadius: 8,
                  background: "#EF4444", color: "#FFFFFF",
                  fontWeight: 700, fontSize: 13, border: "none",
                  cursor: closeLoading ? "wait" : "pointer",
                  opacity: closeLoading ? 0.7 : 1,
                }}
              >
                {closeLoading ? "Fechando…" : "Confirmar fechamento"}
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  flex: 1, height: 42, borderRadius: 8,
                  background: "#F0EEE9", color: "#78716C",
                  fontSize: 13, border: "none", cursor: "pointer",
                }}
              >
                Cancelar (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
