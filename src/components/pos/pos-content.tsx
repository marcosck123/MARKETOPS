"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Barcode,
  CheckCircle2,
  Monitor,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  type CashRegister,
  type CashSession,
  initialCashRegisters,
  initialCashSessions,
} from "@/lib/cash-data";
import { initialCustomers } from "@/lib/customer-data";
import { type Product, initialProducts } from "@/lib/product-data";
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
  salePriceModeLabels,
} from "@/lib/sale-data";

type PosFormState = {
  query: string;
  quantity: string;
  priceMode: SalePriceMode;
  customerId: string;
  cashSessionId: string;
  paymentMethod: PaymentMethod;
  paymentAmount: string;
  discount: string;
};

const openSession = initialCashSessions.find(
  (session) => session.status === "open",
);
const activeCustomer = initialCustomers.find(
  (customer) => customer.status === "active",
);

const defaultFormState: PosFormState = {
  query: "",
  quantity: "1",
  priceMode: "retail",
  customerId: activeCustomer?.id ?? "",
  cashSessionId: openSession?.id ?? "",
  paymentMethod: "pix",
  paymentAmount: "",
  discount: "",
};

function parseNumber(value: string) {
  const parsed = Number(value.replace(",", ".").trim());

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function createPosSale(sequence: number, formState: PosFormState) {
  const session = initialCashSessions.find(
    (cashSession) => cashSession.id === formState.cashSessionId,
  );

  return createSale({
    sequence,
    customerId: formState.customerId,
    cashSessionId: formState.cashSessionId,
    operator: session?.operator ?? "Operador PDV",
    notes: "Venda registrada no PDV.",
    createdAt: "20/05/2026 agora",
  });
}

function getSessionLabel(
  session: CashSession,
  registerById: Map<string, CashRegister>,
) {
  const cashRegister = registerById.get(session.registerId);

  return `${cashRegister?.code ?? "Caixa"} | ${session.operator}`;
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

export function PosContent() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [formState, setFormState] = useState<PosFormState>(defaultFormState);
  const [saleSequence, setSaleSequence] = useState(3001);
  const [sale, setSale] = useState<Sale>(() =>
    createPosSale(3001, defaultFormState),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [lastFinishedSale, setLastFinishedSale] = useState<Sale | null>(null);

  const activeProducts = useMemo(
    () => products.filter((product) => product.status === "active"),
    [products],
  );
  const activeCustomers = useMemo(
    () => initialCustomers.filter((customer) => customer.status === "active"),
    [],
  );
  const openCashSessions = useMemo(
    () => initialCashSessions.filter((session) => session.status === "open"),
    [],
  );
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const registerById = useMemo(
    () =>
      new Map(initialCashRegisters.map((cashRegister) => [cashRegister.id, cashRegister])),
    [],
  );
  const customerById = useMemo(
    () => new Map(initialCustomers.map((customer) => [customer.id, customer])),
    [],
  );

  const filteredProducts = useMemo(() => {
    const search = formState.query.trim().toLowerCase();

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
  }, [activeProducts, formState.query]);

  const selectedCustomer = customerById.get(formState.customerId);
  const selectedSession = openCashSessions.find(
    (session) => session.id === formState.cashSessionId,
  );
  const paidAmount = getPaidAmount(sale.payments);
  const balance = getSaleBalance(sale);

  function updateForm<K extends keyof PosFormState>(
    key: K,
    value: PosFormState[K],
  ) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function syncSaleMeta(nextFormState: PosFormState) {
    const session = initialCashSessions.find(
      (cashSession) => cashSession.id === nextFormState.cashSessionId,
    );

    setSale((current) => ({
      ...current,
      customerId: nextFormState.customerId,
      cashSessionId: nextFormState.cashSessionId,
      operator: session?.operator ?? current.operator,
    }));
  }

  function handleCustomerChange(customerId: string) {
    const nextFormState = { ...formState, customerId };

    setFormState(nextFormState);
    syncSaleMeta(nextFormState);
  }

  function handleSessionChange(cashSessionId: string) {
    const nextFormState = { ...formState, cashSessionId };

    setFormState(nextFormState);
    syncSaleMeta(nextFormState);
  }

  function addProductToSale(product: Product) {
    const quantity = parseNumber(formState.quantity || "1");

    if (quantity <= 0) {
      return;
    }

    setSale((current) =>
      addSaleItem({
        sale: current,
        product,
        quantity,
        priceMode: formState.priceMode,
      }),
    );
    setFormState((current) => ({
      ...current,
      query: "",
      quantity: "1",
    }));
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
    setSale((current) =>
      applySaleDiscount(current, parseNumber(formState.discount)),
    );
    setErrors([]);
  }

  function handleAddPayment(method: PaymentMethod) {
    const amount = parseNumber(formState.paymentAmount || String(balance));

    if (amount <= 0) {
      return;
    }

    setSale((current) =>
      addSalePayment({
        sale: current,
        method,
        amount: Math.min(amount, getSaleBalance(current)),
      }),
    );
    setFormState((current) => ({
      ...current,
      paymentAmount: "",
      paymentMethod: method,
    }));
    setErrors([]);
  }

  function handleFinishSale() {
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
    setLastFinishedSale(result.sale);

    const nextSequence = saleSequence + 1;
    const nextSale = createPosSale(nextSequence, formState);

    setSaleSequence(nextSequence);
    setSale(nextSale);
    setFormState((current) => ({
      ...current,
      query: "",
      quantity: "1",
      discount: "",
      paymentAmount: "",
    }));
    setErrors([]);
  }

  function handleClearSale() {
    setSale(createPosSale(saleSequence, formState));
    setFormState((current) => ({
      ...current,
      query: "",
      quantity: "1",
      discount: "",
      paymentAmount: "",
    }));
    setErrors([]);
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-800 bg-slate-950 px-4 py-3 text-white">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500 text-lg font-bold text-slate-950">
              M
            </div>
            <div>
              <p className="text-lg font-semibold">MARKETOPS PDV</p>
              <p className="text-xs text-slate-400">
                {selectedSession
                  ? getSessionLabel(selectedSession, registerById)
                  : "Sem sessao aberta"}
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-[220px_1fr_auto] sm:items-center">
            <select
              value={formState.customerId}
              onChange={(event) => handleCustomerChange(event.target.value)}
              className="h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {activeCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <select
              value={formState.cashSessionId}
              onChange={(event) => handleSessionChange(event.target.value)}
              className="h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {openCashSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {getSessionLabel(session, registerById)}
                </option>
              ))}
            </select>

            <Button asChild variant="outline" className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800">
              <Link href="/vendas">
                <Monitor className="size-4" aria-hidden="true" />
                Vendas
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-65px)] gap-4 p-4 xl:grid-cols-[minmax(420px,1fr)_minmax(420px,0.9fr)_360px]">
        <section className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <form onSubmit={handleSubmitProduct} className="grid gap-3 lg:grid-cols-[1fr_92px_140px_auto] lg:items-end">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Produto
                </span>
                <div className="relative">
                  <Barcode
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    value={formState.query}
                    onChange={(event) => updateForm("query", event.target.value)}
                    placeholder="Codigo, SKU ou produto"
                    className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-base outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    autoFocus
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Qtd.
                </span>
                <input
                  value={formState.quantity}
                  onChange={(event) => updateForm("quantity", event.target.value)}
                  inputMode="decimal"
                  className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-base outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Preco
                </span>
                <select
                  value={formState.priceMode}
                  onChange={(event) =>
                    updateForm("priceMode", event.target.value as SalePriceMode)
                  }
                  className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                >
                  {Object.entries(salePriceModeLabels).map(([mode, label]) => (
                    <option key={mode} value={mode}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <Button type="submit" className="h-12 bg-slate-950 px-4 text-white hover:bg-slate-800">
                <Plus className="size-4" aria-hidden="true" />
                Adicionar
              </Button>
            </form>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h1 className="text-base font-semibold text-slate-950">
                Produtos
              </h1>
              <StatusBadge
                label={`${filteredProducts.length} exibidos`}
                tone="info"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {filteredProducts.map((product) => {
                const price = getProductSalePrice(product, formState.priceMode);
                const isLowStock = product.currentStock <= product.minimumStock;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProductToSale(product)}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {product.sku} | {product.barcode}
                        </p>
                      </div>
                      <Package className="size-5 shrink-0 text-emerald-600" />
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">Estoque</p>
                        <p className="text-sm font-semibold text-slate-950">
                          {product.currentStock}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          {isLowStock ? "Baixo" : "Disponivel"}
                        </p>
                        <p className="text-lg font-semibold text-slate-950">
                          {formatCurrency(price)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Carrinho
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {sale.code} | {sale.items.length} itens
              </p>
            </div>
            <Button type="button" variant="outline" onClick={handleClearSale}>
              <X className="size-4" aria-hidden="true" />
              Limpar
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {sale.items.length === 0 ? (
              <div className="grid h-full min-h-72 place-items-center p-6 text-center">
                <div>
                  <ShoppingCart className="mx-auto size-10 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-500">
                    Venda sem itens
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Item</th>
                    <th className="px-4 py-3 font-semibold">Qtd.</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Acao</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items.map((item) => {
                    const product = productById.get(item.productId);

                    return (
                      <tr key={item.id} className="text-slate-700">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-950">
                            {product?.name ?? "Produto removido"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatCurrency(item.unitPrice)}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {item.quantity}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-950">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="border-t border-slate-200 p-4">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  value={formState.discount}
                  onChange={(event) => updateForm("discount", event.target.value)}
                  inputMode="decimal"
                  placeholder="Desconto"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <Button type="button" variant="outline" onClick={handleApplyDiscount}>
                Aplicar
              </Button>
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-slate-400" />
              <p className="text-sm font-medium text-slate-700">
                {selectedCustomer?.name ?? "Cliente nao selecionado"}
              </p>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="rounded-lg bg-slate-950 p-4 text-white">
              <p className="text-sm text-slate-300">Total</p>
              <p className="mt-2 text-4xl font-semibold">
                {formatCurrency(sale.total)}
              </p>
            </div>

            <dl className="space-y-3 text-sm">
              <TotalRow label="Subtotal" value={formatCurrency(sale.subtotal)} />
              <TotalRow label="Desconto" value={formatCurrency(sale.discount)} />
              <TotalRow label="Pago" value={formatCurrency(paidAmount)} />
              <TotalRow label="Saldo" value={formatCurrency(balance)} />
            </dl>

            <div className="grid gap-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Valor
                </span>
                <input
                  value={formState.paymentAmount}
                  onChange={(event) =>
                    updateForm("paymentAmount", event.target.value)
                  }
                  inputMode="decimal"
                  placeholder={formatCurrency(balance)}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-base outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                {Object.entries(paymentMethodLabels).map(([method, label]) => (
                  <Button
                    key={method}
                    type="button"
                    variant={
                      formState.paymentMethod === method ? "default" : "outline"
                    }
                    onClick={() => handleAddPayment(method as PaymentMethod)}
                    className={
                      formState.paymentMethod === method
                        ? "bg-slate-950 text-white hover:bg-slate-800"
                        : ""
                    }
                  >
                    <BadgeDollarSign className="size-4" aria-hidden="true" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200">
              <div className="border-b border-slate-200 px-3 py-2">
                <p className="text-sm font-semibold text-slate-950">
                  Pagamentos
                </p>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {sale.payments.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-slate-500">
                    Nenhum pagamento
                  </p>
                ) : (
                  sale.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-950">
                          {paymentMethodLabels[payment.method]}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setSale((current) =>
                            removeSalePayment(current, payment.id),
                          )
                        }
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        <span className="sr-only">Remover pagamento</span>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3 border-t border-slate-200 p-4">
            {errors.length > 0 ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <ul className="space-y-1 text-sm text-red-800">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {lastFinishedSale ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-sm font-semibold text-emerald-900">
                  {lastFinishedSale.code} finalizada
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  {formatCurrency(lastFinishedSale.total)}
                </p>
              </div>
            ) : null}

            <Button
              type="button"
              onClick={handleFinishSale}
              className="h-12 w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              <CheckCircle2 className="size-5" aria-hidden="true" />
              Finalizar venda
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
