"use client";

import { type FormEvent, Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  addReceiptItem,
  cancelStockReceipt,
  confirmStockReceipt,
  createStockReceipt,
  getReceiptItems,
  removeReceiptItem,
  type StockReceiptItemRow,
  type StockReceiptRow,
  type StockReceiptStatus,
} from "@/lib/actions/stock-receipts";
import type { SupplierRow } from "@/lib/actions/suppliers";
import { cn } from "@/lib/utils";

type ProductOption = { id: string; name: string; sku: string };

type Props = {
  initialReceipts: StockReceiptRow[];
  suppliers: SupplierRow[];
  products: ProductOption[];
};

const statusTone: Record<
  StockReceiptStatus,
  "default" | "success" | "warning" | "danger" | "info"
> = {
  draft: "default",
  confirmed: "success",
  cancelled: "danger",
};

const statusLabel: Record<StockReceiptStatus, string> = {
  draft: "Rascunho",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("pt-BR");
}

type AddForm = { productId: string; quantity: string; unitCost: string };
const defaultAddForm: AddForm = { productId: "", quantity: "1", unitCost: "" };

export function PurchasesContent({
  initialReceipts,
  suppliers,
  products,
}: Props) {
  const router = useRouter();
  const [receipts, setReceipts] = useState<StockReceiptRow[]>(initialReceipts);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<
    Record<string, StockReceiptItemRow[]>
  >({});
  const [loadingItems, setLoadingItems] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    supplierId: "",
    invoiceNumber: "",
    notes: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [addForm, setAddForm] = useState<AddForm>(defaultAddForm);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setAddForm(defaultAddForm);
    setAddError(null);
    setActionError(null);
  }, [expandedId]);

  async function handleToggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!expandedItems[id]) {
      setLoadingItems(id);
      const items = await getReceiptItems(id);
      setExpandedItems((prev) => ({ ...prev, [id]: items }));
      setLoadingItems(null);
    }
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    const supplier = createForm.supplierId
      ? suppliers.find((s) => s.id === createForm.supplierId)
      : null;
    const result = await createStockReceipt({
      supplierId: supplier?.id,
      supplierName: supplier?.name,
      invoiceNumber: createForm.invoiceNumber.trim() || undefined,
      notes: createForm.notes.trim() || undefined,
    });
    setCreating(false);
    if (!result.success) {
      setCreateError(result.error);
      return;
    }
    setReceipts((prev) => [result.data, ...prev]);
    setIsCreateOpen(false);
    setCreateForm({ supplierId: "", invoiceNumber: "", notes: "" });
    router.refresh();
  }

  async function handleAddItem(receiptId: string) {
    if (!addForm.productId || !addForm.quantity || !addForm.unitCost) return;
    const qty = parseFloat(addForm.quantity);
    const cost = parseFloat(addForm.unitCost);
    if (isNaN(qty) || qty <= 0 || isNaN(cost) || cost < 0) return;
    setAdding(true);
    setAddError(null);
    const result = await addReceiptItem({
      stockReceiptId: receiptId,
      productId: addForm.productId,
      quantity: qty,
      unitCost: cost,
    });
    setAdding(false);
    if (!result.success) {
      setAddError(result.error);
      return;
    }
    setExpandedItems((prev) => ({
      ...prev,
      [receiptId]: [...(prev[receiptId] ?? []), result.data],
    }));
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === receiptId
          ? {
              ...r,
              totalCost: r.totalCost + qty * cost,
              _count: { items: r._count.items + 1 },
            }
          : r,
      ),
    );
    setAddForm(defaultAddForm);
    router.refresh();
  }

  async function handleRemoveItem(
    receiptId: string,
    itemId: string,
    itemTotal: number,
  ) {
    const result = await removeReceiptItem(itemId);
    if (!result.success) return;
    setExpandedItems((prev) => ({
      ...prev,
      [receiptId]: (prev[receiptId] ?? []).filter((i) => i.id !== itemId),
    }));
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === receiptId
          ? {
              ...r,
              totalCost: Math.max(0, r.totalCost - itemTotal),
              _count: { items: Math.max(0, r._count.items - 1) },
            }
          : r,
      ),
    );
    router.refresh();
  }

  async function handleConfirm(id: string) {
    setActionError(null);
    const result = await confirmStockReceipt(id);
    if (!result.success) {
      setActionError(result.error);
      return;
    }
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "confirmed" as StockReceiptStatus,
              confirmedAt: new Date(),
            }
          : r,
      ),
    );
    setExpandedId(null);
    router.refresh();
  }

  async function handleCancel(id: string) {
    setActionError(null);
    const result = await cancelStockReceipt(id);
    if (!result.success) {
      setActionError(result.error);
      return;
    }
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "cancelled" as StockReceiptStatus } : r,
      ),
    );
    setExpandedId(null);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        eyebrow="Gestao de estoque"
        title="Notas Fiscais de Entrada"
        description="Registre e confirme recebimentos de mercadorias de fornecedores."
        action={
          <Button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            Nova NF
          </Button>
        }
      />

      {isCreateOpen && (
        <CreateModal
          suppliers={suppliers}
          form={createForm}
          creating={creating}
          error={createError}
          onChange={(key, val) =>
            setCreateForm((c) => ({ ...c, [key]: val }))
          }
          onClose={() => {
            setIsCreateOpen(false);
            setCreateError(null);
          }}
          onSubmit={handleCreate}
        />
      )}

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            Recebimentos
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Clique em uma linha de rascunho para adicionar itens e confirmar.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold" />
                <th className="px-5 py-3 font-semibold">Codigo</th>
                <th className="px-5 py-3 font-semibold">Fornecedor</th>
                <th className="px-5 py-3 font-semibold">Nro NF</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Itens</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Data</th>
                <th className="px-5 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipts.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    Nenhum recebimento registrado.
                  </td>
                </tr>
              ) : (
                receipts.map((receipt) => {
                  const isDraft = receipt.status === "draft";
                  const isExpanded = expandedId === receipt.id;
                  const items = expandedItems[receipt.id] ?? [];

                  return (
                    <Fragment key={receipt.id}>
                      <tr
                        className={cn(
                          "cursor-pointer text-slate-700 transition-colors",
                          isDraft
                            ? "hover:bg-slate-50"
                            : "cursor-default opacity-80",
                        )}
                        onClick={() => void handleToggleExpand(receipt.id)}
                      >
                        <td className="px-3 py-4 text-slate-400">
                          {isExpanded ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold text-slate-900">
                          {receipt.code}
                        </td>
                        <td className="px-5 py-4">
                          {receipt.supplierName ?? (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          {receipt.invoiceNumber ?? (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <StatusBadge
                            label={statusLabel[receipt.status as StockReceiptStatus]}
                            tone={statusTone[receipt.status as StockReceiptStatus]}
                          />
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                          {receipt._count.items}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-medium">
                          {formatCurrency(receipt.totalCost)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                          {formatDate(receipt.createdAt)}
                        </td>
                        <td
                          className="whitespace-nowrap px-5 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isDraft && (
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="text-red-500 hover:border-red-200 hover:text-red-600"
                                onClick={() => void handleCancel(receipt.id)}
                              >
                                <X className="size-4" aria-hidden="true" />
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                onClick={() => void handleConfirm(receipt.id)}
                              >
                                <CheckCircle2
                                  className="size-4"
                                  aria-hidden="true"
                                />
                                Confirmar
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={9}
                            className="bg-slate-50 px-8 py-5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {loadingItems === receipt.id ? (
                              <p className="text-sm text-slate-400">
                                Carregando itens...
                              </p>
                            ) : (
                              <div className="space-y-4">
                                {actionError && (
                                  <p className="text-sm text-red-600">
                                    {actionError}
                                  </p>
                                )}

                                {items.length === 0 ? (
                                  <p className="text-sm text-slate-400">
                                    Nenhum item adicionado.
                                  </p>
                                ) : (
                                  <table className="w-full border-collapse text-sm">
                                    <thead className="text-xs uppercase text-slate-500">
                                      <tr>
                                        <th className="py-1 pr-4 text-left font-semibold">
                                          Produto
                                        </th>
                                        <th className="py-1 pr-4 text-right font-semibold">
                                          Qtd
                                        </th>
                                        <th className="py-1 pr-4 text-right font-semibold">
                                          Custo unit.
                                        </th>
                                        <th className="py-1 pr-4 text-right font-semibold">
                                          Total
                                        </th>
                                        {isDraft && (
                                          <th className="py-1 font-semibold" />
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                      {items.map((item) => (
                                        <tr key={item.id}>
                                          <td className="py-2 pr-4 font-medium text-slate-900">
                                            {item.productName}
                                          </td>
                                          <td className="py-2 pr-4 text-right tabular-nums">
                                            {item.quantity}
                                          </td>
                                          <td className="py-2 pr-4 text-right tabular-nums">
                                            {formatCurrency(item.unitCost)}
                                          </td>
                                          <td className="py-2 pr-4 text-right font-semibold tabular-nums">
                                            {formatCurrency(item.total)}
                                          </td>
                                          {isDraft && (
                                            <td className="py-2">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  void handleRemoveItem(
                                                    receipt.id,
                                                    item.id,
                                                    item.total,
                                                  )
                                                }
                                                className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                              >
                                                <Trash2
                                                  className="size-4"
                                                  aria-hidden="true"
                                                />
                                              </button>
                                            </td>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}

                                {isDraft && (
                                  <div className="flex flex-wrap items-end gap-3 border-t border-slate-200 pt-4">
                                    <div className="min-w-[200px] flex-1">
                                      <label className="mb-1 block text-xs font-medium text-slate-600">
                                        Produto
                                      </label>
                                      <select
                                        value={addForm.productId}
                                        onChange={(e) =>
                                          setAddForm((f) => ({
                                            ...f,
                                            productId: e.target.value,
                                          }))
                                        }
                                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                      >
                                        <option value="">
                                          Selecionar produto
                                        </option>
                                        {products.map((p) => (
                                          <option key={p.id} value={p.id}>
                                            {p.name} ({p.sku})
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="w-24">
                                      <label className="mb-1 block text-xs font-medium text-slate-600">
                                        Qtd
                                      </label>
                                      <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={addForm.quantity}
                                        onChange={(e) =>
                                          setAddForm((f) => ({
                                            ...f,
                                            quantity: e.target.value,
                                          }))
                                        }
                                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                      />
                                    </div>
                                    <div className="w-32">
                                      <label className="mb-1 block text-xs font-medium text-slate-600">
                                        Custo unit. (R$)
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={addForm.unitCost}
                                        onChange={(e) =>
                                          setAddForm((f) => ({
                                            ...f,
                                            unitCost: e.target.value,
                                          }))
                                        }
                                        placeholder="0,00"
                                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      disabled={
                                        adding ||
                                        !addForm.productId ||
                                        !addForm.unitCost
                                      }
                                      onClick={() =>
                                        void handleAddItem(receipt.id)
                                      }
                                      className="bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
                                    >
                                      <Plus
                                        className="size-4"
                                        aria-hidden="true"
                                      />
                                      {adding ? "Adicionando..." : "Adicionar"}
                                    </Button>
                                    {addError && (
                                      <p className="w-full text-xs text-red-600">
                                        {addError}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function CreateModal({
  suppliers,
  form,
  creating,
  error,
  onChange,
  onClose,
  onSubmit,
}: {
  suppliers: SupplierRow[];
  form: { supplierId: string; invoiceNumber: string; notes: string };
  creating: boolean;
  error: string | null;
  onChange: (key: string, val: string) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-emerald-600" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">
              Nova NF de entrada
            </h2>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="space-y-3 px-5 py-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Fornecedor (opcional)
              </span>
              <select
                value={form.supplierId}
                onChange={(e) => onChange("supplierId", e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Sem fornecedor</option>
                {suppliers
                  .filter((s) => s.active)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Numero da NF (opcional)
              </span>
              <input
                value={form.invoiceNumber}
                onChange={(e) => onChange("invoiceNumber", e.target.value)}
                placeholder="Ex.: 001234"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Observacoes (opcional)
              </span>
              <textarea
                value={form.notes}
                onChange={(e) => onChange("notes", e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={creating}
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              {creating ? "Criando..." : "Criar rascunho"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
