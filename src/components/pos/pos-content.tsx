"use client";

import { type FormEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  Bell,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  FileText,
  Minus,
  Package,
  Plus,
  QrCode,
  Search,
  ShoppingCart,
  Trash2,
  Wallet,
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
  removeSalePayment,
} from "@/lib/sale-engine";
import {
  type PaymentMethod,
  type Sale,
  type SaleItem,
  paymentMethodLabels,
} from "@/lib/sale-data";

// ─── types ──────────────────────────────────────────────────────────
type PosFormState = {
  query: string;
  quantity: string;
  priceMode: "retail" | "wholesale";
  paymentMethod: PaymentMethod;
  paymentAmount: string;
  discount: string;
};

const defaultFormState: PosFormState = {
  query: "",
  quantity: "1",
  priceMode: "retail",
  paymentMethod: "pix",
  paymentAmount: "",
  discount: "",
};

type Props = {
  products: Product[];
  cashSession: ActiveSession;
};

// ─── helpers ────────────────────────────────────────────────────────
function parseNumber(value: string) {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function createPosSale(sequence: number, cashSession: ActiveSession): Sale {
  return createSale({
    sequence,
    customerId: "",
    cashSessionId: cashSession.id,
    operator: cashSession.operatorName,
    notes: "Venda registrada no PDV.",
    createdAt: new Date().toLocaleString("pt-BR"),
  });
}

function findProductByQuery(products: Product[], query: string) {
  const search = query.trim().toLowerCase();
  if (!search) return null;
  return (
    products.find(
      (p) => p.barcode === search || p.sku.toLowerCase() === search || p.name.toLowerCase() === search,
    ) ??
    products.find(
      (p) => p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search) || p.barcode.includes(search),
    ) ??
    null
  );
}

const PAYMENT_ICONS: Record<PaymentMethod, React.ReactNode> = {
  cash: <Banknote className="size-5" />,
  pix: <QrCode className="size-5" />,
  debit: <CreditCard className="size-5" />,
  credit: <CreditCard className="size-5" />,
  store_credit: <Wallet className="size-5" />,
};

// ─── component ──────────────────────────────────────────────────────
export function PosContent({ products: propProducts, cashSession }: Props) {
  const router = useRouter();
  const barcodeRef = useRef<HTMLInputElement>(null);

  // ── existing state (unchanged) ──
  const [products, setProducts] = useState<Product[]>(propProducts);
  const [formState, setFormState] = useState<PosFormState>(defaultFormState);
  const [saleSequence, setSaleSequence] = useState(3001);
  const [sale, setSale] = useState<Sale>(() => createPosSale(3001, cashSession));
  const [errors, setErrors] = useState<string[]>([]);
  const [lastFinishedSale, setLastFinishedSale] = useState<Sale | null>(null);
  const [lastAddedItemId, setLastAddedItemId] = useState<string | null>(null);
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

  // ── new state for sheets ──
  const [searchSheetOpen, setSearchSheetOpen] = useState(false);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [sheetQuery, setSheetQuery] = useState("");
  const [sheetQuantity, setSheetQuantity] = useState("1");
  const [sheetPaymentMethod, setSheetPaymentMethod] = useState<PaymentMethod>("pix");
  const [sheetPaymentAmount, setSheetPaymentAmount] = useState("");
  const [sheetPayments, setSheetPayments] = useState<Array<{ id: string; method: PaymentMethod; amount: number }>>([]);

  // ── existing effects (unchanged) ──
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(formatTime()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (helpCountdown <= 0) return;
    const timer = setTimeout(() => setHelpCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [helpCountdown]);

  const activeProducts = useMemo(() => products.filter((p) => p.status === "active"), [products]);
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const filteredProducts = useMemo(() => {
    const search = formState.query.trim().toLowerCase();
    if (!search) return activeProducts.slice(0, 12);
    return activeProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          p.barcode.includes(search),
      )
      .slice(0, 20);
  }, [activeProducts, formState.query]);

  const sheetFilteredProducts = useMemo(() => {
    const search = sheetQuery.trim().toLowerCase();
    if (!search) return activeProducts.slice(0, 30);
    return activeProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          p.barcode.includes(search),
      )
      .slice(0, 30);
  }, [activeProducts, sheetQuery]);

  const paidAmount = getPaidAmount(sale.payments);
  const balance = getSaleBalance(sale);

  // sheet balance (using sheetPayments accumulation)
  const sheetPaid = sheetPayments.reduce((s, p) => s + p.amount, 0);
  const sheetBalance = Math.max(0, sale.total - sale.discount - sheetPaid);

  const selectedProduct = selectedProductId ? productById.get(selectedProductId) : null;

  function updateForm<K extends keyof PosFormState>(key: K, value: PosFormState[K]) {
    setFormState((c) => ({ ...c, [key]: value }));
  }

  // ── existing handlers (unchanged logic) ──
  function addProductToSale(product: Product) {
    if (product.currentStock === 0) return;
    const quantity = parseNumber(formState.quantity || "1");
    if (quantity <= 0) return;
    const nextSale = addSaleItem({ sale, product, quantity, priceMode: formState.priceMode });
    setSale(nextSale);
    const addedItem = nextSale.items.find((item) => item.productId === product.id);
    if (addedItem) {
      setLastAddedItemId(addedItem.id);
      setTimeout(() => setLastAddedItemId(null), 600);
    }
    setFormState((c) => ({ ...c, query: "", quantity: "1" }));
    setErrors([]);
  }

  function handleSubmitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const product = findProductByQuery(activeProducts, formState.query);
    if (!product) {
      setErrors(["Produto nao encontrado ou inativo."]);
      return;
    }
    addProductToSale(product);
  }

  function handleApplyDiscount() {
    setSale((c) => applySaleDiscount(c, parseNumber(formState.discount)));
    setErrors([]);
  }

  function handleAddPayment(method: PaymentMethod) {
    const amount = parseNumber(formState.paymentAmount || String(balance));
    if (amount <= 0) return;
    setSale((c) =>
      addSalePayment({ sale: c, method, amount: Math.min(amount, getSaleBalance(c)) }),
    );
    setFormState((c) => ({ ...c, paymentAmount: "", paymentMethod: method }));
    setErrors([]);
  }

  function resetToNewSale() {
    const nextSequence = saleSequence + 1;
    setSaleSequence(nextSequence);
    setSale(createPosSale(nextSequence, cashSession));
    setFormState((c) => ({ ...c, query: "", quantity: "1", discount: "", paymentAmount: "" }));
    setSheetPayments([]);
    setErrors([]);
    router.refresh();
  }

  async function handleFinishSale() {
    const result = finishSale({ sale, products, finishedAt: new Date().toLocaleString("pt-BR") });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setProducts(result.products);
    setLastFinishedSale(result.sale);
    setPersistLoading(true);
    const persistResult = await persistFinishedSale(result.sale);
    setPersistLoading(false);
    if (!persistResult.success) {
      setErrors([persistResult.error]);
      return;
    }
    resetToNewSale();
  }

  async function handleFinishWithNf() {
    const result = finishSale({ sale, products, finishedAt: new Date().toLocaleString("pt-BR") });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setProducts(result.products);
    setLastFinishedSale(result.sale);
    setPersistLoading(true);
    const persistResult = await persistFinishedSale(result.sale);
    setPersistLoading(false);
    if (!persistResult.success) {
      setErrors([persistResult.error]);
      return;
    }
    setPendingSale(persistResult.data);
    setNfDocument("");
    setNfLookupName(null);
    setNfLookupId(null);
    setNfModalOpen(true);
  }

  async function handleLookupCustomer() {
    if (!nfDocument.trim()) return;
    setNfLoading(true);
    const found = await findCustomerByDocument(nfDocument);
    setNfLoading(false);
    if (found) {
      setNfLookupName(found.name);
      setNfLookupId(found.id);
    } else {
      setNfLookupName(null);
      setNfLookupId(null);
    }
  }

  async function handleRequestNfe() {
    if (!pendingSale || !nfDocument.trim()) return;
    setNfLoading(true);
    const result = await createFiscalRequest({
      saleId: pendingSale.id,
      saleCode: pendingSale.code,
      document: nfDocument,
      customerId: nfLookupId ?? undefined,
      customerName: nfLookupName ?? undefined,
      operatorId: cashSession.operatorId,
    });
    setNfLoading(false);
    if (!result.success) setErrors([result.error]);
    setNfModalOpen(false);
    setPendingSale(null);
    resetToNewSale();
  }

  function handleSkipNf() {
    setNfModalOpen(false);
    setPendingSale(null);
    resetToNewSale();
  }

  function handleClearSale() {
    setSale(createPosSale(saleSequence, cashSession));
    setFormState((c) => ({ ...c, query: "", quantity: "1", discount: "", paymentAmount: "" }));
    setSheetPayments([]);
    setErrors([]);
  }

  async function handleCallSupervisor() {
    setHelpLoading(true);
    const result = await createHelpRequest({
      cashRegisterId: cashSession.cashRegisterId,
      operatorId: cashSession.operatorId,
      operatorName: cashSession.operatorName,
      cashRegisterName: cashSession.cashRegisterName,
    });
    setHelpLoading(false);
    if (!result.success) {
      setErrors([result.error]);
      return;
    }
    setHelpCountdown(60);
  }

  // ── new handlers ──
  function handleBarcodeKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const product = findProductByQuery(activeProducts, formState.query);
    if (product) {
      addProductToSale(product);
    } else if (formState.query.trim()) {
      setErrors(["Produto não encontrado."]);
    }
  }

  function decreaseCartItem(item: SaleItem) {
    if (item.quantity <= 1) {
      setSale((c) => removeSaleItem(c, item.id));
      return;
    }
    setSale((c) => {
      const updated = { ...item, quantity: item.quantity - 1, total: item.unitPrice * (item.quantity - 1) };
      const newItems = c.items.map((i) => (i.id === item.id ? updated : i));
      const newSubtotal = newItems.reduce((s, i) => s + i.total, 0);
      const newTotal = Math.max(0, newSubtotal - c.discount);
      return { ...c, items: newItems, subtotal: newSubtotal, total: newTotal };
    });
  }

  function increaseCartItem(item: SaleItem) {
    const product = productById.get(item.productId);
    if (!product) return;
    setSale((c) => addSaleItem({ sale: c, product, quantity: 1, priceMode: formState.priceMode }));
  }

  function addFromSheet() {
    if (!selectedProduct) return;
    const qty = parseNumber(sheetQuantity || "1");
    if (qty <= 0) return;
    const nextSale = addSaleItem({ sale, product: selectedProduct, quantity: qty, priceMode: formState.priceMode });
    setSale(nextSale);
    const added = nextSale.items.find((i) => i.productId === selectedProduct.id);
    if (added) {
      setLastAddedItemId(added.id);
      setTimeout(() => setLastAddedItemId(null), 600);
    }
    setSearchSheetOpen(false);
    setSelectedProductId(null);
    setSheetQuery("");
    setSheetQuantity("1");
    setErrors([]);
  }

  function addSheetPayment() {
    const amount = parseNumber(sheetPaymentAmount || String(sheetBalance));
    if (amount <= 0) return;
    const capped = Math.min(amount, sheetBalance);
    setSheetPayments((prev) => [
      ...prev,
      { id: `sp-${Date.now()}`, method: sheetPaymentMethod, amount: capped },
    ]);
    setSheetPaymentAmount("");
  }

  function removeSheetPayment(id: string) {
    setSheetPayments((prev) => prev.filter((p) => p.id !== id));
  }

  function confirmSheetPayments() {
    let current = sale;
    for (const p of sheetPayments) {
      current = addSalePayment({ sale: current, method: p.method, amount: p.amount });
    }
    setSale(current);
    setSheetPayments([]);
    setPaymentSheetOpen(false);
  }

  function openPaymentSheet() {
    setSheetPayments([]);
    setSheetPaymentAmount("");
    setPaymentSheetOpen(true);
  }

  // ────────────────────────────────────────────────────────────────
  return (
    <main
      className="relative overflow-hidden"
      style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#FAFAF9" }}
    >
      {/* ── HEADER ── */}
      <header
        className="shrink-0 flex items-center gap-3 px-4"
        style={{
          height: 52,
          background: "#1A1917",
          borderBottom: "0.5px solid #2C2C2A",
          animation: "slideDown 300ms 50ms both",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="grid place-items-center rounded-md font-bold text-xs"
            style={{ width: 26, height: 26, background: "#EF9F27", color: "#1A1917", fontFamily: "var(--font-syne)" }}
          >
            MO
          </div>
          <span
            className="text-xs font-bold uppercase tracking-widest text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            PDV
          </span>
        </div>

        {/* Separator */}
        <div className="shrink-0 self-stretch" style={{ width: "0.5px", background: "#2C2C2A" }} />

        {/* Barcode input */}
        <form onSubmit={handleSubmitProduct} className="flex-1 max-w-[360px]">
          <input
            ref={barcodeRef}
            value={formState.query}
            onChange={(e) => updateForm("query", e.target.value)}
            onKeyDown={handleBarcodeKeyDown}
            placeholder="Código de barras ou SKU..."
            autoFocus
            className="w-full h-8 rounded-md px-3 text-sm outline-none transition"
            style={{
              background: "#111110",
              border: "1px solid #2C2C2A",
              color: "#F6F4EF",
              fontFamily: "var(--font-dm-mono)",
            }}
          />
        </form>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-stone-400">{cashSession.cashRegisterName}</p>
            <p
              className="text-xs"
              style={{ color: "#EF9F27", fontFamily: "var(--font-dm-mono)" }}
            >
              {currentTime}
            </p>
          </div>

          <button
            type="button"
            disabled={helpCountdown > 0 || helpLoading}
            onClick={() => void handleCallSupervisor()}
            className="h-8 rounded-md px-3 text-xs font-medium transition"
            style={{
              border: "1px solid #2C2C2A",
              background: "transparent",
              color: helpCountdown > 0 ? "#EF9F27" : "#A8A29E",
            }}
          >
            <Bell className="inline size-3.5 mr-1" />
            {helpLoading ? "Chamando..." : helpCountdown > 0 ? `${helpCountdown}s` : "Supervisor"}
          </button>

          <Link
            href="/caixas"
            className="h-8 rounded-md px-3 text-xs font-bold flex items-center gap-1.5 transition hover:brightness-110"
            style={{
              background: "#EF9F27",
              color: "#1A1917",
              fontFamily: "var(--font-syne)",
            }}
          >
            <ChevronLeft className="size-3.5" />
            Fechar caixa
          </Link>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex-1 overflow-hidden" style={{ display: "grid", gridTemplateColumns: "1fr 280px" }}>

        {/* ── LEFT: CART ── */}
        <section
          className="flex flex-col overflow-hidden"
          style={{ borderRight: "0.5px solid #E4E2DC", background: "#FFFFFF" }}
        >
          {/* Cart top bar */}
          <div
            className="shrink-0 flex items-center gap-3 px-4"
            style={{ height: 40, borderBottom: "0.5px solid #F0EEE9", background: "#FFFFFF" }}
          >
            <h2
              className="text-xs font-bold uppercase tracking-widest text-stone-900"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Carrinho
            </h2>
            <span
              className="rounded px-1.5 py-0.5 text-xs font-bold"
              style={
                sale.items.length > 0
                  ? { background: "#1A1917", color: "#EF9F27" }
                  : { background: "#EFEDE7", color: "#5F5E5A" }
              }
            >
              {sale.items.length}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearSale}
                className="rounded px-2 py-1 text-xs text-stone-400 transition hover:bg-red-50 hover:text-red-600"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => { setSheetQuery(""); setSelectedProductId(null); setSearchSheetOpen(true); }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition"
                style={{ background: "#EFEDE7", color: "#5F5E5A" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#1A1917"; e.currentTarget.style.color = "#EF9F27"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#EFEDE7"; e.currentTarget.style.color = "#5F5E5A"; }}
              >
                <Search className="size-3" />
                Buscar produto
              </button>
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {sale.items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-6">
                <ShoppingCart className="size-10" style={{ color: "#E4E2DC" }} />
                <p className="text-sm font-medium" style={{ color: "#A8A29E" }}>Carrinho vazio</p>
                <p className="text-xs" style={{ color: "#C7C5BF" }}>
                  Use o campo no topo ou "Buscar produto" para adicionar itens
                </p>
              </div>
            ) : (
              <div>
                {sale.items.map((item, idx) => {
                  const product = productById.get(item.productId);
                  return (
                    <CartItem
                      key={item.id}
                      item={item}
                      index={idx}
                      productName={product?.name ?? "Produto removido"}
                      productSku={product?.sku ?? ""}
                      highlighted={item.id === lastAddedItemId}
                      onIncrease={() => increaseCartItem(item)}
                      onDecrease={() => decreaseCartItem(item)}
                      onRemove={() => setSale((c) => removeSaleItem(c, item.id))}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart footer — discount */}
          <div
            className="shrink-0 flex items-center gap-2 px-3 py-2.5"
            style={{ borderTop: "0.5px solid #F0EEE9" }}
          >
            <div className="relative flex-1">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: "#A8A29E" }}
              >
                %
              </span>
              <input
                value={formState.discount}
                onChange={(e) => updateForm("discount", e.target.value)}
                inputMode="decimal"
                placeholder="Desconto (R$)"
                className="h-8 w-full rounded-md pl-7 pr-3 text-sm outline-none transition"
                style={{
                  background: "#F6F4EF",
                  border: "1px solid #E4E2DC",
                  fontFamily: "var(--font-dm-mono)",
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleApplyDiscount}
              className="h-8 rounded-md px-3 text-xs font-medium transition hover:brightness-95"
              style={{ background: "#EFEDE7", color: "#5F5E5A" }}
            >
              Aplicar
            </button>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="shrink-0 px-3 pb-2">
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                {errors.map((e) => (
                  <p key={e} className="text-xs text-red-700">{e}</p>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── RIGHT: TOTALS ── */}
        <aside
          className="flex flex-col overflow-hidden"
          style={{ background: "#F6F4EF" }}
        >
          {/* Total block */}
          <div
            className="shrink-0 px-4 pt-4 pb-3"
            style={{ animation: "fadeUp 250ms both" }}
          >
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "#A8A29E", fontFamily: "var(--font-dm-mono)" }}
            >
              Total
            </p>
            <p
              className="mt-1 leading-none"
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#EF9F27",
                fontFamily: "var(--font-syne)",
              }}
            >
              {formatCurrency(sale.total)}
            </p>
          </div>

          {/* DL summary */}
          <dl
            className="px-4 space-y-1.5 text-xs"
            style={{ animation: "fadeUp 350ms both" }}
          >
            <SummaryRow label="Subtotal" value={formatCurrency(sale.subtotal)} />
            <SummaryRow label="Desconto" value={formatCurrency(sale.discount)} />
            <div style={{ height: "0.5px", background: "#E4E2DC", margin: "6px 0" }} />
            <SummaryRow label="Pago" value={formatCurrency(paidAmount)} valueColor="#3B6D11" />
            <SummaryRow
              label="Saldo"
              value={formatCurrency(balance)}
              bold
              valueColor={balance > 0 && sale.items.length > 0 ? "#C0392B" : undefined}
            />
          </dl>

          {/* Payments registered */}
          <div
            className="mx-3 mt-3 rounded-lg overflow-hidden shrink-0"
            style={{ border: "1px solid #E4E2DC", animation: "fadeUp 450ms both" }}
          >
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold" style={{ color: "#5F5E5A" }}>Pagamentos</span>
              <span
                className="rounded px-1.5 py-0.5 text-xs font-bold"
                style={
                  sale.payments.length > 0
                    ? { background: "#1A1917", color: "#EF9F27" }
                    : { background: "#EFEDE7", color: "#A8A29E" }
                }
              >
                {sale.payments.length}
              </span>
            </div>
            <div className="max-h-28 overflow-y-auto">
              {sale.payments.length === 0 ? (
                <p className="px-3 pb-3 text-xs" style={{ color: "#A8A29E" }}>Nenhum pagamento</p>
              ) : (
                sale.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between px-3 py-1.5"
                    style={{ borderTop: "0.5px solid #F0EEE9" }}
                  >
                    <span className="text-xs font-medium" style={{ color: "#3D3C39" }}>
                      {paymentMethodLabels[payment.method]}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: "#3B6D11", fontFamily: "var(--font-dm-mono)" }}>
                        {formatCurrency(payment.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSale((c) => removeSalePayment(c, payment.id))}
                        className="rounded p-0.5 transition hover:text-red-500"
                        style={{ color: "#C7C5BF" }}
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer buttons */}
          <div
            className="shrink-0 flex flex-col gap-1.5 p-3"
            style={{ animation: "fadeUp 550ms both" }}
          >
            {lastFinishedSale && (
              <div className="rounded-md px-3 py-2 text-xs" style={{ background: "#EFEDE7" }}>
                <span className="font-semibold" style={{ color: "#1A1917" }}>{lastFinishedSale.code}</span>
                <span className="ml-1" style={{ color: "#78716C" }}>finalizada · {formatCurrency(lastFinishedSale.total)}</span>
              </div>
            )}
            <button
              type="button"
              disabled={sale.items.length === 0}
              onClick={openPaymentSheet}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg font-bold text-sm transition disabled:opacity-40"
              style={{
                background: "#EF9F27",
                color: "#1A1917",
                fontFamily: "var(--font-syne)",
              }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
            >
              Registrar pagamento
            </button>
            <button
              type="button"
              disabled={balance !== 0 || sale.items.length === 0 || persistLoading}
              onClick={() => void handleFinishSale()}
              className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition hover:enabled:bg-stone-900 hover:enabled:text-white disabled:opacity-40"
              style={{ border: "1px solid #E4E2DC", color: "#888780" }}
            >
              <CheckCircle2 className="size-3.5" />
              {persistLoading ? "Salvando..." : "Finalizar venda"}
            </button>
            {balance === 0 && sale.items.length > 0 && (
              <button
                type="button"
                disabled={persistLoading}
                onClick={() => void handleFinishWithNf()}
                className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition hover:enabled:bg-stone-900 hover:enabled:text-white disabled:opacity-40"
                style={{ border: "1px solid #E4E2DC", color: "#888780" }}
              >
                <FileText className="size-3.5" />
                Finalizar com NF
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* ── SHEET: PRODUCT SEARCH ── */}
      {searchSheetOpen && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end"
          style={{ background: "rgba(26,25,23,.6)", backdropFilter: "blur(2px)", animation: "overlayIn 200ms both" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchSheetOpen(false); }}
        >
          <div
            className="flex flex-col overflow-hidden"
            style={{
              background: "#FFFFFF",
              borderRadius: "12px 12px 0 0",
              maxHeight: "85dvh",
              animation: "sheetIn 250ms both",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div style={{ width: 36, height: 3, borderRadius: 99, background: "#E4E2DC" }} />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-4 pb-3 shrink-0">
              <div>
                <p className="text-sm font-bold" style={{ fontFamily: "var(--font-syne)", color: "#1A1917" }}>
                  Buscar produto
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#A8A29E" }}>
                  Selecione e defina a quantidade
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSearchSheetOpen(false)}
                className="rounded-lg p-1.5 transition"
                style={{ background: "#F0EEE9", color: "#5F5E5A" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#1A1917"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#F0EEE9"; e.currentTarget.style.color = "#5F5E5A"; }}
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Search input */}
            <div className="px-4 pb-3 shrink-0">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3 size-4" style={{ color: "#A8A29E" }} />
                <input
                  autoFocus
                  value={sheetQuery}
                  onChange={(e) => setSheetQuery(e.target.value)}
                  placeholder="Nome ou SKU..."
                  className="h-10 w-full rounded-lg pl-9 pr-24 text-sm outline-none transition"
                  style={{
                    border: "1px solid #E4E2DC",
                    background: "#FAFAF9",
                  }}
                />
                <span
                  className="absolute right-3 rounded px-1.5 py-0.5 text-xs font-medium"
                  style={{ background: "#EFEDE7", color: "#78716C" }}
                >
                  {sheetFilteredProducts.length} produtos
                </span>
              </div>
            </div>

            {/* Product list */}
            <div className="flex-1 overflow-y-auto px-4">
              {sheetFilteredProducts.map((product, idx) => {
                const isSelected = product.id === selectedProductId;
                const isLowStock = product.currentStock > 0 && product.currentStock <= product.minimumStock;
                const isZero = product.currentStock === 0;
                const price = getProductSalePrice(product, formState.priceMode);

                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={isZero}
                    onClick={() => !isZero && setSelectedProductId(isSelected ? null : product.id)}
                    className="flex w-full items-center gap-3 rounded-md py-2.5 px-3 text-left transition disabled:opacity-40"
                    style={{
                      borderLeft: isSelected ? "3px solid #EF9F27" : "3px solid transparent",
                      background: isSelected ? "#FEF9EC" : "transparent",
                      animation: `fadeUp ${200 + idx * 30}ms both`,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isZero) e.currentTarget.style.background = "#FAFAF8";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Package className="size-4 shrink-0" style={{ color: "#C7C5BF" }} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium" style={{ color: "#1A1917" }}>{product.name}</p>
                      <p className="text-xs" style={{ color: "#A8A29E", fontFamily: "var(--font-dm-mono)" }}>{product.sku}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold" style={{ color: "#1A1917", fontFamily: "var(--font-dm-mono)" }}>
                        {formatCurrency(price)}
                      </p>
                      {isZero ? (
                        <span className="text-xs font-medium text-red-500">Sem estoque</span>
                      ) : isLowStock ? (
                        <span className="text-xs font-medium" style={{ color: "#854F0B" }}>
                          ⚠ estoque baixo
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "#3B6D11", fontFamily: "var(--font-dm-mono)" }}>
                          {product.currentStock} un.
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sheet footer */}
            <div
              className="shrink-0 flex items-center gap-3 px-4 py-3"
              style={{ borderTop: "1px solid #F0EEE9", background: "#F6F4EF" }}
            >
              <label className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium" style={{ color: "#78716C" }}>Qtd.</span>
                <input
                  value={sheetQuantity}
                  onChange={(e) => setSheetQuantity(e.target.value)}
                  inputMode="decimal"
                  className="h-9 rounded-md text-center text-sm font-medium outline-none transition"
                  style={{
                    width: 64,
                    border: "1px solid #E4E2DC",
                    background: "#FFFFFF",
                    fontFamily: "var(--font-dm-mono)",
                  }}
                />
              </label>
              <button
                type="button"
                disabled={!selectedProduct}
                onClick={addFromSheet}
                className="flex-1 h-9 rounded-lg text-sm font-semibold transition disabled:opacity-40"
                style={{ background: "#1A1917", color: "#FFFFFF", fontFamily: "var(--font-syne)" }}
              >
                Adicionar ao carrinho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SHEET: PAYMENT ── */}
      {paymentSheetOpen && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end"
          style={{ background: "rgba(26,25,23,.6)", backdropFilter: "blur(2px)", animation: "overlayIn 200ms both" }}
          onClick={(e) => { if (e.target === e.currentTarget) setPaymentSheetOpen(false); }}
        >
          <div
            className="flex flex-col overflow-hidden"
            style={{
              background: "#FFFFFF",
              borderRadius: "12px 12px 0 0",
              maxHeight: "90dvh",
              animation: "sheetIn 250ms both",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div style={{ width: 36, height: 3, borderRadius: 99, background: "#E4E2DC" }} />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-4 pb-3 shrink-0">
              <div>
                <p className="text-sm font-bold" style={{ fontFamily: "var(--font-syne)", color: "#1A1917" }}>
                  Pagamento
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#A8A29E" }}>
                  Registre um ou mais métodos de pagamento
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentSheetOpen(false)}
                className="rounded-lg p-1.5 transition"
                style={{ background: "#F0EEE9", color: "#5F5E5A" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#1A1917"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#F0EEE9"; e.currentTarget.style.color = "#5F5E5A"; }}
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Total card */}
            <div
              className="mx-4 mb-3 rounded-lg flex items-center justify-between px-4 py-3 shrink-0"
              style={{ background: "#1A1917" }}
            >
              <div>
                <p className="text-xs" style={{ color: "#78716C" }}>Total da venda</p>
                <p className="text-lg font-bold" style={{ color: "#EF9F27", fontFamily: "var(--font-dm-mono)" }}>
                  {formatCurrency(sale.total)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "#78716C" }}>Saldo</p>
                <p className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-dm-mono)" }}>
                  {formatCurrency(sheetBalance)}
                </p>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-2">
              {/* Method grid */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "#5F5E5A" }}>Método</p>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.entries(paymentMethodLabels) as [PaymentMethod, string][]).map(([method, label]) => {
                    const active = sheetPaymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setSheetPaymentMethod(method)}
                        className="flex h-13 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium transition"
                        style={{
                          height: 52,
                          border: active ? "1.5px solid #EF9F27" : "1px solid #E4E2DC",
                          background: active ? "#EF9F27" : "#F6F4EF",
                          color: active ? "#1A1917" : "#78716C",
                          fontWeight: active ? 700 : 500,
                        }}
                      >
                        {PAYMENT_ICONS[method]}
                        <span className="text-[10px]">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount input */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "#5F5E5A" }}>Valor</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: "#A8A29E" }}
                    >
                      R$
                    </span>
                    <input
                      value={sheetPaymentAmount}
                      onChange={(e) => setSheetPaymentAmount(e.target.value)}
                      inputMode="decimal"
                      placeholder={formatCurrency(sheetBalance).replace("R$ ", "")}
                      className="h-10 w-full rounded-lg pl-8 pr-3 text-sm outline-none transition"
                      style={{
                        border: "1px solid #E4E2DC",
                        background: "#FAFAF9",
                        fontFamily: "var(--font-dm-mono)",
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addSheetPayment}
                    className="flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-semibold transition"
                    style={{ background: "#1A1917", color: "#FFFFFF" }}
                  >
                    <Plus className="size-4" />
                    Registrar
                  </button>
                </div>
              </div>

              {/* Registered list */}
              <div>
                <div
                  className="rounded-lg overflow-hidden"
                  style={{ border: "1px solid #E4E2DC" }}
                >
                  <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "0.5px solid #F0EEE9" }}>
                    <span className="text-xs font-semibold" style={{ color: "#5F5E5A" }}>Registrados</span>
                    {sheetPayments.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSheetPayments([])}
                        className="text-xs transition hover:text-red-500"
                        style={{ color: "#A8A29E" }}
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  {sheetPayments.length === 0 ? (
                    <p className="px-3 py-3 text-xs" style={{ color: "#A8A29E" }}>Nenhum pagamento registrado</p>
                  ) : (
                    sheetPayments.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-3 py-2"
                        style={{ borderTop: "0.5px solid #F0EEE9" }}
                      >
                        <span className="text-xs font-semibold" style={{ color: "#1A1917" }}>
                          {paymentMethodLabels[p.method]}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium" style={{ color: "#3B6D11", fontFamily: "var(--font-dm-mono)" }}>
                            {formatCurrency(p.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSheetPayment(p.id)}
                            className="rounded p-0.5 transition hover:text-red-500"
                            style={{ color: "#C7C5BF" }}
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Final balance box */}
              <div
                className="rounded-lg px-4 py-3 transition-colors"
                style={{ background: "#F6F4EF" }}
              >
                <p className="text-xs" style={{ color: "#A8A29E" }}>Saldo restante</p>
                <p
                  className="text-2xl font-bold transition-colors"
                  style={{
                    color: sheetBalance === 0 ? "#3B6D11" : "#1A1917",
                    fontFamily: "var(--font-dm-mono)",
                  }}
                >
                  {formatCurrency(sheetBalance)}
                </p>
              </div>
            </div>

            {/* Confirm button */}
            <div className="shrink-0 px-4 py-3" style={{ borderTop: "0.5px solid #F0EEE9" }}>
              <button
                type="button"
                disabled={sheetPayments.length === 0}
                onClick={confirmSheetPayments}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg font-bold text-sm transition disabled:opacity-40"
                style={{
                  background: "#EF9F27",
                  color: "#1A1917",
                  fontFamily: "var(--font-syne)",
                }}
              >
                <CheckCircle2 className="size-4" />
                Confirmar e aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NF MODAL (logic preserved) ── */}
      {nfModalOpen && (
        <div
          className="absolute inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(26,25,23,.75)", animation: "overlayIn 200ms both" }}
        >
          <div
            className="w-full max-w-sm rounded-xl p-6 shadow-2xl"
            style={{ background: "#1C1917", animation: "sheetIn 200ms both" }}
          >
            <h2 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>
              Emitir NF-e
            </h2>
            <p className="mt-1 text-xs" style={{ color: "#78716C" }}>Venda {pendingSale?.code} finalizada</p>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium" style={{ color: "#A8A29E" }}>CPF ou CNPJ</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={nfDocument}
                    onChange={(e) => { setNfDocument(e.target.value); setNfLookupName(null); setNfLookupId(null); }}
                    placeholder="000.000.000-00"
                    className="h-10 flex-1 rounded-lg px-3 text-sm text-white outline-none transition"
                    style={{ border: "1px solid #2C2C2A", background: "#111110" }}
                  />
                  <button
                    type="button"
                    onClick={() => void handleLookupCustomer()}
                    disabled={nfLoading || !nfDocument.trim()}
                    className="rounded-lg px-3 transition disabled:opacity-50"
                    style={{ border: "1px solid #2C2C2A", background: "#111110", color: "#78716C" }}
                  >
                    <Search className="size-4" />
                  </button>
                </div>
              </label>
              {nfLookupName && (
                <p className="text-xs" style={{ color: "#EF9F27" }}>Cliente: {nfLookupName}</p>
              )}
              {nfLookupName === null && nfDocument && nfLookupId === null && !nfLoading && (
                <p className="text-xs" style={{ color: "#78716C" }}>
                  Documento não cadastrado — NF emitida sem vínculo.
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSkipNf}
                  className="flex-1 h-10 rounded-lg text-sm font-medium transition"
                  style={{ border: "1px solid #2C2C2A", color: "#A8A29E" }}
                >
                  Sem NF
                </button>
                <button
                  type="button"
                  disabled={nfLoading || !nfDocument.trim()}
                  onClick={() => void handleRequestNfe()}
                  className="flex-1 h-10 rounded-lg text-sm font-bold transition disabled:opacity-50"
                  style={{ background: "#EF9F27", color: "#1A1917", fontFamily: "var(--font-syne)" }}
                >
                  {nfLoading ? "Enviando..." : "Solicitar NF-e"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── sub-components ──────────────────────────────────────────────────
function CartItem({
  item, index, productName, productSku, highlighted,
  onIncrease, onDecrease, onRemove,
}: {
  item: SaleItem;
  index: number;
  productName: string;
  productSku: string;
  highlighted: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 transition-colors"
      style={{
        borderBottom: "0.5px solid #F6F4EF",
        background: highlighted ? "#FFFBF0" : "transparent",
        animation: `fadeUp ${200 + index * 40}ms both`,
      }}
      onMouseEnter={(e) => { if (!highlighted) (e.currentTarget as HTMLDivElement).style.background = "#FAFAF8"; }}
      onMouseLeave={(e) => { if (!highlighted) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    >
      {/* Seq number */}
      <span
        className="shrink-0 grid place-items-center rounded"
        style={{
          width: 18, height: 18,
          background: "#F0EEE9",
          color: "#A8A29E",
          fontSize: 8,
          fontFamily: "var(--font-dm-mono)",
        }}
      >
        {index + 1}
      </span>

      {/* Name + SKU */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" style={{ color: "#1A1917" }}>{productName}</p>
        <p className="text-xs" style={{ color: "#A8A29E", fontFamily: "var(--font-dm-mono)" }}>{productSku}</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onDecrease}
          className="grid place-items-center rounded transition"
          style={{ width: 20, height: 20, border: "1px solid #E4E2DC", color: "#78716C" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#1A1917"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#1A1917"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#78716C"; e.currentTarget.style.borderColor = "#E4E2DC"; }}
        >
          <Minus className="size-2.5" />
        </button>
        <span
          className="w-7 text-center text-xs font-semibold"
          style={{ color: "#1A1917", fontFamily: "var(--font-dm-mono)" }}
        >
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={onIncrease}
          className="grid place-items-center rounded transition"
          style={{ width: 20, height: 20, border: "1px solid #E4E2DC", color: "#78716C" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#1A1917"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#1A1917"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#78716C"; e.currentTarget.style.borderColor = "#E4E2DC"; }}
        >
          <Plus className="size-2.5" />
        </button>
      </div>

      {/* Total */}
      <span
        className="shrink-0 text-right text-xs font-bold"
        style={{ minWidth: 58, color: "#1A1917", fontFamily: "var(--font-dm-mono)" }}
      >
        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.total)}
      </span>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-0.5 transition"
        style={{ color: "#C7C5BF" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#C7C5BF"; }}
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

function SummaryRow({
  label, value, bold, valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt style={{ color: "#A8A29E" }}>{label}</dt>
      <dd
        style={{
          color: valueColor ?? "#3D3C39",
          fontWeight: bold ? 700 : 500,
          fontFamily: "var(--font-dm-mono)",
        }}
      >
        {value}
      </dd>
    </div>
  );
}
