"use client";

import { type ReactNode, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CheckCircle2,
  Edit3,
  FileText,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  type CashRegister,
  type CashSession,
} from "@/lib/cash-data";
import type { Customer } from "@/lib/customer-data";
import { type Product } from "@/lib/product-data";
import { persistFinishedSale } from "@/lib/actions/sales";
import {
  addSaleItem,
  addSalePayment,
  applySaleDiscount,
  cancelSale,
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
  type SaleStatus,
  paymentMethodLabels,
  salePriceModeLabels,
  saleStatusLabels,
} from "@/lib/sale-data";

type SaleFormState = {
  customerId: string;
  cashSessionId: string;
  operator: string;
  notes: string;
  itemProductId: string;
  itemQuantity: string;
  priceMode: SalePriceMode;
  discount: string;
  paymentMethod: PaymentMethod;
  paymentAmount: string;
};

type SaleMetaKey = "customerId" | "cashSessionId" | "operator" | "notes";

type SalesContentProps = {
  products: Product[];
  cashSessions: CashSession[];
  cashRegisters: CashRegister[];
  customers: Customer[];
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

function getStatusTone(status: SaleStatus) {
  if (status === "finished") {
    return "success" as const;
  }

  if (status === "canceled") {
    return "danger" as const;
  }

  return "info" as const;
}

function saleToForm(sale: Sale): SaleFormState {
  return {
    ...defaultSaleForm,
    customerId: sale.customerId,
    cashSessionId: sale.cashSessionId,
    operator: sale.operator,
    notes: sale.notes,
    discount: String(sale.discount || ""),
    paymentAmount: "",
  };
}

function getCashSessionLabel(
  session: CashSession,
  registerById: Map<string, CashRegister>,
) {
  const cashRegister = registerById.get(session.registerId);

  return `${cashRegister?.code ?? "Caixa"} | ${session.operator} | ${session.openedAt}`;
}

export function SalesContent({ products: initProducts, cashSessions, cashRegisters, customers }: SalesContentProps) {
  const firstOpenSession = cashSessions.find((s) => s.status === "open");
  const firstActiveCustomer = customers.find((c) => c.status === "active");
  const firstActiveProduct = initProducts.find((p) => p.status === "active");
  const defaultSaleForm: SaleFormState = {
    customerId: firstActiveCustomer?.id ?? "",
    cashSessionId: firstOpenSession?.id ?? "",
    operator: firstOpenSession?.operator ?? "Operador",
    notes: "",
    itemProductId: firstActiveProduct?.id ?? "",
    itemQuantity: "",
    priceMode: "retail",
    discount: "",
    paymentMethod: "pix",
    paymentAmount: "",
  };

  const [products, setProducts] = useState<Product[]>(initProducts);
  const [sales, setSales] = useState<Sale[]>([]);
  const [formState, setFormState] = useState<SaleFormState>(defaultSaleForm);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [modalErrors, setModalErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SaleStatus>("all");

  const activeCustomers = useMemo(
    () => customers.filter((customer) => customer.status === "active"),
    [customers],
  );
  const activeProducts = useMemo(
    () => products.filter((product) => product.status === "active"),
    [products],
  );
  const openCashSessions = useMemo(
    () => cashSessions.filter((session) => session.status === "open"),
    [cashSessions],
  );
  const customerById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers],
  );
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const registerById = useMemo(
    () => new Map(cashRegisters.map((cashRegister) => [cashRegister.id, cashRegister])),
    [cashRegisters],
  );
  const selectedSale =
    sales.find((sale) => sale.id === selectedSaleId) ?? null;

  const filteredSales = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return sales.filter((sale) => {
      const customer = customerById.get(sale.customerId);
      const matchesSearch =
        !search ||
        sale.code.toLowerCase().includes(search) ||
        sale.operator.toLowerCase().includes(search) ||
        customer?.name.toLowerCase().includes(search);
      const matchesStatus =
        statusFilter === "all" || sale.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customerById, sales, searchTerm, statusFilter]);

  const openSales = sales.filter((sale) => sale.status === "open").length;
  const finishedSales = sales.filter(
    (sale) => sale.status === "finished",
  ).length;
  const revenue = sales
    .filter((sale) => sale.status === "finished")
    .reduce((total, sale) => total + sale.total, 0);
  const pendingValue = sales
    .filter((sale) => sale.status === "open")
    .reduce((total, sale) => total + sale.total, 0);

  function updateForm<K extends keyof SaleFormState>(
    key: K,
    value: SaleFormState[K],
  ) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function updateSaleMeta(key: SaleMetaKey, value: string) {
    updateForm(key, value);

    if (!selectedSaleId) {
      return;
    }

    setSales((current) =>
      current.map((sale) =>
        sale.id === selectedSaleId && sale.status === "open"
          ? { ...sale, [key]: value }
          : sale,
      ),
    );
  }

  function openNewSaleModal() {
    const sequence = sales.length + 1001;
    const sale = createSale({
      sequence,
      customerId: defaultSaleForm.customerId,
      cashSessionId: defaultSaleForm.cashSessionId,
      operator: defaultSaleForm.operator,
      notes: "",
      createdAt: new Date().toLocaleString("pt-BR"),
    });

    setSales((current) => [sale, ...current]);
    setSelectedSaleId(sale.id);
    setFormState(defaultSaleForm);
    setModalErrors([]);
    setIsSaleModalOpen(true);
  }

  function openSaleModal(sale: Sale) {
    setSelectedSaleId(sale.id);
    setFormState(saleToForm(sale));
    setModalErrors([]);
    setIsSaleModalOpen(true);
  }

  function closeSaleModal() {
    setSelectedSaleId(null);
    setFormState(defaultSaleForm);
    setModalErrors([]);
    setIsSaleModalOpen(false);
  }

  function handleAddItem() {
    const product = productById.get(formState.itemProductId);
    const quantity = parseNumber(formState.itemQuantity);

    if (!selectedSale || !product || quantity <= 0) {
      return;
    }

    setSales((current) =>
      current.map((sale) =>
        sale.id === selectedSale.id
          ? addSaleItem({
              sale,
              product,
              quantity,
              priceMode: formState.priceMode,
            })
          : sale,
      ),
    );
    setFormState((current) => ({ ...current, itemQuantity: "" }));
    setModalErrors([]);
  }

  function handleRemoveItem(itemId: string) {
    if (!selectedSale) {
      return;
    }

    setSales((current) =>
      current.map((sale) =>
        sale.id === selectedSale.id ? removeSaleItem(sale, itemId) : sale,
      ),
    );
  }

  function handleApplyDiscount() {
    if (!selectedSale) {
      return;
    }

    const discount = parseNumber(formState.discount);

    setSales((current) =>
      current.map((sale) =>
        sale.id === selectedSale.id ? applySaleDiscount(sale, discount) : sale,
      ),
    );
  }

  function handleAddPayment() {
    if (!selectedSale) {
      return;
    }

    const balance = getSaleBalance(selectedSale);
    const parsedAmount = parseNumber(formState.paymentAmount || String(balance));
    const amount = Math.min(parsedAmount, balance);

    if (amount <= 0) {
      return;
    }

    setSales((current) =>
      current.map((sale) =>
        sale.id === selectedSale.id
          ? addSalePayment({
              sale,
              method: formState.paymentMethod,
              amount,
            })
          : sale,
      ),
    );
    setFormState((current) => ({ ...current, paymentAmount: "" }));
    setModalErrors([]);
  }

  function handleRemovePayment(paymentId: string) {
    if (!selectedSale) {
      return;
    }

    setSales((current) =>
      current.map((sale) =>
        sale.id === selectedSale.id ? removeSalePayment(sale, paymentId) : sale,
      ),
    );
  }

  async function handleFinishSale() {
    if (!selectedSale) return;

    const result = finishSale({
      sale: selectedSale,
      products,
      finishedAt: new Date().toLocaleString("pt-BR"),
    });

    if (!result.ok) {
      setModalErrors(result.errors);
      return;
    }

    setProducts(result.products);
    setSales((current) =>
      current.map((sale) => (sale.id === result.sale.id ? result.sale : sale)),
    );
    closeSaleModal();

    await persistFinishedSale(result.sale);
  }

  function handleCancelSale() {
    if (!selectedSale) {
      return;
    }

    setSales((current) =>
      current.map((sale) =>
        sale.id === selectedSale.id
          ? cancelSale(sale, new Date().toLocaleString("pt-BR"))
          : sale,
      ),
    );
    closeSaleModal();
  }

  return (
    <>
      <PageHeader
        eyebrow="Motor de venda"
        title="Vendas"
        description="Monte vendas, valide estoque, simule pagamentos e finalize a baixa de produtos usando uma regra central reutilizavel pelo futuro PDV."
        action={
          <Button
            type="button"
            onClick={openNewSaleModal}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            Nova venda
          </Button>
        }
      />

      <SaleBuilderModal
        isOpen={isSaleModalOpen}
        sale={selectedSale}
        formState={formState}
        errors={modalErrors}
        customers={activeCustomers}
        products={activeProducts}
        productById={productById}
        openCashSessions={openCashSessions}
        registerById={registerById}
        onClose={closeSaleModal}
        onUpdateForm={updateForm}
        onUpdateSaleMeta={updateSaleMeta}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onApplyDiscount={handleApplyDiscount}
        onAddPayment={handleAddPayment}
        onRemovePayment={handleRemovePayment}
        onFinishSale={handleFinishSale}
        onCancelSale={handleCancelSale}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Vendas abertas" value={String(openSales)} />
        <SummaryCard label="Finalizadas" value={String(finishedSales)} />
        <SummaryCard label="Faturamento" value={formatCurrency(revenue)} />
        <SummaryCard label="Em aberto" value={formatCurrency(pendingValue)} />
      </section>

      <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <div>
            <h2 className="text-sm font-semibold text-emerald-900">
              Base para o PDV
            </h2>
            <p className="mt-1 text-sm leading-6 text-emerald-800">
              Esta etapa valida regras de item, total, desconto, pagamento e
              estoque. A tela de PDV deve reaproveitar este motor.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Vendas registradas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Acompanhe vendas abertas, finalizadas e canceladas.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_160px]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar venda"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | SaleStatus)
              }
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Todos status</option>
              {Object.entries(saleStatusLabels).map(([status, label]) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Venda</th>
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Operador</th>
                <th className="px-5 py-3 font-semibold">Itens</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Pagamento</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale) => {
                const customer = customerById.get(sale.customerId);
                const paidAmount = getPaidAmount(sale.payments);
                const balance = getSaleBalance(sale);

                return (
                  <tr key={sale.id} className="text-slate-700">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-950">{sale.code}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {sale.createdAt}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {customer?.name ?? "Cliente removido"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {sale.operator}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {sale.items.length} itens
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <p>{formatCurrency(paidAmount)} pago</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Saldo {formatCurrency(balance)}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={saleStatusLabels[sale.status]}
                        tone={getStatusTone(sale.status)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openSaleModal(sale)}
                      >
                        <Edit3 className="size-4" aria-hidden="true" />
                        {sale.status === "open" ? "Operar" : "Ver"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function SaleBuilderModal({
  isOpen,
  sale,
  formState,
  errors,
  customers,
  products,
  productById,
  openCashSessions,
  registerById,
  onClose,
  onUpdateForm,
  onUpdateSaleMeta,
  onAddItem,
  onRemoveItem,
  onApplyDiscount,
  onAddPayment,
  onRemovePayment,
  onFinishSale,
  onCancelSale,
}: {
  isOpen: boolean;
  sale: Sale | null;
  formState: SaleFormState;
  errors: string[];
  customers: Customer[];
  products: Product[];
  productById: Map<string, Product>;
  openCashSessions: CashSession[];
  registerById: Map<string, CashRegister>;
  onClose: () => void;
  onUpdateForm: <K extends keyof SaleFormState>(
    key: K,
    value: SaleFormState[K],
  ) => void;
  onUpdateSaleMeta: (key: SaleMetaKey, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
  onApplyDiscount: () => void;
  onAddPayment: () => void;
  onRemovePayment: (paymentId: string) => void;
  onFinishSale: () => void;
  onCancelSale: () => void;
}) {
  if (!isOpen || !sale) {
    return null;
  }

  const selectedProduct = productById.get(formState.itemProductId);
  const selectedPrice = selectedProduct
    ? getProductSalePrice(selectedProduct, formState.priceMode)
    : 0;
  const paidAmount = getPaidAmount(sale.payments);
  const balance = getSaleBalance(sale);
  const isEditable = sale.status === "open";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sale-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-5 text-emerald-600" />
            <div>
              <h2
                id="sale-modal-title"
                className="text-base font-semibold text-slate-950"
              >
                {sale.code}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Motor de venda com estoque e pagamento simulado.
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Fechar modal</span>
          </Button>
        </div>

        <div className="max-h-[calc(92vh-76px)] overflow-y-auto px-5 py-5">
          {errors.length > 0 ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-900">
                Ajuste antes de finalizar
              </p>
              <ul className="mt-2 space-y-1 text-sm text-red-800">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-4">
            <Field label="Cliente" className="md:col-span-2">
              <select
                value={formState.customerId}
                onChange={(event) =>
                  onUpdateSaleMeta("customerId", event.target.value)
                }
                disabled={!isEditable}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Sessao de caixa" className="md:col-span-2">
              <select
                value={formState.cashSessionId}
                onChange={(event) =>
                  onUpdateSaleMeta("cashSessionId", event.target.value)
                }
                disabled={!isEditable}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                {openCashSessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {getCashSessionLabel(session, registerById)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Operador">
              <input
                value={formState.operator}
                onChange={(event) =>
                  onUpdateSaleMeta("operator", event.target.value)
                }
                disabled={!isEditable}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="Observacoes" className="md:col-span-3">
              <input
                value={formState.notes}
                onChange={(event) => onUpdateSaleMeta("notes", event.target.value)}
                disabled={!isEditable}
                placeholder="Ex.: venda balcão, pedido atacado, condicao combinada"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-950">
                Itens da venda
              </h3>
            </div>

            {isEditable ? (
              <div className="grid gap-3 p-4 lg:grid-cols-[1fr_140px_120px_140px_auto] lg:items-end">
                <Field label="Produto">
                  <select
                    value={formState.itemProductId}
                    onChange={(event) =>
                      onUpdateForm("itemProductId", event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} | estoque {product.currentStock}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Preco">
                  <select
                    value={formState.priceMode}
                    onChange={(event) =>
                      onUpdateForm("priceMode", event.target.value as SalePriceMode)
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  >
                    {Object.entries(salePriceModeLabels).map(([mode, label]) => (
                      <option key={mode} value={mode}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Qtd.">
                  <input
                    value={formState.itemQuantity}
                    onChange={(event) =>
                      onUpdateForm("itemQuantity", event.target.value)
                    }
                    inputMode="decimal"
                    placeholder="0"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </Field>

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs font-medium text-slate-500">Valor un.</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {formatCurrency(selectedPrice)}
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={onAddItem}
                  className="bg-slate-950 text-white hover:bg-slate-800"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Adicionar
                </Button>
              </div>
            ) : null}

            <div className="overflow-x-auto border-t border-slate-200">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Produto</th>
                    <th className="px-4 py-3 font-semibold">Qtd.</th>
                    <th className="px-4 py-3 font-semibold">Unitario</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Acao</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items.map((item) => {
                    const product = productById.get(item.productId);

                    return (
                      <tr key={item.id} className="text-slate-700">
                        <td className="px-4 py-3 font-medium text-slate-950">
                          <span className="inline-flex items-center gap-2">
                            <Package
                              className="size-4 text-slate-400"
                              aria-hidden="true"
                            />
                            {product?.name ?? "Produto removido"}
                          </span>
                        </td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!isEditable}
                            onClick={() => onRemoveItem(item.id)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Remover
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px]">
            <section className="rounded-lg border border-slate-200">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-950">
                  Pagamentos
                </h3>
              </div>

              {isEditable ? (
                <div className="grid gap-3 p-4 md:grid-cols-[170px_1fr_auto] md:items-end">
                  <Field label="Metodo">
                    <select
                      value={formState.paymentMethod}
                      onChange={(event) =>
                        onUpdateForm(
                          "paymentMethod",
                          event.target.value as PaymentMethod,
                        )
                      }
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    >
                      {Object.entries(paymentMethodLabels).map(([method, label]) => (
                        <option key={method} value={method}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Valor">
                    <input
                      value={formState.paymentAmount}
                      onChange={(event) =>
                        onUpdateForm("paymentAmount", event.target.value)
                      }
                      inputMode="decimal"
                      placeholder={formatCurrency(balance)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </Field>

                  <Button
                    type="button"
                    onClick={onAddPayment}
                    className="bg-slate-950 text-white hover:bg-slate-800"
                  >
                    <BadgeDollarSign className="size-4" aria-hidden="true" />
                    Pagar
                  </Button>
                </div>
              ) : null}

              <div className="overflow-x-auto border-t border-slate-200">
                <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Metodo</th>
                      <th className="px-4 py-3 font-semibold">Valor</th>
                      <th className="px-4 py-3 font-semibold">Acao</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sale.payments.map((payment) => (
                      <tr key={payment.id} className="text-slate-700">
                        <td className="px-4 py-3">
                          {paymentMethodLabels[payment.method]}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!isEditable}
                            onClick={() => onRemovePayment(payment.id)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Remover
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-950">Totais</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <TotalRow label="Subtotal" value={formatCurrency(sale.subtotal)} />
                <TotalRow label="Desconto" value={formatCurrency(sale.discount)} />
                <TotalRow label="Total" value={formatCurrency(sale.total)} />
                <TotalRow label="Pago" value={formatCurrency(paidAmount)} />
                <TotalRow label="Saldo" value={formatCurrency(balance)} />
              </dl>

              {isEditable ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input
                    value={formState.discount}
                    onChange={(event) =>
                      onUpdateForm("discount", event.target.value)
                    }
                    inputMode="decimal"
                    placeholder="Desconto"
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <Button type="button" variant="outline" onClick={onApplyDiscount}>
                    Aplicar
                  </Button>
                </div>
              ) : null}

              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-500">
                <p className="flex items-center gap-2">
                  <UserRound className="size-4" aria-hidden="true" />
                  {sale.operator}
                </p>
                <p className="mt-2">
                  Status: {saleStatusLabels[sale.status]}
                </p>
              </div>
            </section>
          </div>
        </div>

        <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row">
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {isEditable ? (
            <>
              <Button type="button" variant="outline" onClick={onCancelSale}>
                <X className="size-4" aria-hidden="true" />
                Cancelar venda
              </Button>
              <Button
                type="button"
                onClick={onFinishSale}
                className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Finalizar venda
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </article>
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
