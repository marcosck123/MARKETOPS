"use client";

import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  Banknote,
  Bell,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  FileText,
  Minus,
  Plus,
  QrCode,
  Search,
  ShoppingCart,
  Smartphone,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import type { ActiveSession } from "@/lib/actions/cash-sessions";
import { createHelpRequest } from "@/lib/actions/help-requests";
import { createFiscalRequest } from "@/lib/actions/fiscal-requests";
import { findCustomerByDocument } from "@/lib/actions/customers";
import { persistFinishedSale } from "@/lib/actions/sales";
import { type Product } from "@/lib/product-data";
import {
  addSaleItem,
  addSalePayment,
  applySaleDiscount,
  createSale,
  finishSale,
  getPaidAmount,
  getProductSalePrice,
  getSaleBalance,
  removeSaleItem,
} from "@/lib/sale-engine";
import {
  type PaymentMethod,
  type Sale,
  type SaleItem,
} from "@/lib/sale-data";

// ── helpers ──────────────────────────────────────────────────────────
function parseNumber(v: string) {
  const n = Number(v.replace(",", ".").trim());
  return Number.isFinite(n) ? n : 0;
}

function fmt(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function createPosSale(seq: number, s: ActiveSession): Sale {
  return createSale({
    sequence: seq,
    customerId: "",
    cashSessionId: s.id,
    operator: s.operatorName,
    notes: "Venda registrada no PDV.",
    createdAt: new Date().toLocaleString("pt-BR"),
  });
}

function findProductByQuery(products: Product[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    products.find((p) => p.barcode === q || p.sku.toLowerCase() === q || p.name.toLowerCase() === q) ??
    products.find((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q)) ??
    null
  );
}

// ── payment modal types ───────────────────────────────────────────────
type ModalMethod = "cash" | "debit_tef" | "debit_manual" | "pix_screen" | "pix_manual";

const MODAL_METHODS: { method: ModalMethod; label: string; icon: React.ReactNode }[] = [
  { method: "cash",         label: "Dinheiro",      icon: <Banknote size={17} /> },
  { method: "debit_tef",    label: "Cartão TEF",    icon: <CreditCard size={17} /> },
  { method: "debit_manual", label: "Cartão Manual", icon: <CreditCard size={17} /> },
  { method: "pix_screen",   label: "Pix na Tela",   icon: <QrCode size={17} /> },
  { method: "pix_manual",   label: "Pix Manual",    icon: <Smartphone size={17} /> },
];

const MODAL_TO_PAYMENT: Record<ModalMethod, PaymentMethod> = {
  cash: "cash",
  debit_tef: "debit",
  debit_manual: "credit",
  pix_screen: "pix",
  pix_manual: "pix",
};

type SheetPayment = {
  id: string;
  method: PaymentMethod;
  label: string;
  amount: number;
  cv?: string;
  ref?: string;
};

type Props = { products: Product[]; cashSession: ActiveSession };

// ── component ────────────────────────────────────────────────────────
export function PosContent({ products: propProducts, cashSession }: Props) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── existing state ──
  const [products, setProducts] = useState<Product[]>(propProducts);
  const [saleSequence, setSaleSequence] = useState(3001);
  const [sale, setSale] = useState<Sale>(() => createPosSale(3001, cashSession));
  const [errors, setErrors] = useState<string[]>([]);
  const [lastFinishedSale, setLastFinishedSale] = useState<Sale | null>(null);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [persistLoading, setPersistLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(formatTime);
  const [helpCountdown, setHelpCountdown] = useState(0);
  const [helpLoading, setHelpLoading] = useState(false);
  const [nfModalOpen, setNfModalOpen] = useState(false);
  const [nfDocument, setNfDocument] = useState("");
  const [nfLookupName, setNfLookupName] = useState<string | null>(null);
  const [nfLookupId, setNfLookupId] = useState<string | null>(null);
  const [nfLoading, setNfLoading] = useState(false);
  const [pendingSale, setPendingSale] = useState<{ id: string; code: string } | null>(null);

  // ── search state ──
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── payment modal state ──
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"type" | "method" | "form">("type");
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [modalMethod, setModalMethod] = useState<ModalMethod>("cash");
  const [modalAmount, setModalAmount] = useState("");
  const [modalCv, setModalCv] = useState("");
  const [modalRef, setModalRef] = useState("");
  const [sheetPayments, setSheetPayments] = useState<SheetPayment[]>([]);
  const [discount, setDiscount] = useState("");

  // ── effects ──
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(formatTime()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (helpCountdown <= 0) return;
    const t = setTimeout(() => setHelpCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [helpCountdown]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
    else setSearchQuery("");
  }, [searchOpen]);

  // ── memos ──
  const activeProducts = useMemo(() => products.filter((p) => p.status === "active"), [products]);
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const dropdownProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return activeProducts
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q))
      .slice(0, 8);
  }, [activeProducts, searchQuery]);

  const paidAmount = getPaidAmount(sale.payments);
  const balance = getSaleBalance(sale);
  const sheetPaid = sheetPayments.reduce((s, p) => s + p.amount, 0);
  const sheetBalance = Math.max(0, sale.total - sheetPaid);
  const canFinish = balance === 0 && sale.items.length > 0;

  // ── cart handlers ──
  function addProduct(product: Product, qty = 1) {
    if (product.currentStock === 0) return;
    const next = addSaleItem({ sale, product, quantity: qty, priceMode: "retail" });
    setSale(next);
    const added = next.items.find((i) => i.productId === product.id);
    if (added) { setLastAddedId(added.id); setTimeout(() => setLastAddedId(null), 800); }
    setSearchQuery("");
    setSearchOpen(false);
    setErrors([]);
  }

  function decreaseItem(item: SaleItem) {
    if (item.quantity <= 1) { setSale((c) => removeSaleItem(c, item.id)); return; }
    setSale((c) => {
      const u = { ...item, quantity: item.quantity - 1, total: item.unitPrice * (item.quantity - 1) };
      const items = c.items.map((i) => (i.id === item.id ? u : i));
      const sub = items.reduce((s, i) => s + i.total, 0);
      return { ...c, items, subtotal: sub, total: Math.max(0, sub - c.discount) };
    });
  }

  function increaseItem(item: SaleItem) {
    const p = productById.get(item.productId);
    if (!p) return;
    setSale((c) => addSaleItem({ sale: c, product: p, quantity: 1, priceMode: "retail" }));
  }

  function applyDiscount() {
    setSale((c) => applySaleDiscount(c, parseNumber(discount)));
  }

  function resetSale() {
    const seq = saleSequence + 1;
    setSaleSequence(seq);
    setSale(createPosSale(seq, cashSession));
    setSheetPayments([]);
    setDiscount("");
    setErrors([]);
    router.refresh();
  }

  // ── sale handlers ──
  async function handleFinish() {
    const result = finishSale({ sale, products, finishedAt: new Date().toLocaleString("pt-BR") });
    if (!result.ok) { setErrors(result.errors); return; }
    setProducts(result.products);
    setLastFinishedSale(result.sale);
    setPersistLoading(true);
    const res = await persistFinishedSale(result.sale);
    setPersistLoading(false);
    if (!res.success) { setErrors([res.error]); return; }
    resetSale();
  }

  async function handleFinishWithNf() {
    const result = finishSale({ sale, products, finishedAt: new Date().toLocaleString("pt-BR") });
    if (!result.ok) { setErrors(result.errors); return; }
    setProducts(result.products);
    setLastFinishedSale(result.sale);
    setPersistLoading(true);
    const res = await persistFinishedSale(result.sale);
    setPersistLoading(false);
    if (!res.success) { setErrors([res.error]); return; }
    setPendingSale(res.data);
    setNfDocument(""); setNfLookupName(null); setNfLookupId(null);
    setNfModalOpen(true);
  }

  async function handleLookupCustomer() {
    if (!nfDocument.trim()) return;
    setNfLoading(true);
    const found = await findCustomerByDocument(nfDocument);
    setNfLoading(false);
    if (found) { setNfLookupName(found.name); setNfLookupId(found.id); }
    else { setNfLookupName(null); setNfLookupId(null); }
  }

  async function handleRequestNfe() {
    if (!pendingSale || !nfDocument.trim()) return;
    setNfLoading(true);
    const res = await createFiscalRequest({
      saleId: pendingSale.id, saleCode: pendingSale.code,
      document: nfDocument, customerId: nfLookupId ?? undefined,
      customerName: nfLookupName ?? undefined, operatorId: cashSession.operatorId,
    });
    setNfLoading(false);
    if (!res.success) setErrors([res.error]);
    setNfModalOpen(false); setPendingSale(null); resetSale();
  }

  async function handleCallSupervisor() {
    setHelpLoading(true);
    const res = await createHelpRequest({
      cashRegisterId: cashSession.cashRegisterId,
      operatorId: cashSession.operatorId,
      operatorName: cashSession.operatorName,
      cashRegisterName: cashSession.cashRegisterName,
    });
    setHelpLoading(false);
    if (!res.success) { setErrors([res.error]); return; }
    setHelpCountdown(60);
  }

  // ── payment modal handlers ──
  function openPaymentModal() {
    setSheetPayments([]);
    setPaymentStep("type");
    setModalAmount("");
    setModalCv("");
    setModalRef("");
    setPaymentOpen(true);
  }

  function closePaymentModal() {
    setPaymentOpen(false);
    setPaymentStep("type");
    setModalAmount("");
    setModalCv("");
    setModalRef("");
  }

  function doConfirm(payments: SheetPayment[]) {
    let cur = sale;
    for (const p of payments) cur = addSalePayment({ sale: cur, method: p.method, amount: p.amount });
    setSale(cur);
    setSheetPayments([]);
    setPaymentOpen(false);
    setPaymentStep("type");
  }

  function addModalPayment() {
    const amount = paymentType === "full"
      ? sheetBalance
      : Math.min(parseNumber(modalAmount), sheetBalance);
    if (amount <= 0) return;
    const found = MODAL_METHODS.find((m) => m.method === modalMethod)!;
    const next: SheetPayment[] = [
      ...sheetPayments,
      {
        id: `sp-${Date.now()}`,
        method: MODAL_TO_PAYMENT[modalMethod],
        label: found.label,
        amount,
        cv: modalCv || undefined,
        ref: modalRef || undefined,
      },
    ];
    const newPaid = next.reduce((s, p) => s + p.amount, 0);
    const newBalance = Math.max(0, sale.total - newPaid);
    setModalAmount(""); setModalCv(""); setModalRef("");
    if (newBalance === 0) {
      doConfirm(next);
    } else {
      setSheetPayments(next);
      setPaymentStep("type");
    }
  }

  // ── render ────────────────────────────────────────────────────────
  return (
    <main
      className="relative overflow-hidden"
      style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#F9F8F6" }}
    >
      {/* ─── HEADER ─── */}
      <header
        style={{
          height: 56,
          background: "#1A1917",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          flexShrink: 0,
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 28, height: 28, borderRadius: 7,
            background: "#EF9F27", color: "#1A1917",
            display: "grid", placeItems: "center",
            fontSize: 10, fontWeight: 800,
            fontFamily: "\"Syne\", var(--font-syne), sans-serif",
            flexShrink: 0,
          }}
        >
          MO
        </div>

        {/* Search icon */}
        <button
          type="button"
          onClick={() => setSearchOpen((o) => !o)}
          style={{
            width: 36, height: 36, borderRadius: 8,
            border: "1px solid #2C2C2A",
            background: searchOpen ? "#EF9F27" : "transparent",
            color: searchOpen ? "#1A1917" : "#78716C",
            display: "grid", placeItems: "center",
            flexShrink: 0,
            transition: "all 200ms",
            cursor: "pointer",
          }}
          title="Buscar produto"
        >
          <Search size={15} />
        </button>

        {/* Right: caixa info */}
        <div style={{ marginLeft: "auto", flexShrink: 0, textAlign: "right" }}>
          <p style={{ fontSize: 11, color: "#78716C", margin: 0, fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace" }}>
            {cashSession.cashRegisterName} · {currentTime}
          </p>
          <p style={{ fontSize: 11, color: "#57534E", margin: 0 }}>
            {cashSession.operatorName}
          </p>
        </div>

        {/* Supervisor + Close */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            disabled={helpCountdown > 0 || helpLoading}
            onClick={() => void handleCallSupervisor()}
            title="Chamar supervisor"
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: "1px solid #2C2C2A",
              background: helpCountdown > 0 ? "rgba(239,159,39,.15)" : "transparent",
              color: helpCountdown > 0 ? "#EF9F27" : "#78716C",
              display: "grid", placeItems: "center", cursor: "pointer",
            }}
          >
            <Bell size={15} />
          </button>
          <Link
            href="/caixas"
            title="Fechar caixa"
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: "1px solid #2C2C2A",
              color: "#78716C",
              display: "grid", placeItems: "center",
              textDecoration: "none",
            }}
          >
            <ChevronLeft size={15} />
          </Link>
        </div>
      </header>

      {/* ─── BODY (cart + sidebar) ─── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* ── SEARCH OVERLAY ── */}
        {searchOpen && (
          <div
            style={{
              position: "absolute", inset: 0, zIndex: 40,
              display: "flex", flexDirection: "column", alignItems: "center",
              paddingTop: 28, paddingInline: 24,
              background: "rgba(249,248,246,0.94)",
              backdropFilter: "blur(6px)",
              animation: "fadeIn 150ms both",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
          >
            {/* Input box */}
            <div style={{
              width: "100%", maxWidth: 540,
              display: "flex", alignItems: "center", gap: 10,
              background: "#FFFFFF",
              border: "2px solid #EF9F27",
              borderRadius: 14,
              padding: "0 16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}>
              <Search size={18} color="#EF9F27" style={{ flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Escape") setSearchOpen(false);
                  if (e.key === "Enter") {
                    const p = findProductByQuery(activeProducts, searchQuery);
                    if (p) addProduct(p);
                    else if (searchQuery.trim()) setErrors(["Produto não encontrado."]);
                  }
                }}
                placeholder="Nome, SKU ou código de barras..."
                style={{
                  flex: 1, height: 52, border: "none", outline: "none",
                  fontSize: 15, background: "transparent", color: "#1A1917",
                  fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace",
                }}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#A8A29E", display: "grid", placeItems: "center", padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Results */}
            {dropdownProducts.length > 0 && (
              <div style={{
                width: "100%", maxWidth: 540,
                marginTop: 8,
                background: "#FFFFFF",
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid #E4E2DC",
                overflow: "hidden",
                animation: "fadeUp 150ms both",
              }}>
                {dropdownProducts.map((product, idx) => {
                  const price = getProductSalePrice(product, "retail");
                  const isZero = product.currentStock === 0;
                  const isLow = !isZero && product.currentStock <= product.minimumStock;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={isZero}
                      onClick={() => addProduct(product)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left disabled:opacity-40"
                      style={{
                        borderBottom: idx < dropdownProducts.length - 1 ? "0.5px solid #F0EEE9" : "none",
                        background: "transparent", transition: "background 100ms",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFAF8"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1917", margin: 0 }} className="truncate">
                          {product.name}
                        </p>
                        <p style={{ fontSize: 11, color: "#A8A29E", fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace", margin: 0 }}>
                          {product.sku}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#1A1917", fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace", margin: 0 }}>
                          {fmt(price)}
                        </p>
                        <p style={{ fontSize: 11, margin: 0, color: isZero ? "#EF4444" : isLow ? "#854F0B" : "#3B6D11", fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace" }}>
                          {isZero ? "sem estoque" : `${product.currentStock} un.`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {searchQuery.trim() && dropdownProducts.length === 0 && (
              <p style={{ marginTop: 20, fontSize: 13, color: "#A8A29E" }}>Nenhum produto encontrado</p>
            )}
          </div>
        )}

        {/* Cart list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 0 8px" }}>
          {sale.items.length === 0 ? (
            <div style={{ height: "100%", minHeight: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <ShoppingCart size={40} color="#E4E2DC" />
              <p style={{ fontSize: 13, color: "#C7C5BF", margin: 0 }}>Carrinho vazio</p>
              <p style={{ fontSize: 12, color: "#D6D4CE", margin: 0 }}>Clique na lupa para adicionar produtos</p>
            </div>
          ) : (
            sale.items.map((item, idx) => {
              const product = productById.get(item.productId);
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderBottom: "0.5px solid #F0EEE9",
                    background: item.id === lastAddedId ? "#FFFBF0" : "transparent",
                    transition: "background 600ms",
                    animation: `fadeUp ${180 + idx * 40}ms both`,
                  }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: 4, background: "#F0EEE9", fontSize: 9, color: "#C7C5BF", display: "grid", placeItems: "center", fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace", flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1A1917" }} className="truncate">
                      {product?.name ?? "Produto removido"}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "#A8A29E", fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace" }}>
                      {product?.sku ?? ""} · {fmt(item.unitPrice)} un.
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <QtyBtn onClick={() => decreaseItem(item)}><Minus size={10} /></QtyBtn>
                    <span style={{ width: 28, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#1A1917", fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace" }}>
                      {item.quantity}
                    </span>
                    <QtyBtn onClick={() => increaseItem(item)}><Plus size={10} /></QtyBtn>
                  </div>
                  <span style={{ minWidth: 64, textAlign: "right", fontSize: 13, fontWeight: 700, color: "#1A1917", fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace", flexShrink: 0 }}>
                    {fmt(item.total)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSale((c) => removeSaleItem(c, item.id))}
                    style={{ color: "#D6D4CE", background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#D6D4CE"; }}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <aside
          style={{
            width: 264,
            flexShrink: 0,
            borderLeft: "0.5px solid #E4E2DC",
            background: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Sale info */}
          <div style={{ padding: "16px 18px 12px", borderBottom: "0.5px solid #F0EEE9" }}>
            <p style={{ margin: 0, fontSize: 10, color: "#A8A29E", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Venda {sale.code}
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 600, color: "#1A1917" }}>
              {cashSession.operatorName}
            </p>
            <p style={{ margin: "1px 0 0", fontSize: 11, color: "#A8A29E", fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace" }}>
              {cashSession.cashRegisterName}
            </p>
          </div>

          {/* Totals */}
          <div style={{ padding: "14px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#A8A29E" }}>
                {sale.items.length} {sale.items.length === 1 ? "item" : "itens"}
              </span>
              <span style={{ fontSize: 12, color: "#78716C", fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace" }}>
                {fmt(sale.subtotal)}
              </span>
            </div>
            {sale.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#A8A29E" }}>Desconto</span>
                <span style={{ fontSize: 12, color: "#EF4444", fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace" }}>
                  -{fmt(sale.discount)}
                </span>
              </div>
            )}

            {/* Total */}
            <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "0.5px solid #F0EEE9" }}>
              <p style={{ margin: "0 0 2px", fontSize: 10, color: "#A8A29E", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Total
              </p>
              <p style={{
                margin: 0, fontSize: 36, fontWeight: 600, lineHeight: 1,
                color: "#EF9F27",
                fontFamily: "\"Cormorant Garamond\", var(--font-cormorant), serif",
                fontStyle: "italic",
              }}>
                {fmt(sale.total)}
              </p>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{ padding: "0 18px 10px" }}>
              {errors.map((e) => (
                <p key={e} style={{ margin: 0, fontSize: 11, color: "#DC2626" }}>{e}</p>
              ))}
            </div>
          )}

          {/* Discount */}
          <div style={{ padding: "0 18px 10px", display: "flex", gap: 6 }}>
            <input
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              inputMode="decimal"
              placeholder="Desconto R$"
              style={{
                flex: 1, height: 34, borderRadius: 7, border: "1px solid #E4E2DC",
                background: "#F9F8F6", padding: "0 10px", fontSize: 12,
                color: "#78716C", outline: "none",
                fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace",
              }}
            />
            <button
              type="button"
              onClick={applyDiscount}
              style={{ height: 34, borderRadius: 7, border: "1px solid #E4E2DC", background: "#F0EEE9", padding: "0 12px", fontSize: 12, color: "#78716C", cursor: "pointer" }}
            >
              Aplicar
            </button>
          </div>

          {/* Limpar */}
          <div style={{ padding: "0 18px 12px" }}>
            <button
              type="button"
              onClick={() => { setSale(createPosSale(saleSequence, cashSession)); setDiscount(""); setErrors([]); }}
              style={{ width: "100%", height: 34, borderRadius: 7, border: "1px solid #E4E2DC", background: "transparent", fontSize: 12, color: "#A8A29E", cursor: "pointer" }}
            >
              Limpar venda
            </button>
          </div>

          {/* CTA */}
          <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            {canFinish ? (
              <>
                <button
                  type="button"
                  disabled={persistLoading}
                  onClick={() => void handleFinishWithNf()}
                  style={{
                    width: "100%", height: 40, borderRadius: 8,
                    border: "1px solid #E4E2DC", background: "transparent",
                    fontSize: 13, color: "#78716C", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <FileText size={14} /> Emitir NF
                </button>
                <button
                  type="button"
                  disabled={persistLoading}
                  onClick={() => void handleFinish()}
                  style={{
                    width: "100%", height: 48, borderRadius: 8,
                    background: "#1A1917", color: "#FFFFFF",
                    border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    fontFamily: "\"Syne\", var(--font-syne), sans-serif",
                    transition: "background 150ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#2C2C2A"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#1A1917"; }}
                >
                  <CheckCircle2 size={16} />
                  {persistLoading ? "Salvando..." : "Finalizar"}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={sale.items.length === 0}
                onClick={openPaymentModal}
                style={{
                  width: "100%", height: 48, borderRadius: 8,
                  background: sale.items.length === 0 ? "#E4E2DC" : "#EF9F27",
                  color: "#1A1917", border: "none",
                  fontSize: 14, fontWeight: 700,
                  cursor: sale.items.length === 0 ? "not-allowed" : "pointer",
                  fontFamily: "\"Syne\", var(--font-syne), sans-serif",
                  transition: "all 150ms",
                }}
              >
                Pagamento
              </button>
            )}
          </div>
        </aside>

      </div>{/* end BODY */}

      {/* ─── PAYMENT MODAL ─── */}
      {paymentOpen && (
        <div
          style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(26,25,23,.65)", backdropFilter: "blur(6px)", animation: "overlayIn 180ms both" }}
          onClick={(e) => { if (e.target === e.currentTarget) closePaymentModal(); }}
        >
          <div style={{ background: "#FFFFFF", borderRadius: 14, width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", overflow: "hidden", animation: "sheetIn 220ms both", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>

            {/* ── STEP 1: type ── */}
            {paymentStep === "type" && (
              <>
                <div style={{ padding: "16px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "0.5px solid #F0EEE9" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1A1917", fontFamily: "\"Syne\", var(--font-syne), sans-serif" }}>Pagamento</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#A8A29E", fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace" }}>
                      {sheetPayments.length > 0 ? `Restante: ${fmt(sheetBalance)}` : `Total: ${fmt(sale.total)}`}
                    </p>
                  </div>
                  <button type="button" onClick={closePaymentModal} style={{ background: "#F0EEE9", border: "none", borderRadius: 7, width: 28, height: 28, display: "grid", placeItems: "center", cursor: "pointer", color: "#78716C" }}>
                    <X size={13} />
                  </button>
                </div>

                <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => { setPaymentType("full"); setPaymentStep("method"); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #EF9F27", background: "#FFFBF0", cursor: "pointer", transition: "all 150ms" }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1A1917" }}>Inteiro</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#A8A29E", fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace" }}>{fmt(sheetBalance)}</p>
                    </div>
                    <span style={{ fontSize: 18, color: "#EF9F27" }}>→</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentType("partial"); setPaymentStep("method"); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #E4E2DC", background: "#F9F8F6", cursor: "pointer", transition: "all 150ms" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#D6D4CE"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E4E2DC"; }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1A1917" }}>Parcial</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#A8A29E" }}>Valor personalizado</p>
                    </div>
                    <span style={{ fontSize: 18, color: "#A8A29E" }}>→</span>
                  </button>
                </div>

                {/* Registered payments */}
                {sheetPayments.length > 0 && (
                  <div style={{ borderTop: "0.5px solid #F0EEE9", padding: "12px 18px 16px" }}>
                    <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: "#A8A29E", textTransform: "uppercase", letterSpacing: "0.06em" }}>Registrados</p>
                    {sheetPayments.map((p) => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBlock: 6, borderBottom: "0.5px solid #F9F8F6" }}>
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1917" }}>{p.label}</span>
                          {(p.cv || p.ref) && (
                            <span style={{ fontSize: 10, color: "#A8A29E", marginLeft: 6, fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace" }}>
                              {p.cv ? `CV: ${p.cv}` : `Ref: ${p.ref}`}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "#3B6D11", fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace" }}>{fmt(p.amount)}</span>
                          <button type="button" onClick={() => setSheetPayments((prev) => prev.filter((x) => x.id !== p.id))} style={{ color: "#D6D4CE", background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => doConfirm(sheetPayments)}
                      style={{ marginTop: 12, width: "100%", height: 40, borderRadius: 9, background: "#1A1917", color: "#FFFFFF", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "\"Syne\", var(--font-syne), sans-serif" }}
                    >
                      Confirmar pagamento
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── STEP 2: method ── */}
            {paymentStep === "method" && (
              <>
                <div style={{ padding: "14px 18px 12px", display: "flex", alignItems: "center", gap: 10, borderBottom: "0.5px solid #F0EEE9" }}>
                  <button type="button" onClick={() => setPaymentStep("type")} style={{ background: "#F0EEE9", border: "none", borderRadius: 7, width: 28, height: 28, display: "grid", placeItems: "center", cursor: "pointer", color: "#78716C", flexShrink: 0 }}>
                    <ArrowLeft size={14} />
                  </button>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1A1917", fontFamily: "\"Syne\", var(--font-syne), sans-serif" }}>
                    Forma de pagamento
                  </p>
                  <button type="button" onClick={closePaymentModal} style={{ background: "#F0EEE9", border: "none", borderRadius: 7, width: 28, height: 28, display: "grid", placeItems: "center", cursor: "pointer", color: "#78716C", marginLeft: "auto", flexShrink: 0 }}>
                    <X size={13} />
                  </button>
                </div>
                <div style={{ padding: "14px 18px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {MODAL_METHODS.map(({ method, label, icon }) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => { setModalMethod(method); setPaymentStep("form"); }}
                      style={{ height: 64, borderRadius: 10, border: "1.5px solid #E4E2DC", background: "#F9F8F6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer", transition: "all 150ms", fontSize: 11, fontWeight: 600, color: "#1A1917" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF9EC"; e.currentTarget.style.borderColor = "#EF9F27"; (e.currentTarget.querySelector("span") as HTMLElement | null)?.style.setProperty("color", "#EF9F27"); }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#F9F8F6"; e.currentTarget.style.borderColor = "#E4E2DC"; (e.currentTarget.querySelector("span") as HTMLElement | null)?.style.setProperty("color", "#A8A29E"); }}
                    >
                      <span style={{ color: "#A8A29E", transition: "color 150ms" }}>{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── STEP 3: form ── */}
            {paymentStep === "form" && (
              <>
                <div style={{ padding: "14px 18px 12px", display: "flex", alignItems: "center", gap: 10, borderBottom: "0.5px solid #F0EEE9" }}>
                  <button type="button" onClick={() => setPaymentStep("method")} style={{ background: "#F0EEE9", border: "none", borderRadius: 7, width: 28, height: 28, display: "grid", placeItems: "center", cursor: "pointer", color: "#78716C", flexShrink: 0 }}>
                    <ArrowLeft size={14} />
                  </button>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1A1917", fontFamily: "\"Syne\", var(--font-syne), sans-serif" }}>
                      {MODAL_METHODS.find((m) => m.method === modalMethod)?.label}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "#A8A29E" }}>
                      {paymentType === "full" ? `Inteiro · ${fmt(sheetBalance)}` : "Valor parcial"}
                    </p>
                  </div>
                  <button type="button" onClick={closePaymentModal} style={{ background: "#F0EEE9", border: "none", borderRadius: 7, width: 28, height: 28, display: "grid", placeItems: "center", cursor: "pointer", color: "#78716C", flexShrink: 0 }}>
                    <X size={13} />
                  </button>
                </div>

                <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 11 }}>
                  {/* Amount */}
                  {paymentType === "full" ? (
                    <div style={{ background: "#F9F8F6", borderRadius: 9, padding: "10px 14px" }}>
                      <p style={{ margin: 0, fontSize: 11, color: "#A8A29E" }}>Valor integral</p>
                      <p style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "#1A1917", fontFamily: "\"Cormorant Garamond\", var(--font-cormorant), serif", fontStyle: "italic" }}>{fmt(sheetBalance)}</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ margin: "0 0 5px", fontSize: 11, color: "#A8A29E" }}>Valor</p>
                      <input
                        value={modalAmount}
                        onChange={(e) => setModalAmount(e.target.value)}
                        inputMode="decimal"
                        placeholder={fmt(sheetBalance).replace("R$ ", "")}
                        autoFocus
                        style={{ width: "100%", height: 42, borderRadius: 8, border: "1.5px solid #E4E2DC", background: "#F9F8F6", padding: "0 14px", fontSize: 15, fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace", outline: "none", color: "#1A1917" }}
                      />
                    </div>
                  )}

                  {/* CV — cartão manual */}
                  {modalMethod === "debit_manual" && (
                    <div>
                      <p style={{ margin: "0 0 5px", fontSize: 11, color: "#A8A29E" }}>CV</p>
                      <input
                        value={modalCv}
                        onChange={(e) => setModalCv(e.target.value)}
                        placeholder="Código de verificação"
                        style={{ width: "100%", height: 42, borderRadius: 8, border: "1.5px solid #E4E2DC", background: "#F9F8F6", padding: "0 14px", fontSize: 13, fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace", outline: "none", color: "#1A1917" }}
                      />
                    </div>
                  )}

                  {/* Ref/CV — pix manual */}
                  {modalMethod === "pix_manual" && (
                    <div>
                      <p style={{ margin: "0 0 5px", fontSize: 11, color: "#A8A29E" }}>Ref / CV</p>
                      <input
                        value={modalRef}
                        onChange={(e) => setModalRef(e.target.value)}
                        placeholder="Referência ou código"
                        style={{ width: "100%", height: 42, borderRadius: 8, border: "1.5px solid #E4E2DC", background: "#F9F8F6", padding: "0 14px", fontSize: 13, fontFamily: "\"DM Mono\", var(--font-dm-mono), monospace", outline: "none", color: "#1A1917" }}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addModalPayment}
                    style={{ height: 44, borderRadius: 9, background: "#1A1917", color: "#FFFFFF", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "\"Syne\", var(--font-syne), sans-serif", transition: "background 150ms" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#2C2C2A"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#1A1917"; }}
                  >
                    + Adicionar
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ─── NF MODAL ─── */}
      {nfModalOpen && (
        <div style={{ position: "absolute", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(26,25,23,.75)", animation: "overlayIn 180ms both" }}>
          <div style={{ width: "100%", maxWidth: 360, background: "#1C1917", borderRadius: 16, padding: 24, animation: "sheetIn 200ms both" }}>
            <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: "#FFFFFF", fontFamily: "\"Syne\", var(--font-syne), sans-serif" }}>Emitir NF-e</p>
            <p style={{ margin: "0 0 20px", fontSize: 12, color: "#78716C" }}>Venda {pendingSale?.code} finalizada</p>
            <div style={{ marginBottom: 12 }}>
              <p style={{ margin: "0 0 6px", fontSize: 11, color: "#A8A29E" }}>CPF ou CNPJ</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={nfDocument}
                  onChange={(e) => { setNfDocument(e.target.value); setNfLookupName(null); setNfLookupId(null); }}
                  placeholder="000.000.000-00"
                  style={{ flex: 1, height: 40, borderRadius: 8, border: "1px solid #2C2C2A", background: "#111110", color: "#F6F4EF", padding: "0 12px", fontSize: 13, outline: "none" }}
                />
                <button type="button" onClick={() => void handleLookupCustomer()} disabled={nfLoading || !nfDocument.trim()} style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid #2C2C2A", background: "#111110", color: "#78716C", display: "grid", placeItems: "center", cursor: "pointer" }}>
                  <Search size={15} />
                </button>
              </div>
            </div>
            {nfLookupName && <p style={{ fontSize: 12, color: "#EF9F27", margin: "0 0 12px" }}>Cliente: {nfLookupName}</p>}
            {nfLookupName === null && nfDocument && !nfLoading && <p style={{ fontSize: 12, color: "#78716C", margin: "0 0 12px" }}>Documento não cadastrado — NF sem vínculo.</p>}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => { setNfModalOpen(false); setPendingSale(null); resetSale(); }} style={{ flex: 1, height: 40, borderRadius: 8, border: "1px solid #2C2C2A", background: "transparent", color: "#A8A29E", fontSize: 13, cursor: "pointer" }}>Sem NF</button>
              <button type="button" disabled={nfLoading || !nfDocument.trim()} onClick={() => void handleRequestNfe()} style={{ flex: 1, height: 40, borderRadius: 8, background: "#EF9F27", color: "#1A1917", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "\"Syne\", var(--font-syne), sans-serif" }}>
                {nfLoading ? "Enviando..." : "Solicitar NF-e"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ── QtyBtn ────────────────────────────────────────────────────────────
function QtyBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid #E4E2DC", background: "transparent", color: "#A8A29E", display: "grid", placeItems: "center", cursor: "pointer", transition: "all 120ms" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#1A1917"; e.currentTarget.style.color = "#FFFFFF"; e.currentTarget.style.borderColor = "#1A1917"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#A8A29E"; e.currentTarget.style.borderColor = "#E4E2DC"; }}
    >
      {children}
    </button>
  );
}
