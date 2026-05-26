"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Barcode,
  Edit3,
  Filter,
  PackagePlus,
  Plus,
  RotateCcw,
  Save,
  Search,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  createProduct,
  toggleProductStatus,
  updateProduct,
} from "@/lib/actions/products";
import { type Product, type ProductUnit, productUnits } from "@/lib/product-data";

type SectionData = { id: string; name: string };
type CategoryData = { id: string; name: string; sectionId: string };

type ProductFormState = {
  name: string;
  barcode: string;
  sku: string;
  sectionId: string;
  categoryId: string;
  unit: ProductUnit;
  costPrice: string;
  salePrice: string;
  wholesalePrice: string;
  currentStock: string;
  minimumStock: string;
};

function makeDefaultFormState(
  sections: SectionData[],
  categories: CategoryData[],
): ProductFormState {
  return {
    name: "",
    barcode: "",
    sku: "",
    sectionId: sections[0]?.id ?? "",
    categoryId: categories[0]?.id ?? "",
    unit: "unidade",
    costPrice: "",
    salePrice: "",
    wholesalePrice: "",
    currentStock: "",
    minimumStock: "",
  };
}

function parseNumber(value: string) {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function productToForm(product: Product): ProductFormState {
  return {
    name: product.name,
    barcode: product.barcode,
    sku: product.sku,
    sectionId: product.sectionId,
    categoryId: product.categoryId,
    unit: product.unit,
    costPrice: String(product.costPrice),
    salePrice: String(product.salePrice),
    wholesalePrice: String(product.wholesalePrice),
    currentStock: String(product.currentStock),
    minimumStock: String(product.minimumStock),
  };
}

export function ProductsContent({
  products: initialProducts,
  sections,
  categories,
}: {
  products: Product[];
  sections: SectionData[];
  categories: CategoryData[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [formState, setFormState] = useState<ProductFormState>(() =>
    makeDefaultFormState(sections, categories),
  );
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const sectionById = useMemo(
    () => new Map(sections.map((section) => [section.id, section])),
    [sections],
  );
  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const categoriesForForm = useMemo(() => {
    return categories.filter(
      (category) => category.sectionId === formState.sectionId,
    );
  }, [formState.sectionId, categories]);

  const categoriesForFilter = useMemo(() => {
    if (sectionFilter === "all") {
      return categories;
    }

    return categories.filter(
      (category) => category.sectionId === sectionFilter,
    );
  }, [sectionFilter, categories]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const section = sectionById.get(product.sectionId);
      const category = categoryById.get(product.categoryId);
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.barcode.includes(search);
      const matchesSection =
        sectionFilter === "all" || product.sectionId === sectionFilter;
      const matchesCategory =
        categoryFilter === "all" || product.categoryId === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;

      return (
        matchesSearch &&
        matchesSection &&
        matchesCategory &&
        matchesStatus &&
        section &&
        category
      );
    });
  }, [
    categoryById,
    categoryFilter,
    products,
    searchTerm,
    sectionById,
    sectionFilter,
    statusFilter,
  ]);

  const activeProducts = products.filter(
    (product) => product.status === "active",
  ).length;
  const lowStockProducts = products.filter(
    (product) => product.currentStock <= product.minimumStock,
  ).length;
  const stockValue = products.reduce(
    (total, product) => total + product.currentStock * product.costPrice,
    0,
  );

  function updateForm<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function handleSectionChange(sectionId: string) {
    const firstCategory =
      categories.find((category) => category.sectionId === sectionId)?.id ??
      "";

    setFormState((current) => ({
      ...current,
      sectionId,
      categoryId: firstCategory,
    }));
  }

  function handleFilterSectionChange(sectionId: string) {
    setSectionFilter(sectionId);
    setCategoryFilter("all");
  }

  function openNewProductModal() {
    setFormState(makeDefaultFormState(sections, categories));
    setEditingProductId(null);
    setIsProductModalOpen(true);
  }

  function closeProductModal() {
    setFormState(makeDefaultFormState(sections, categories));
    setEditingProductId(null);
    setIsProductModalOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = formState.name.trim();
    const sku = formState.sku.trim();

    if (!name || !sku || !formState.sectionId || !formState.categoryId) {
      return;
    }

    const productPayload = {
      name,
      barcode: formState.barcode.trim(),
      sku,
      sectionId: formState.sectionId,
      categoryId: formState.categoryId,
      unit: formState.unit,
      costPrice: parseNumber(formState.costPrice),
      salePrice: parseNumber(formState.salePrice),
      wholesalePrice: parseNumber(formState.wholesalePrice),
      currentStock: parseNumber(formState.currentStock),
      minimumStock: parseNumber(formState.minimumStock),
    };

    if (editingProductId) {
      const result = await updateProduct(editingProductId, productPayload);
      if (result.success) {
        router.refresh();
        closeProductModal();
      }
      return;
    }

    const result = await createProduct(productPayload);
    if (result.success) {
      router.refresh();
      closeProductModal();
    }
  }

  function handleEditProduct(product: Product) {
    setEditingProductId(product.id);
    setFormState(productToForm(product));
    setIsProductModalOpen(true);
  }

  function handleToggleProduct(productId: string) {
    void toggleProductStatus(productId).then(() => router.refresh());
  }

  return (
    <>
      <PageHeader
        eyebrow="Cadastro operacional"
        title="Produtos"
        description="Cadastre mercadorias com SKU, codigo de barras, precos, unidade de venda, estoque atual e estoque minimo."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label="Banco real" tone="info" />
            <Button
              type="button"
              onClick={openNewProductModal}
              className="bg-amber-400 text-stone-950 hover:bg-amber-300"
            >
              <Plus className="size-4" aria-hidden="true" />
              Novo produto
            </Button>
          </div>
        }
      />

      <ProductFormModal
        isOpen={isProductModalOpen}
        isEditing={Boolean(editingProductId)}
        formState={formState}
        sections={sections}
        categoriesForForm={categoriesForForm}
        onClose={closeProductModal}
        onSubmit={handleSubmit}
        onUpdateForm={updateForm}
        onSectionChange={handleSectionChange}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Produtos ativos" value={String(activeProducts)} />
        <SummaryCard label="Estoque baixo" value={String(lowStockProducts)} />
        <SummaryCard label="Valor em estoque" value={formatCurrency(stockValue)} />
      </section>

      <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200 px-5 py-4 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-base font-semibold text-stone-950">
              Lista de produtos
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Busque por nome, SKU ou codigo de barras.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1fr_160px]">
            <div className="relative sm:col-span-2 xl:col-span-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar produto"
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 pl-9 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 border-b border-stone-200 px-5 py-4 md:grid-cols-2">
          <div className="relative">
            <Filter
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
              aria-hidden="true"
            />
            <select
              value={sectionFilter}
              onChange={(event) => handleFilterSectionChange(event.target.value)}
              className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 pl-9 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
            >
              <option value="all">Todas as secoes</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
          >
            <option value="all">Todas as categorias</option>
            {categoriesForFilter.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Produto</th>
                <th className="px-5 py-3 font-semibold">Categoria</th>
                <th className="px-5 py-3 font-semibold">Unidade</th>
                <th className="px-5 py-3 font-semibold">Venda</th>
                <th className="px-5 py-3 font-semibold">Atacado</th>
                <th className="px-5 py-3 font-semibold">Estoque</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((product) => {
                const category = categoryById.get(product.categoryId);
                const section = sectionById.get(product.sectionId);
                const isLowStock = product.currentStock <= product.minimumStock;

                return (
                  <tr key={product.id} className="text-stone-700">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-stone-950">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {product.sku} | {product.barcode || "Sem codigo"}
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <p>{category?.name ?? "Sem categoria"}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        {section?.name ?? "Sem secao"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {product.unit}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatCurrency(product.salePrice)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatCurrency(product.wholesalePrice)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {product.currentStock}
                        </span>
                        <StatusBadge
                          label={isLowStock ? "Baixo" : "OK"}
                          tone={isLowStock ? "warning" : "success"}
                        />
                      </div>
                      <p className="mt-1 text-xs text-stone-500">
                        Minimo {product.minimumStock}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={product.status === "active" ? "Ativo" : "Inativo"}
                        tone={product.status === "active" ? "success" : "warning"}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit3 className="size-4" aria-hidden="true" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleToggleProduct(product.id)}
                        >
                          <RotateCcw className="size-4" aria-hidden="true" />
                          {product.status === "active" ? "Inativar" : "Reativar"}
                        </Button>
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

function ProductFormModal({
  isOpen,
  isEditing,
  formState,
  sections,
  categoriesForForm,
  onClose,
  onSubmit,
  onUpdateForm,
  onSectionChange,
}: {
  isOpen: boolean;
  isEditing: boolean;
  formState: ProductFormState;
  sections: SectionData[];
  categoriesForForm: CategoryData[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) => void;
  onSectionChange: (sectionId: string) => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <PackagePlus className="size-5 text-amber-600" />
            <div>
              <h2
                id="product-modal-title"
                className="text-base font-semibold text-stone-950"
              >
                {isEditing ? "Editar produto" : "Novo produto"}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Informe os dados comerciais e de estoque inicial.
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
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Nome do produto" className="md:col-span-2">
                <input
                  value={formState.name}
                  onChange={(event) => onUpdateForm("name", event.target.value)}
                  placeholder="Ex.: Cafe tradicional 500g"
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                  autoFocus
                />
              </Field>

              <Field label="Codigo de barras">
                <div className="relative">
                  <Barcode
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
                    aria-hidden="true"
                  />
                  <input
                    value={formState.barcode}
                    onChange={(event) =>
                      onUpdateForm("barcode", event.target.value)
                    }
                    placeholder="789..."
                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 pl-9 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </Field>

              <Field label="SKU interno">
                <input
                  value={formState.sku}
                  onChange={(event) => onUpdateForm("sku", event.target.value)}
                  placeholder="CAF-500-001"
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm uppercase outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                />
              </Field>

              <Field label="Secao">
                <select
                  value={formState.sectionId}
                  onChange={(event) => onSectionChange(event.target.value)}
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Categoria">
                <select
                  value={formState.categoryId}
                  onChange={(event) =>
                    onUpdateForm("categoryId", event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                >
                  {categoriesForForm.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Unidade">
                <select
                  value={formState.unit}
                  onChange={(event) =>
                    onUpdateForm("unit", event.target.value as ProductUnit)
                  }
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                >
                  {productUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Estoque atual">
                <input
                  value={formState.currentStock}
                  onChange={(event) =>
                    onUpdateForm("currentStock", event.target.value)
                  }
                  inputMode="decimal"
                  placeholder="0"
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                />
              </Field>

              <Field label="Estoque minimo">
                <input
                  value={formState.minimumStock}
                  onChange={(event) =>
                    onUpdateForm("minimumStock", event.target.value)
                  }
                  inputMode="decimal"
                  placeholder="0"
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                />
              </Field>

              <Field label="Preco de custo">
                <input
                  value={formState.costPrice}
                  onChange={(event) =>
                    onUpdateForm("costPrice", event.target.value)
                  }
                  inputMode="decimal"
                  placeholder="0,00"
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                />
              </Field>

              <Field label="Preco de venda">
                <input
                  value={formState.salePrice}
                  onChange={(event) =>
                    onUpdateForm("salePrice", event.target.value)
                  }
                  inputMode="decimal"
                  placeholder="0,00"
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                />
              </Field>

              <Field label="Preco atacado" className="md:col-span-2">
                <input
                  value={formState.wholesalePrice}
                  onChange={(event) =>
                    onUpdateForm("wholesalePrice", event.target.value)
                  }
                  inputMode="decimal"
                  placeholder="0,00"
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                />
              </Field>
            </div>
          </div>

          <div className="flex flex-col-reverse justify-end gap-2 border-t border-stone-200 px-5 py-4 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-amber-400 text-stone-950 hover:bg-amber-300"
            >
              <Save className="size-4" aria-hidden="true" />
              {isEditing ? "Salvar alteracoes" : "Cadastrar produto"}
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
      <span className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-stone-950">{value}</p>
    </article>
  );
}
