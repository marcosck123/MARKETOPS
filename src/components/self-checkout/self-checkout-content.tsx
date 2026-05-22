"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  Barcode,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  Minus,
  Package,
  Plus,
  QrCode,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { initialCashSessions } from "@/lib/cash-data";
import { type Product, initialProducts } from "@/lib/product-data";
import {
  addSaleItem,
  addSalePayment,
  finishSale,
  getPaidAmount,
  getProductSalePrice,
  getSaleBalance,
  removeSaleItem,
  removeSalePayment,
  roundMoney,
  createSale,
} from "@/lib/sale-engine";
import {
  type PaymentMethod,
  type Sale,
  paymentMethodLabels,
} from "@/lib/sale-data";
import {
  type SelfCheckoutAssistanceReason,
  initialSelfCheckoutRequests,
  initialSelfCheckoutStations,
  selfCheckoutAssistanceReasonLabels,
  selfCheckoutPaymentMethods,
} from "@/lib/self-checkout-data";

type SelfCheckoutStep = "scan" | "payment" | "finished";

type AssistanceState = {
  reason: SelfCheckoutAssistanceReason;
  message: string;
};

const station = initialSelfCheckoutStations[0];
const openCashSession = initialCashSessions.find(
  (session) => session.status === "open",
);

function createSelfCheckoutSale(sequence: number) {
  return createSale({
    sequence,
    customerId: "cliente-balcao",
    cashSessionId: openCashSession?.id ?? "self-checkout-session",
    operator: `${station.code} | ${station.attendantName}`,
    notes: "Venda iniciada no self-checkout.",
    createdAt: "20/05/2026 agora",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function findProductByQuery(products: Product[], query: string) {
  const search = query.trim().toLowerCase();

  if (!search) {
    return null;
  }

  return (
    products.find(
      (product) =>
        product.barcode === search ||
        product.sku.toLowerCase() === search ||
        product.name.toLowerCase() === search,
    ) ??
    products.find(
      (product) =>
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.barcode.includes(search),
    ) ??
    null
  );
}

export function SelfCheckoutContent() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [saleSequence, setSaleSequence] = useState(4001);
  const [sale, setSale] = useState<Sale>(() => createSelfCheckoutSale(4001));
  const [query, setQuery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<SelfCheckoutStep>("scan");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [errors, setErrors] = useState<string[]>([]);
  const [finishedSale, setFinishedSale] = useState<Sale | null>(null);
  const [assistance, setAssistance] = useState<AssistanceState | null>(null);
  const [requests, setRequests] = useState(initialSelfCheckoutRequests);

  const activeProducts = useMemo(
    () => products.filter((product) => product.status === "active"),
    [products],
  );
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const featuredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return activeProducts.slice(0, 6);
    }

    return activeProducts
      .filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.sku.toLowerCase().includes(search) ||
          product.barcode.includes(search),
      )
      .slice(0, 8);
  }, [activeProducts, query]);

  const paidAmount = getPaidAmount(sale.payments);
  const balance = getSaleBalance(sale);
  const openRequests = requests.filter((request) => request.status === "open");

  function addProduct(product: Product, nextQuantity = quantity) {
    if (nextQuantity <= 0) {
      return;
    }

    setSale((current) =>
      addSaleItem({
        sale: current,
        product,
        quantity: nextQuantity,
        priceMode: "retail",
      }),
    );
    setQuery("");
    setQuantity(1);
    setErrors([]);
    setStep("scan");
  }

  function handleScanSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const product = findProductByQuery(activeProducts, query);

    if (!product) {
      setErrors(["Produto nao encontrado. Peca ajuda a um atendente."]);
      return;
    }

    addProduct(product);
  }

  function updateItemQuantity(itemId: string, delta: number) {
    const item = sale.items.find((currentItem) => currentItem.id === itemId);

    if (!item) {
      return;
    }

    const product = productById.get(item.productId);
    const nextQuantity = roundMoney(item.quantity + delta);

    if (!product || nextQuantity <= 0) {
      setSale((current) => removeSaleItem(current, itemId));
      return;
    }

    setSale((current) => {
      const withoutItem = removeSaleItem(current, itemId);

      return addSaleItem({
        sale: withoutItem,
        product,
        quantity: nextQuantity,
        priceMode: "retail",
      });
    });
  }

  function simulatePayment(method: PaymentMethod) {
    if (sale.items.length === 0) {
      setErrors(["Adicione pelo menos um produto antes de pagar."]);
      return;
    }

    setPaymentMethod(method);
    setSale((current) =>
      addSalePayment({
        sale: current,
        method,
        amount: Math.max(0, getSaleBalance(current)),
      }),
    );
    setErrors([]);
  }

  function finishSelfCheckout() {
    const result = finishSale({
      sale,
      products,
      finishedAt: "20/05/2026 agora",
    });

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setProducts(result.products);
    setFinishedSale(result.sale);
    setStep("finished");
    setErrors([]);
  }

  function startNewSale() {
    const nextSequence = saleSequence + 1;

    setSaleSequence(nextSequence);
    setSale(createSelfCheckoutSale(nextSequence));
    setQuery("");
    setQuantity(1);
    setStep("scan");
    setPaymentMethod("pix");
    setErrors([]);
    setFinishedSale(null);
    setAssistance(null);
  }

  function requestAssistance(reason: SelfCheckoutAssistanceReason) {
    const nextRequest = {
      id: `assist-${requests.length + 2001}`,
      stationCode: station.code,
      reason,
      status: "open" as const,
      requestedAt: "20/05/2026 agora",
      resolvedAt: "",
    };

    setRequests((current) => [nextRequest, ...current]);
    setAssistance({
      reason,
      message: "Um atendente foi chamado para este terminal.",
    });
  }

  function resolveAssistance() {
    setRequests((current) =>
      current.map((request) =>
        request.stationCode === station.code && request.status === "open"
          ? {
              ...request,
              status: "resolved",
              resolvedAt: "20/05/2026 agora",
            }
          : request,
      ),
    );
    setAssistance(null);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-500 text-xl font-bold text-slate-950">
              M
            </div>
            <div>
              <p className="text-xl font-semibold">MARKETOPS Self-checkout</p>
              <p className="text-sm text-slate-400">
                {station.code} | {station.storeName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              label={assistance ? "Atendente chamado" : "Terminal pronto"}
              tone={assistance ? "warning" : "success"}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => requestAssistance("payment_help")}
              className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
            >
              <HelpCircle className="size-4" aria-hidden="true" />
              Chamar ajuda
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
            >
              <Link href="/pdv">Modo operador</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-81px)] gap-5 p-5 xl:grid-cols-[minmax(420px,1fr)_minmax(420px,0.95fr)_360px]">
        <section className="flex min-h-0 flex-col rounded-lg border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <Barcode className="size-6 text-emerald-400" aria-hidden="true" />
              <div>
                <h1 className="text-lg font-semibold">Passe seus produtos</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Use codigo de barras, SKU ou toque em um produto da lista.
                </p>
              </div>
            </div>

            <form onSubmit={handleScanSubmit} className="mt-5 space-y-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Leia ou digite o codigo"
                  className="h-16 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 pl-12 text-lg text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  autoFocus
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
                <div className="flex h-14 items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="text-white hover:bg-slate-800"
                  >
                    <Minus className="size-4" aria-hidden="true" />
                    <span className="sr-only">Diminuir quantidade</span>
                  </Button>
                  <span className="text-lg font-semibold">{quantity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="text-white hover:bg-slate-800"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    <span className="sr-only">Aumentar quantidade</span>
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="h-14 bg-emerald-500 text-base text-slate-950 hover:bg-emerald-400"
                >
                  <Plus className="size-5" aria-hidden="true" />
                  Adicionar produto
                </Button>
              </div>
            </form>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="grid gap-3 md:grid-cols-2">
              {featuredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product, 1)}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-left transition hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{product.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {product.barcode}
                      </p>
                    </div>
                    <Package className="size-5 shrink-0 text-emerald-400" />
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Estoque {product.currentStock}
                    </p>
                    <p className="text-xl font-semibold text-emerald-300">
                      {formatCurrency(getProductSalePrice(product, "retail"))}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-lg border border-slate-800 bg-white text-slate-950">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
            <div>
              <h2 className="text-lg font-semibold">Sua compra</h2>
              <p className="mt-1 text-sm text-slate-500">
                {sale.code} | {sale.items.length} item(ns)
              </p>
            </div>
            <Button type="button" variant="outline" onClick={startNewSale}>
              <X className="size-4" aria-hidden="true" />
              Cancelar
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {sale.items.length === 0 ? (
              <div className="grid h-full min-h-72 place-items-center p-8 text-center">
                <div>
                  <ShoppingCart className="mx-auto size-12 text-slate-300" />
                  <p className="mt-4 text-lg font-semibold text-slate-700">
                    Carrinho vazio
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Passe o primeiro produto para iniciar.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sale.items.map((item) => {
                  const product = productById.get(item.productId);

                  return (
                    <article key={item.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {product?.name ?? "Produto removido"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatCurrency(item.unitPrice)} cada
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setSale((current) =>
                              removeSaleItem(current, item.id),
                            )
                          }
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          <span className="sr-only">Remover item</span>
                        </Button>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => updateItemQuantity(item.id, -1)}
                          >
                            <Minus className="size-4" aria-hidden="true" />
                            <span className="sr-only">Diminuir item</span>
                          </Button>
                          <span className="min-w-10 text-center text-lg font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => updateItemQuantity(item.id, 1)}
                          >
                            <Plus className="size-4" aria-hidden="true" />
                            <span className="sr-only">Aumentar item</span>
                          </Button>
                        </div>
                        <p className="text-xl font-semibold text-slate-950">
                          {formatCurrency(item.total)}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {errors.length > 0 ? (
            <div className="border-t border-red-200 bg-red-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-700" />
                <ul className="space-y-1 text-sm text-red-800">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="flex min-h-0 flex-col rounded-lg border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-5">
            <p className="text-sm text-slate-400">Total da compra</p>
            <p className="mt-2 text-5xl font-semibold text-white">
              {formatCurrency(sale.total)}
            </p>
            <div className="mt-4 grid gap-2 text-sm text-slate-300">
              <TotalRow label="Pago" value={formatCurrency(paidAmount)} />
              <TotalRow label="Saldo" value={formatCurrency(balance)} />
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="grid grid-cols-3 gap-2">
              {selfCheckoutPaymentMethods.map((method) => (
                <Button
                  key={method}
                  type="button"
                  variant={paymentMethod === method ? "default" : "outline"}
                  onClick={() => simulatePayment(method)}
                  className={
                    paymentMethod === method
                      ? "h-16 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      : "h-16 border-slate-700 bg-slate-950 text-white hover:bg-slate-800"
                  }
                >
                  {method === "pix" ? (
                    <QrCode className="size-5" aria-hidden="true" />
                  ) : (
                    <CreditCard className="size-5" aria-hidden="true" />
                  )}
                  {paymentMethodLabels[method]}
                </Button>
              ))}
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950">
              <div className="border-b border-slate-800 px-4 py-3">
                <p className="text-sm font-semibold text-white">
                  Pagamentos simulados
                </p>
              </div>
              <div className="max-h-44 overflow-y-auto">
                {sale.payments.length === 0 ? (
                  <p className="px-4 py-5 text-sm text-slate-500">
                    Nenhum pagamento registrado.
                  </p>
                ) : (
                  sale.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {paymentMethodLabels[payment.method]}
                        </p>
                        <p className="text-sm text-slate-400">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setSale((current) =>
                            removeSalePayment(current, payment.id),
                          )
                        }
                        className="text-white hover:bg-slate-800"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        <span className="sr-only">Remover pagamento</span>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {assistance ? (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
                <p className="font-semibold">
                  {selfCheckoutAssistanceReasonLabels[assistance.reason]}
                </p>
                <p className="mt-1 text-sm">{assistance.message}</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resolveAssistance}
                  className="mt-3 border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                >
                  Atendente resolveu
                </Button>
              </div>
            ) : null}
          </div>

          <div className="mt-auto space-y-3 border-t border-slate-800 p-5">
            {step === "finished" && finishedSale ? (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-900">
                <p className="font-semibold">Compra finalizada</p>
                <p className="mt-1 text-sm">
                  {finishedSale.code} | {formatCurrency(finishedSale.total)}
                </p>
              </div>
            ) : null}

            {step === "finished" ? (
              <Button
                type="button"
                onClick={startNewSale}
                className="h-14 w-full bg-emerald-500 text-lg text-slate-950 hover:bg-emerald-400"
              >
                <CheckCircle2 className="size-5" aria-hidden="true" />
                Nova compra
              </Button>
            ) : step === "payment" ? (
              <Button
                type="button"
                onClick={finishSelfCheckout}
                className="h-14 w-full bg-emerald-500 text-lg text-slate-950 hover:bg-emerald-400"
              >
                <CheckCircle2 className="size-5" aria-hidden="true" />
                Confirmar compra
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setStep("payment")}
                className="h-14 w-full bg-emerald-500 text-lg text-slate-950 hover:bg-emerald-400"
                disabled={sale.items.length === 0}
              >
                Ir para pagamento
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => requestAssistance("cancel_request")}
              className="h-12 w-full border-slate-700 bg-slate-950 text-white hover:bg-slate-800"
            >
              Cancelar com atendente
            </Button>

            {openRequests.length > 0 ? (
              <p className="text-center text-xs text-slate-500">
                {openRequests.length} pedido(s) de ajuda em aberto
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
