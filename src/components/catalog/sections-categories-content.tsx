"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Filter, FolderPlus, Plus, Save, Tags, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  createSection,
  toggleSectionStatus,
  updateSection,
} from "@/lib/actions/sections";
import {
  createCategory,
  toggleCategoryStatus,
  updateCategory,
} from "@/lib/actions/categories";

type SectionData = {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
};

type CategoryData = {
  id: string;
  sectionId: string;
  name: string;
  status: "active" | "inactive";
  products: number;
};

type EditingSection = {
  id: string;
  name: string;
  description: string;
};

type EditingCategory = {
  id: string;
  name: string;
};

type Props = {
  sections: SectionData[];
  categories: CategoryData[];
};

export function SectionsCategoriesContent({ sections, categories }: Props) {
  const router = useRouter();

  const [sectionName, setSectionName] = useState("");
  const [sectionDescription, setSectionDescription] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categorySectionId, setCategorySectionId] = useState(
    sections[0]?.id ?? "",
  );
  const [selectedSectionId, setSelectedSectionId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSection, setEditingSection] =
    useState<EditingSection | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<EditingCategory | null>(null);

  const sectionById = useMemo(() => {
    return new Map(sections.map((section) => [section.id, section]));
  }, [sections]);

  const filteredCategories = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return categories.filter((category) => {
      const section = sectionById.get(category.sectionId);
      const matchesSection =
        selectedSectionId === "all" || category.sectionId === selectedSectionId;
      const matchesSearch =
        !search ||
        category.name.toLowerCase().includes(search) ||
        section?.name.toLowerCase().includes(search);

      return matchesSection && matchesSearch;
    });
  }, [categories, searchTerm, sectionById, selectedSectionId]);

  const activeSections = sections.filter(
    (section) => section.status === "active",
  ).length;
  const activeCategories = categories.filter(
    (category) => category.status === "active",
  ).length;
  const linkedProducts = categories.reduce(
    (total, category) => total + category.products,
    0,
  );

  async function handleAddSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = sectionName.trim();
    if (!name) return;

    const result = await createSection({ name, description: sectionDescription });
    if (result.success) {
      setCategorySectionId(result.data.id);
      setSectionName("");
      setSectionDescription("");
      router.refresh();
    }
  }

  async function handleAddCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryName.trim() || !categorySectionId) return;

    const result = await createCategory({
      name: categoryName,
      sectionId: categorySectionId,
    });
    if (result.success) {
      setCategoryName("");
      router.refresh();
    }
  }

  function handleToggleSection(sectionId: string) {
    void toggleSectionStatus(sectionId).then(() => router.refresh());
  }

  function handleToggleCategory(categoryId: string) {
    void toggleCategoryStatus(categoryId).then(() => router.refresh());
  }

  async function handleSaveSection() {
    if (!editingSection?.name.trim()) return;

    const result = await updateSection(editingSection.id, {
      name: editingSection.name,
      description: editingSection.description,
    });
    if (result.success) {
      setEditingSection(null);
      router.refresh();
    }
  }

  async function handleSaveCategory() {
    if (!editingCategory?.name.trim()) return;

    const category = categories.find((c) => c.id === editingCategory.id);
    if (!category) return;

    const result = await updateCategory(editingCategory.id, {
      name: editingCategory.name,
      sectionId: category.sectionId,
    });
    if (result.success) {
      setEditingCategory(null);
      router.refresh();
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Cadastro operacional"
        title="Secoes e categorias"
        description="Organize produtos por areas do atacado antes de cadastrar mercadorias, estoque e regras de venda."
        action={<StatusBadge label="Banco real" tone="success" />}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Secoes ativas" value={String(activeSections)} />
        <SummaryCard label="Categorias ativas" value={String(activeCategories)} />
        <SummaryCard label="Produtos vinculados" value={String(linkedProducts)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <form
            onSubmit={handleAddSection}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <FolderPlus className="size-5 text-emerald-600" />
              <h2 className="text-base font-semibold text-slate-950">
                Nova secao
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              <input
                value={sectionName}
                onChange={(event) => setSectionName(event.target.value)}
                placeholder="Ex.: Hortifruti"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
              <textarea
                value={sectionDescription}
                onChange={(event) => setSectionDescription(event.target.value)}
                placeholder="Descricao curta da secao"
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
              <Button
                type="submit"
                className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              >
                <Plus className="size-4" aria-hidden="true" />
                Adicionar secao
              </Button>
            </div>
          </form>

          <form
            onSubmit={handleAddCategory}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Tags className="size-5 text-emerald-600" />
              <h2 className="text-base font-semibold text-slate-950">
                Nova categoria
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Ex.: Verduras"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
              <select
                value={categorySectionId}
                onChange={(event) => setCategorySectionId(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                className="w-full bg-slate-950 text-white hover:bg-slate-800"
              >
                <Plus className="size-4" aria-hidden="true" />
                Adicionar categoria
              </Button>
            </div>
          </form>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Secoes cadastradas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Base para filtros, produtos e relatorios.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {sections.map((section) => {
              const sectionCategories = categories.filter(
                (category) => category.sectionId === section.id,
              );
              const sectionDraft =
                editingSection?.id === section.id ? editingSection : null;

              return (
                <article
                  key={section.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  {sectionDraft ? (
                    <div className="space-y-3">
                      <input
                        value={sectionDraft.name}
                        onChange={(event) =>
                          setEditingSection({
                            ...sectionDraft,
                            name: event.target.value,
                          })
                        }
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                      <textarea
                        value={sectionDraft.description}
                        onChange={(event) =>
                          setEditingSection({
                            ...sectionDraft,
                            description: event.target.value,
                          })
                        }
                        rows={3}
                        className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleSaveSection}
                          className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                        >
                          <Save className="size-4" aria-hidden="true" />
                          Salvar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingSection(null)}
                        >
                          <X className="size-4" aria-hidden="true" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-950">
                            {section.name}
                          </h3>
                          <p className="mt-1 text-sm leading-5 text-slate-500">
                            {section.description}
                          </p>
                        </div>
                        <StatusBadge
                          label={section.status === "active" ? "Ativa" : "Inativa"}
                          tone={section.status === "active" ? "success" : "warning"}
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                        <span>{sectionCategories.length} categorias</span>
                        <span>
                          {sectionCategories.reduce(
                            (total, category) => total + category.products,
                            0,
                          )}{" "}
                          produtos
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setEditingSection({
                              id: section.id,
                              name: section.name,
                              description: section.description,
                            })
                          }
                        >
                          <Edit3 className="size-4" aria-hidden="true" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleToggleSection(section.id)}
                        >
                          {section.status === "active" ? "Inativar" : "Reativar"}
                        </Button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Categorias
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Consulte, filtre e altere categorias por secao.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Filter
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <select
                value={selectedSectionId}
                onChange={(event) => setSelectedSectionId(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:w-56"
              >
                <option value="all">Todas as secoes</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar categoria"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Categoria</th>
                <th className="px-5 py-3 font-semibold">Secao</th>
                <th className="px-5 py-3 font-semibold">Produtos</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.map((category) => {
                const section = sectionById.get(category.sectionId);
                const categoryDraft =
                  editingCategory?.id === category.id ? editingCategory : null;

                return (
                  <tr key={category.id} className="text-slate-700">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-950">
                      {categoryDraft ? (
                        <input
                          value={categoryDraft.name}
                          onChange={(event) =>
                            setEditingCategory({
                              ...categoryDraft,
                              name: event.target.value,
                            })
                          }
                          className="h-9 w-56 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                      ) : (
                        category.name
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {section?.name ?? "Sem secao"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {category.products}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={category.status === "active" ? "Ativa" : "Inativa"}
                        tone={category.status === "active" ? "success" : "warning"}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {categoryDraft ? (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={handleSaveCategory}
                            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                          >
                            <Save className="size-4" aria-hidden="true" />
                            Salvar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingCategory(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setEditingCategory({
                                id: category.id,
                                name: category.name,
                              })
                            }
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleToggleCategory(category.id)}
                          >
                            {category.status === "active"
                              ? "Inativar"
                              : "Reativar"}
                          </Button>
                        </div>
                      )}
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </article>
  );
}
