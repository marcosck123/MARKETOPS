"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ClipboardList,
  Filter,
  PackageCheck,
  Plus,
  Save,
  Search,
  Warehouse,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { adjustStock } from "@/lib/actions/stock";

type StockMovementType = "entrada" | "saida" | "ajuste";

const movementTypeLabels: Record<StockMovementType, string> = {
  entrada: "Entrada",
  saida: "Saida",
  ajuste: "Ajuste",
};

type StockProductData = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  sectionId: string;
  categoryId: string;
  costPrice: number;
  currentStock: number;
  minimumStock: number;
  status: "active" | "inactive";
};

type SectionData = { id: string; name: string };
type CategoryData = { id: string; name: string };

type StockEntryData = {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  responsible: string | null;
  createdAt: string;
};

type MovementFormState = {
  productId: string;
  type: StockMovementType;
  quantity: string;
  reason: string;
  responsible: string;
};

function makeDefaultMovementForm(
  products: StockProductData[],
): MovementFormState {
  return {
    productId: products[0]?.id ?? "",
    type: "entrada",
    quantity: "",
    reason: "",
    responsible: "Admin MARKETOPS",
  };
}

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

function getMovementTone(quantity: number) {
  if (quantity > 0) return "success" as const;
  if (quantity < 0) return "warning" as const;

  return "info" as const;
}

function formatDelta(quantity: number) {
  if (quantity > 0) return `+${quantity}`;

  return String(quantity);
}

export function StockContent({
  products: initialProducts,
  sections,
  categories,
  movements: initialMovements,
}: {
  products: StockProductData[];
  sections: SectionData[];
  categories: CategoryData[];
  movements: StockEntryData[];
}) {
  const router = useRouter();
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementForm, setMovementForm] = useState<MovementFormState>(() =>
    makeDefaultMovementForm(initialProducts),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const sectionById = useMemo(
    () => new Map(sections.map((s) => [s.id, s])),
    [sections],
  );
  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );
  const productById = useMemo(
    () => new Map(initialProducts.map((p) => [p.id, p])),
    [initialProducts],
  );

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return initialProducts.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.barcode.includes(search);
      const matchesSection =
        sectionFilter === "all" || product.sectionId === sectionFilter;
      const isLowStock = product.currentStock <= product.minimumStock;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && isLowStock) ||
        (stockFilter === "ok" && !isLowStock);

      return matchesSearch && matchesSection && matchesStock;
    });
  }, [initialProducts, searchTerm, sectionFilter, stockFilter]);

  const totalUnits = initialProducts.reduce(
    (total, product) => total + product.currentStock,
    0,
  );
  const lowStockCount = initialProducts.filter(
    (product) => product.currentStock <= product.minimumStock,
  ).length;
  const stockValue = initialProducts.reduce(
    (total, product) => total + product.currentStock * product.costPrice,
    0,
  );

  function updateMovementForm<K extends keyof MovementFormState>(
    key: K,
    value: MovementFormState[K],
  ) {
    setMovementForm((current) => ({ ...current, [key]: value }));
  }

  function openMovementModal(productId?: string) {
    setMovementForm({
      ...makeDefaultMovementForm(initialProducts),
      productId: productId ?? initialProducts[0]?.id ?? "",
    });
    setIsMovementModalOpen(true);
  }

  function closeMovementModal() {
    setMovementForm(makeDefaultMovementForm(initialProducts));
    setIsMovementModalOpen(false);
  }

  async function handleSubmitMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const quantity = parseNumber(movementForm.quantity);

    if (!movementForm.productId || quantity <= 0 || !movementForm.reason.trim()) {
      return;
    }

    const result = await adjustStock({
      productId: movementForm.productId,
      quantity,
      type: movementForm.type,
      reason: movementForm.reason,
      responsible: movementForm.responsible,
    });

    if (result.success) {
      router.refresh();
      closeMovementModal();
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Controle operacional"
        title="Estoque"
        description="Registre entradas, ajustes, perdas e devolucoes mantendo historico. O saldo atual nao deve ser editado diretamente."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label="Banco real" tone="info" />
            <Button
              type="button"
              onClick={() => openMovementModal()}
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              <Plus className="size-4" aria-hidden="true" />
              Registrar movimento
            </Button>
          </div>
        }
      />

      <StockMovementModal
        isOpen={isMovementModalOpen}
        formState={movementForm}
        products={initialProducts}
        onClose={closeMovementModal}
        onSubmit={handleSubmitMovement}
        onUpdateForm={updateMovementForm}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Unidades em estoque" value={String(totalUnits)} />
        <SummaryCard label="Produtos em alerta" value={String(lowStockCount)} />
        <SummaryCard label="Valor em estoque" value={formatCurrency(stockValue)} />
        <SummaryCard label="Movimentos" value={String(initialMovements.length)} />
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <ClipboardList className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="text-sm font-semibold text-amber-900">
              Regra de controle
            </h2>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Qualquer alteracao de saldo deve gerar uma movimentacao com tipo,
              motivo, responsavel e data. Isso prepara o MARKETOPS para auditoria
              e evita divergencia no PDV.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Saldo por produto
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Consulte saldo atual, minimo e alertas antes de movimentar.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1fr_160px]">
            <div className="relative sm:col-span-2 xl:col-span-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar produto"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Todos</option>
              <option value="low">Estoque baixo</option>
              <option value="ok">Estoque OK</option>
            </select>
          </div>
        </div>

        <div className="border-b border-slate-200 px-5 py-4">
          <div className="relative max-w-sm">
            <Filter
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <select
              value={sectionFilter}
              onChange={(event) => setSectionFilter(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Todas as secoes</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Produto</th>
                <th className="px-5 py-3 font-semibold">Secao</th>
                <th className="px-5 py-3 font-semibold">Atual</th>
                <th className="px-5 py-3 font-semibold">Minimo</th>
                <th className="px-5 py-3 font-semibold">Valor custo</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Acao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const section = sectionById.get(product.sectionId);
                const category = categoryById.get(product.categoryId);
                const isLowStock = product.currentStock <= product.minimumStock;

                return (
                  <tr key={product.id} className="text-slate-700">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-950">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {product.sku} | {category?.name ?? "Sem categoria"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {section?.name ?? "Sem secao"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-950">
                      {product.currentStock}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {product.minimumStock}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatCurrency(product.currentStock * product.costPrice)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={isLowStock ? "Baixo" : "OK"}
                        tone={isLowStock ? "warning" : "success"}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openMovementModal(product.id)}
                      >
                        <Warehouse className="size-4" aria-hidden="true" />
                        Movimentar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            Historico de movimentacoes
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Ultimos eventos que alteraram o saldo dos produtos.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Data</th>
                <th className="px-5 py-3 font-semibold">Produto</th>
                <th className="px-5 py-3 font-semibold">Tipo</th>
                <th className="px-5 py-3 font-semibold">Qtd.</th>
                <th className="px-5 py-3 font-semibold">Responsavel</th>
                <th className="px-5 py-3 font-semibold">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialMovements.map((movement) => {
                const product = productById.get(movement.productId);

                return (
                  <tr key={movement.id} className="text-slate-700">
                    <td className="whitespace-nowrap px-5 py-4">
                      {movement.createdAt}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-950">
                      {product?.name ?? "Produto removido"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {movementTypeLabels[movement.type]}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={formatDelta(movement.quantity)}
                        tone={getMovementTone(movement.quantity)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {movement.responsible ?? "—"}
                    </td>
                    <td className="min-w-64 px-5 py-4 text-slate-500">
                      {movement.reason ?? "—"}
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

function StockMovementModal({
  isOpen,
  formState,
  products,
  onClose,
  onSubmit,
  onUpdateForm,
}: {
  isOpen: boolean;
  formState: MovementFormState;
  products: StockProductData[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof MovementFormState>(
    key: K,
    value: MovementFormState[K],
  ) => void;
}) {
  const selectedProduct = products.find(
    (product) => product.id === formState.productId,
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-modal-title"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <PackageCheck className="size-5 text-emerald-600" />
            <div>
              <h2
                id="stock-modal-title"
                className="text-base font-semibold text-slate-950"
              >
                Registrar movimentacao
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                O saldo sera atualizado a partir deste evento.
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Fechar modal</span>
          </Button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid gap-3 px-5 py-5 md:grid-cols-2">
            <Field label="Produto" className="md:col-span-2">
              <select
                value={formState.productId}
                onChange={(event) =>
                  onUpdateForm("productId", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} | saldo {product.currentStock}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tipo">
              <select
                value={formState.type}
                onChange={(event) =>
                  onUpdateForm("type", event.target.value as StockMovementType)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                {Object.entries(movementTypeLabels).map(([type, label]) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Quantidade">
              <input
                value={formState.quantity}
                onChange={(event) => onUpdateForm("quantity", event.target.value)}
                inputMode="decimal"
                placeholder="0"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="Responsavel" className="md:col-span-2">
              <input
                value={formState.responsible}
                onChange={(event) =>
                  onUpdateForm("responsible", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="Motivo" className="md:col-span-2">
              <textarea
                value={formState.reason}
                onChange={(event) => onUpdateForm("reason", event.target.value)}
                rows={3}
                placeholder="Ex.: entrada por compra, perda por avaria, ajuste de inventario"
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <p className="text-sm font-medium text-slate-950">
                Saldo atual: {selectedProduct?.currentStock ?? 0}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                {formState.type === "entrada" ? (
                  <>
                    <ArrowUp className="size-4 text-emerald-600" aria-hidden="true" />
                    Este movimento soma ao estoque atual.
                  </>
                ) : formState.type === "saida" ? (
                  <>
                    <ArrowDown className="size-4 text-amber-600" aria-hidden="true" />
                    Este movimento reduz o estoque atual.
                  </>
                ) : (
                  <>
                    <ClipboardList className="size-4" aria-hidden="true" />
                    Ajuste positivo soma, ajuste negativo reduz o estoque.
                  </>
                )}
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
              Salvar movimento
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
