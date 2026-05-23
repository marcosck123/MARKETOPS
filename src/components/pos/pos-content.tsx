"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Barcode,
  Bell,
  CheckCircle2,
  FileText,
  Monitor,
  Percent,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
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
  type SalePriceMode,
  paymentMethodLabels,
} from "@/lib/sale-data";

type PosFormState = {
  query: string;
  quantity: string;
  priceMode: SalePriceMode;
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

export function PosContent({ products: propProducts, cashSession }: Props) {
  const router = useRouter();
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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(formatTime()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (helpCountdown <= 0) return;
    const timer = setTimeout(() => setHelpCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [helpCountdown]);

  const activeProducts = useMemo(
    () => products.filter((p) => p.status === "active"),
    [products],
  );

  const productById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

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

  const paidAmount = getPaidAmount(sale.payments);
  const balance = getSaleBalance(sale);

  function updateForm<K extends keyof PosFormState>(key: K, value: PosFormState[K]) {
    setFormState((c) => ({ ...c, [key]: value }));
  }

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
    setErrors([]);
    router.refresh();
  }

  async function handleFinishSale() {
    const result = finishSale({
      sale,
      products,
      finishedAt: new Date().toLocaleString("pt-BR"),
    });
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
    const result = finishSale({
      sale,
      products,
      finishedAt: new Date().toLocaleString("pt-BR"),
    });
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

    if (!result.success) {
      setErrors([result.error]);
    }

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

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500 text-sm font-bold text-slate-950">
            M
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">MARKETOPS PDV</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {cashSession.cashRegisterName} | {cashSession.operatorName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="tabular-nums text-sm text-slate-300">{currentTime}</p>
          <Button
            variant="outline"
            size="sm"
            disabled={helpCountdown > 0 || helpLoading}
            onClick={() => void handleCallSupervisor()}
            className={cn(
              "border-slate-700 bg-slate-900 text-white hover:bg-slate-800",
              helpCountdown > 0 && "border-amber-600 bg-amber-950 text-amber-400 hover:bg-amber-950",
            )}
          >
            <Bell className="size-4" aria-hidden="true" />
            {helpLoading
              ? "Chamando..."
              : helpCountdown > 0
                ? `Aguardando... (${helpCountdown}s)`
                : "Chamar Supervisor"}
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
          >
            <Link href="/vendas">
              <Monitor className="size-4" aria-hidden="true" />
              Vendas
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-57px)] gap-3 p-3 xl:grid-cols-[minmax(360px,1fr)_minmax(340px,0.85fr)_320px]">
        {/* Products */}
        <section className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-3">
            <form
              onSubmit={handleSubmitProduct}
              className="grid grid-cols-[1fr_80px_auto] items-end gap-2"
            >
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Produto</span>
                <div className="relative">
                  <Barcode
                    className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    value={formState.query}
                    onChange={(e) => updateForm("query", e.target.value)}
                    placeholder="Código, SKU ou nome"
                    className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-200"
                    autoFocus
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Qtd.</span>
                <input
                  value={formState.quantity}
                  onChange={(e) => updateForm("quantity", e.target.value)}
                  inputMode="decimal"
                  className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-200"
                />
              </label>
              <Button type="submit" size="sm" className="h-9 bg-slate-950 text-white hover:bg-slate-800">
                <Plus className="size-3.5" aria-hidden="true" />
                Adicionar
              </Button>
            </form>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Produtos
              </span>
              <StatusBadge label={`${filteredProducts.length} exibidos`} tone="info" />
            </div>
            <div className="flex flex-col gap-1">
              {filteredProducts.map((product) => {
                const price = getProductSalePrice(product, formState.priceMode);
                const isLowStock =
                  product.currentStock > 0 && product.currentStock <= product.minimumStock;
                const isZeroStock = product.currentStock === 0;

                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={isZeroStock}
                    onClick={() => addProductToSale(product)}
                    className={cn(
                      "flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-left text-sm transition",
                      "hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-1 focus:ring-emerald-200",
                      isLowStock && "border-l-2 border-l-amber-400",
                      isZeroStock && "cursor-not-allowed opacity-40",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-950">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.sku}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-slate-950">{formatCurrency(price)}</p>
                      {isZeroStock ? (
                        <span className="text-xs font-medium text-red-500">Sem estoque</span>
                      ) : isLowStock ? (
                        <span className="text-xs font-medium text-amber-600">Estoque baixo</span>
                      ) : (
                        <span className="text-xs text-slate-400">{product.currentStock} un.</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Cart */}
        <section className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">Carrinho</h2>
              <p className="text-xs text-slate-400">
                {sale.code} | {sale.items.length} iten{sale.items.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleClearSale}>
              <X className="size-3.5" aria-hidden="true" />
              Limpar
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {sale.items.length === 0 ? (
              <div className="grid h-full min-h-48 place-items-center text-center">
                <div>
                  <ShoppingCart className="mx-auto size-9 text-slate-200" />
                  <p className="mt-2 text-xs font-medium text-slate-400">Venda sem itens</p>
                </div>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Item</th>
                    <th className="px-3 py-2 font-semibold">Qtd.</th>
                    <th className="px-3 py-2 font-semibold">Total</th>
                    <th className="px-3 py-2 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items.map((item) => {
                    const product = productById.get(item.productId);
                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          "text-slate-700 transition-colors duration-500",
                          item.id === lastAddedItemId && "bg-emerald-50",
                        )}
                      >
                        <td className="px-3 py-2">
                          <p className="font-medium leading-tight text-slate-950">
                            {product?.name ?? "Produto removido"}
                          </p>
                          <p className="mt-0.5 text-slate-400">{formatCurrency(item.unitPrice)}</p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">{item.quantity}</td>
                        <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-950">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setSale((c) => removeSaleItem(c, item.id))}
                          >
                            <Trash2 className="size-3" aria-hidden="true" />
                            <span className="sr-only">Remover</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="border-t border-slate-200 p-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Percent
                  className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  value={formState.discount}
                  onChange={(e) => updateForm("discount", e.target.value)}
                  inputMode="decimal"
                  placeholder="Desconto (R$)"
                  className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-200"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9"
                onClick={handleApplyDiscount}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </section>

        {/* Payment */}
        <aside className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="rounded-lg bg-slate-950 p-4 text-white">
              <p className="text-xs font-medium tracking-wide text-slate-400">TOTAL</p>
              <p className="mt-1 text-4xl font-bold tabular-nums">{formatCurrency(sale.total)}</p>
            </div>

            <dl className="mt-3 space-y-2 text-sm">
              <TotalRow label="Subtotal" value={formatCurrency(sale.subtotal)} />
              <TotalRow label="Desconto" value={formatCurrency(sale.discount)} />
              <TotalRow label="Pago" value={formatCurrency(paidAmount)} />
              <TotalRow
                label="Saldo"
                value={formatCurrency(balance)}
                highlight={balance > 0 && sale.items.length > 0}
              />
            </dl>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">
                  Valor do pagamento
                </span>
                <input
                  value={formState.paymentAmount}
                  onChange={(e) => updateForm("paymentAmount", e.target.value)}
                  inputMode="decimal"
                  placeholder={formatCurrency(balance)}
                  className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-200"
                />
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(paymentMethodLabels).map(([method, label]) => (
                  <Button
                    key={method}
                    type="button"
                    variant={formState.paymentMethod === method ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAddPayment(method as PaymentMethod)}
                    className={cn(
                      "text-xs",
                      formState.paymentMethod === method &&
                        "bg-slate-950 text-white hover:bg-slate-800",
                    )}
                  >
                    <BadgeDollarSign className="size-3.5" aria-hidden="true" />
                    {label}
                  </Button>
                ))}
              </div>

              <div className="rounded-md border border-slate-200">
                <div className="border-b border-slate-200 px-3 py-1.5">
                  <p className="text-xs font-semibold text-slate-700">Pagamentos</p>
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {sale.payments.length === 0 ? (
                    <p className="px-3 py-3 text-xs text-slate-400">Nenhum pagamento</p>
                  ) : (
                    sale.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-1.5 last:border-0"
                      >
                        <div>
                          <p className="text-xs font-medium text-slate-950">
                            {paymentMethodLabels[payment.method]}
                          </p>
                          <p className="text-xs text-slate-400">{formatCurrency(payment.amount)}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setSale((c) => removeSalePayment(c, payment.id))}
                        >
                          <Trash2 className="size-3" aria-hidden="true" />
                          <span className="sr-only">Remover pagamento</span>
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-200 p-3">
            {errors.length > 0 && (
              <div className="rounded-md border border-red-200 bg-red-50 p-2.5">
                <ul className="space-y-0.5 text-xs text-red-800">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {lastFinishedSale && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2.5">
                <p className="text-xs font-semibold text-emerald-900">
                  {lastFinishedSale.code} finalizada
                </p>
                <p className="text-xs text-emerald-700">{formatCurrency(lastFinishedSale.total)}</p>
              </div>
            )}
            <div className={cn("grid gap-2", balance === 0 && sale.items.length > 0 && "grid-cols-2")}>
              {balance === 0 && sale.items.length > 0 && (
                <Button
                  type="button"
                  disabled={persistLoading}
                  onClick={() => void handleFinishWithNf()}
                  className="h-14 w-full border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-70"
                >
                  <FileText className="size-5" aria-hidden="true" />
                  {persistLoading ? "..." : "Emitir NF"}
                </Button>
              )}
              <Button
                type="button"
                disabled={persistLoading}
                onClick={() => void handleFinishSale()}
                className={cn(
                  "h-14 w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-70",
                  balance === 0 && sale.items.length > 0 && "col-span-1",
                )}
              >
                <CheckCircle2 className="size-5" aria-hidden="true" />
                {persistLoading ? "Salvando..." : "Finalizar venda"}
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {nfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 p-6 shadow-xl">
            <h2 className="text-base font-semibold text-white">Emitir NF-e</h2>
            <p className="mt-1 text-xs text-slate-400">Venda {pendingSale?.code} finalizada</p>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-300">CPF ou CNPJ</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={nfDocument}
                    onChange={(e) => {
                      setNfDocument(e.target.value);
                      setNfLookupName(null);
                      setNfLookupId(null);
                    }}
                    placeholder="000.000.000-00"
                    className="h-10 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => void handleLookupCustomer()}
                    disabled={nfLoading || !nfDocument.trim()}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-50"
                    title="Buscar cliente"
                  >
                    <Search className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </label>

              {nfLookupName && (
                <p className="text-xs text-emerald-400">Cliente: {nfLookupName}</p>
              )}
              {nfLookupName === null && nfDocument && nfLookupId === null && !nfLoading && (
                <p className="text-xs text-slate-400">Documento não cadastrado — NF emitida sem vínculo.</p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  onClick={handleSkipNf}
                >
                  Sem NF
                </Button>
                <Button
                  type="button"
                  disabled={nfLoading || !nfDocument.trim()}
                  onClick={() => void handleRequestNfe()}
                  className="flex-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  {nfLoading ? "Enviando..." : "Solicitar NF-e"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function TotalRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className={cn("font-semibold", highlight ? "text-red-600" : "text-slate-950")}>
        {value}
      </dd>
    </div>
  );
}
