"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  FileText,
  PackagePlus,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { initialProducts } from "@/lib/product-data";
import {
  type PurchaseOrder,
  type PurchaseStatus,
  initialPurchaseOrders,
  purchaseStatusLabels,
} from "@/lib/purchase-data";
import { initialSuppliers } from "@/lib/supplier-data";

type PurchaseFormItem = {
  id: string;
  productId: string;
  quantity: string;
  unitCost: string;
};

type PurchaseFormState = {
  supplierId: string;
  status: PurchaseStatus;
  expectedAt: string;
  notes: string;
  itemProductId: string;
  itemQuantity: string;
  itemUnitCost: string;
  items: PurchaseFormItem[];
};

const defaultPurchaseForm: PurchaseFormState = {
  supplierId: initialSuppliers[0]?.id ?? "",
  status: "draft",
  expectedAt: "",
  notes: "",
  itemProductId: initialProducts[0]?.id ?? "",
  itemQuantity: "",
  itemUnitCost: "",
  items: [],
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

function calculateTotal(order: PurchaseOrder) {
  return order.items.reduce(
    (total, item) => total + item.quantity * item.unitCost,
    0,
  );
}

function calculateReceivedItems(order: PurchaseOrder) {
  return order.items.reduce((total, item) => total + item.receivedQuantity, 0);
}

function calculateOrderedItems(order: PurchaseOrder) {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

function getStatusTone(status: PurchaseStatus) {
  if (status === "received") {
    return "success" as const;
  }

  if (status === "canceled") {
    return "danger" as const;
  }

  if (status === "sent" || status === "partial_received") {
    return "warning" as const;
  }

  return "info" as const;
}

function purchaseToForm(order: PurchaseOrder): PurchaseFormState {
  return {
    supplierId: order.supplierId,
    status: order.status,
    expectedAt: order.expectedAt,
    notes: order.notes,
    itemProductId: initialProducts[0]?.id ?? "",
    itemQuantity: "",
    itemUnitCost: "",
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: String(item.quantity),
      unitCost: String(item.unitCost),
    })),
  };
}

export function PurchasesContent() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [formState, setFormState] =
    useState<PurchaseFormState>(defaultPurchaseForm);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | PurchaseStatus>(
    "all",
  );

  const supplierById = useMemo(
    () => new Map(initialSuppliers.map((supplier) => [supplier.id, supplier])),
    [],
  );
  const productById = useMemo(
    () => new Map(initialProducts.map((product) => [product.id, product])),
    [],
  );

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const supplier = supplierById.get(order.supplierId);
      const matchesSearch =
        !search ||
        order.code.toLowerCase().includes(search) ||
        supplier?.name.toLowerCase().includes(search) ||
        order.notes.toLowerCase().includes(search);
      const matchesSupplier =
        supplierFilter === "all" || order.supplierId === supplierFilter;
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesSupplier && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter, supplierById, supplierFilter]);

  const openOrders = orders.filter(
    (order) =>
      order.status === "draft" ||
      order.status === "sent" ||
      order.status === "partial_received",
  ).length;
  const pendingValue = orders
    .filter((order) => order.status !== "received" && order.status !== "canceled")
    .reduce((total, order) => total + calculateTotal(order), 0);
  const receivedOrders = orders.filter(
    (order) => order.status === "received",
  ).length;

  function updateForm<K extends keyof PurchaseFormState>(
    key: K,
    value: PurchaseFormState[K],
  ) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function openNewPurchaseModal() {
    setFormState(defaultPurchaseForm);
    setEditingOrderId(null);
    setIsPurchaseModalOpen(true);
  }

  function closePurchaseModal() {
    setFormState(defaultPurchaseForm);
    setEditingOrderId(null);
    setIsPurchaseModalOpen(false);
  }

  function handleAddItem() {
    const product = productById.get(formState.itemProductId);
    const quantity = parseNumber(formState.itemQuantity);
    const unitCost = parseNumber(
      formState.itemUnitCost || String(product?.costPrice ?? ""),
    );

    if (!product || quantity <= 0 || unitCost <= 0) {
      return;
    }

    setFormState((current) => ({
      ...current,
      itemQuantity: "",
      itemUnitCost: "",
      items: [
        ...current.items,
        {
          id: `item-${Date.now()}`,
          productId: product.id,
          quantity: String(quantity),
          unitCost: String(unitCost),
        },
      ],
    }));
  }

  function handleRemoveItem(itemId: string) {
    setFormState((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== itemId),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState.supplierId || formState.items.length === 0) {
      return;
    }

    const items = formState.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: parseNumber(item.quantity),
      receivedQuantity:
        formState.status === "received" ? parseNumber(item.quantity) : 0,
      unitCost: parseNumber(item.unitCost),
    }));

    if (editingOrderId) {
      setOrders((current) =>
        current.map((order) =>
          order.id === editingOrderId
            ? {
                ...order,
                supplierId: formState.supplierId,
                status: formState.status,
                expectedAt: formState.expectedAt,
                receivedAt:
                  formState.status === "received"
                    ? order.receivedAt || "20/05/2026"
                    : "",
                notes: formState.notes.trim(),
                items,
              }
            : order,
        ),
      );
      closePurchaseModal();
      return;
    }

    const sequence = orders.length + 1001;
    const id = `po-${sequence}`;

    setOrders((current) => [
      {
        id,
        code: `COMP-${sequence}`,
        supplierId: formState.supplierId,
        status: formState.status,
        createdAt: "20/05/2026",
        expectedAt: formState.expectedAt,
        receivedAt: formState.status === "received" ? "20/05/2026" : "",
        notes: formState.notes.trim(),
        items,
      },
      ...current,
    ]);
    closePurchaseModal();
  }

  function handleEditOrder(order: PurchaseOrder) {
    setEditingOrderId(order.id);
    setFormState(purchaseToForm(order));
    setIsPurchaseModalOpen(true);
  }

  function handleMarkSent(orderId: string) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId && order.status === "draft"
          ? { ...order, status: "sent" }
          : order,
      ),
    );
  }

  function handleReceiveOrder(orderId: string) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "received",
              receivedAt: "20/05/2026",
              items: order.items.map((item) => ({
                ...item,
                receivedQuantity: item.quantity,
              })),
            }
          : order,
      ),
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Operacao de compras"
        title="Compras"
        description="Registre pedidos de compra por fornecedor, acompanhe recebimento e prepare entradas futuras no estoque."
        action={
          <Button
            type="button"
            onClick={openNewPurchaseModal}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            Novo pedido
          </Button>
        }
      />

      <PurchaseFormModal
        isOpen={isPurchaseModalOpen}
        isEditing={Boolean(editingOrderId)}
        formState={formState}
        supplierById={supplierById}
        productById={productById}
        onClose={closePurchaseModal}
        onSubmit={handleSubmit}
        onUpdateForm={updateForm}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Pedidos abertos" value={String(openOrders)} />
        <SummaryCard label="Recebidos" value={String(receivedOrders)} />
        <SummaryCard label="Valor pendente" value={formatCurrency(pendingValue)} />
        <SummaryCard label="Pedidos totais" value={String(orders.length)} />
      </section>

      <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <div>
            <h2 className="text-sm font-semibold text-emerald-900">
              Proximo passo da integracao
            </h2>
            <p className="mt-1 text-sm leading-6 text-emerald-800">
              Ao receber um pedido, o fluxo futuro deve gerar movimentacoes de
              entrada no estoque e contas a pagar no financeiro.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Pedidos de compra
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Acompanhe pedidos por fornecedor, status e previsao.
            </p>
          </div>

          <div className="grid gap-2 lg:grid-cols-[1fr_190px_170px]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar pedido"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={supplierFilter}
              onChange={(event) => setSupplierFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Todos fornecedores</option>
              {initialSuppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | PurchaseStatus)
              }
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Todos status</option>
              {Object.entries(purchaseStatusLabels).map(([status, label]) => (
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
                <th className="px-5 py-3 font-semibold">Pedido</th>
                <th className="px-5 py-3 font-semibold">Fornecedor</th>
                <th className="px-5 py-3 font-semibold">Itens</th>
                <th className="px-5 py-3 font-semibold">Valor</th>
                <th className="px-5 py-3 font-semibold">Previsao</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const supplier = supplierById.get(order.supplierId);
                const orderedItems = calculateOrderedItems(order);
                const receivedItems = calculateReceivedItems(order);

                return (
                  <tr key={order.id} className="text-slate-700">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-950">{order.code}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Criado em {order.createdAt}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {supplier?.name ?? "Fornecedor removido"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <p>
                        {receivedItems}/{orderedItems} recebidos
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.items.length} linhas
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatCurrency(calculateTotal(order))}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <p>{order.expectedAt || "Sem previsao"}</p>
                      {order.receivedAt ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Recebido em {order.receivedAt}
                        </p>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={purchaseStatusLabels[order.status]}
                        tone={getStatusTone(order.status)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleEditOrder(order)}
                        >
                          <Edit3 className="size-4" aria-hidden="true" />
                          Editar
                        </Button>
                        {order.status === "draft" ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleMarkSent(order.id)}
                          >
                            <Send className="size-4" aria-hidden="true" />
                            Enviar
                          </Button>
                        ) : null}
                        {order.status !== "received" &&
                        order.status !== "canceled" ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleReceiveOrder(order.id)}
                          >
                            <CheckCircle2 className="size-4" aria-hidden="true" />
                            Receber
                          </Button>
                        ) : null}
                      </div>
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

function PurchaseFormModal({
  isOpen,
  isEditing,
  formState,
  supplierById,
  productById,
  onClose,
  onSubmit,
  onUpdateForm,
  onAddItem,
  onRemoveItem,
}: {
  isOpen: boolean;
  isEditing: boolean;
  formState: PurchaseFormState;
  supplierById: Map<string, (typeof initialSuppliers)[number]>;
  productById: Map<string, (typeof initialProducts)[number]>;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof PurchaseFormState>(
    key: K,
    value: PurchaseFormState[K],
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
}) {
  const draftItemProduct = productById.get(formState.itemProductId);
  const draftItemCost =
    formState.itemUnitCost || String(draftItemProduct?.costPrice ?? "");

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <PackagePlus className="size-5 text-emerald-600" />
            <div>
              <h2
                id="purchase-modal-title"
                className="text-base font-semibold text-slate-950"
              >
                {isEditing ? "Editar pedido" : "Novo pedido de compra"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Selecione fornecedor, status e itens do pedido.
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Fechar modal</span>
          </Button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="max-h-[calc(92vh-142px)] overflow-y-auto px-5 py-5">
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Fornecedor" className="md:col-span-2">
                <select
                  value={formState.supplierId}
                  onChange={(event) =>
                    onUpdateForm("supplierId", event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                >
                  {initialSuppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Status">
                <select
                  value={formState.status}
                  onChange={(event) =>
                    onUpdateForm("status", event.target.value as PurchaseStatus)
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                >
                  {Object.entries(purchaseStatusLabels).map(([status, label]) => (
                    <option key={status} value={status}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Previsao">
                <input
                  value={formState.expectedAt}
                  onChange={(event) =>
                    onUpdateForm("expectedAt", event.target.value)
                  }
                  placeholder="21/05/2026"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </Field>

              <Field label="Observacoes" className="md:col-span-2">
                <input
                  value={formState.notes}
                  onChange={(event) => onUpdateForm("notes", event.target.value)}
                  placeholder="Ex.: reposicao de bebidas"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </Field>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-950">
                  Itens do pedido
                </h3>
              </div>

              <div className="grid gap-3 p-4 md:grid-cols-[1fr_120px_140px_auto] md:items-end">
                <Field label="Produto">
                  <select
                    value={formState.itemProductId}
                    onChange={(event) => {
                      const product = productById.get(event.target.value);
                      onUpdateForm("itemProductId", event.target.value);
                      onUpdateForm("itemUnitCost", String(product?.costPrice ?? ""));
                    }}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  >
                    {initialProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
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

                <Field label="Custo un.">
                  <input
                    value={draftItemCost}
                    onChange={(event) =>
                      onUpdateForm("itemUnitCost", event.target.value)
                    }
                    inputMode="decimal"
                    placeholder="0,00"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </Field>

                <Button
                  type="button"
                  onClick={onAddItem}
                  className="bg-slate-950 text-white hover:bg-slate-800"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Adicionar
                </Button>
              </div>

              <div className="overflow-x-auto border-t border-slate-200">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Produto</th>
                      <th className="px-4 py-3 font-semibold">Qtd.</th>
                      <th className="px-4 py-3 font-semibold">Custo un.</th>
                      <th className="px-4 py-3 font-semibold">Subtotal</th>
                      <th className="px-4 py-3 font-semibold">Acao</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formState.items.map((item) => {
                      const product = productById.get(item.productId);
                      const quantity = parseNumber(item.quantity);
                      const unitCost = parseNumber(item.unitCost);

                      return (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-medium text-slate-950">
                            {product?.name ?? "Produto removido"}
                          </td>
                          <td className="px-4 py-3">{quantity}</td>
                          <td className="px-4 py-3">
                            {formatCurrency(unitCost)}
                          </td>
                          <td className="px-4 py-3">
                            {formatCurrency(quantity * unitCost)}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              type="button"
                              variant="outline"
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

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-950">
                Fornecedor:{" "}
                {supplierById.get(formState.supplierId)?.name ??
                  "Nao selecionado"}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays className="size-4" aria-hidden="true" />
                Recebimento e entrada no estoque serao integrados na proxima
                fase.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              <Save className="size-4" aria-hidden="true" />
              {isEditing ? "Salvar alteracoes" : "Cadastrar pedido"}
            </Button>
          </div>
        </form>
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
