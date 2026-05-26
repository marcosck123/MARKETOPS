"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Mail,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Search,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  createSupplier,
  toggleSupplierStatus,
  updateSupplier,
  type SupplierRow,
} from "@/lib/actions/suppliers";

type FormState = {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  contactName: string;
  notes: string;
};

const defaultForm: FormState = {
  name: "",
  cnpj: "",
  phone: "",
  email: "",
  contactName: "",
  notes: "",
};

function formatCnpj(cnpj: string | null): string {
  if (!cnpj) return "";
  const d = cnpj.replace(/\D/g, "");
  if (d.length === 14)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  return cnpj;
}

export function SuppliersContent({
  initialSuppliers,
}: {
  initialSuppliers: SupplierRow[];
}) {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<SupplierRow[]>(initialSuppliers);
  const [formState, setFormState] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.cnpj && s.cnpj.includes(q.replace(/\D/g, ""))),
    );
  }, [searchTerm, suppliers]);

  const activeCount = suppliers.filter((s) => s.active).length;

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState((c) => ({ ...c, [key]: value }));
  }

  function openNew() {
    setFormState(defaultForm);
    setEditingId(null);
    setError(null);
    setIsModalOpen(true);
  }

  function openEdit(supplier: SupplierRow) {
    setFormState({
      name: supplier.name,
      cnpj: supplier.cnpj ?? "",
      phone: supplier.phone ?? "",
      email: supplier.email ?? "",
      contactName: supplier.contactName ?? "",
      notes: supplier.notes ?? "",
    });
    setEditingId(supplier.id);
    setError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const data = {
      name: formState.name.trim(),
      cnpj: formState.cnpj.trim() || undefined,
      phone: formState.phone.trim() || undefined,
      email: formState.email.trim() || undefined,
      contactName: formState.contactName.trim() || undefined,
      notes: formState.notes.trim() || undefined,
    };
    const result = editingId
      ? await updateSupplier(editingId, data)
      : await createSupplier(data);
    setSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    if (editingId) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === editingId ? result.data : s)),
      );
    } else {
      setSuppliers((prev) => [...prev, result.data]);
    }
    router.refresh();
    closeModal();
  }

  async function handleToggle(id: string) {
    const result = await toggleSupplierStatus(id);
    if (!result.success) return;
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    );
    router.refresh();
  }

  return (
    <>
      <PageHeader
        eyebrow="Cadastro operacional"
        title="Fornecedores"
        description="Cadastre fornecedores e contatos comerciais para pedidos de compra e recebimento de mercadorias."
        action={
          <Button
            type="button"
            onClick={openNew}
            className="bg-amber-400 text-stone-950 hover:bg-amber-300"
          >
            <Plus className="size-4" aria-hidden="true" />
            Novo fornecedor
          </Button>
        }
      />

      {isModalOpen && (
        <SupplierModal
          isEditing={Boolean(editingId)}
          formState={formState}
          saving={saving}
          error={error}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onUpdateForm={updateForm}
        />
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <SummaryCard label="Fornecedores ativos" value={String(activeCount)} />
        <SummaryCard label="Total cadastrado" value={String(suppliers.length)} />
      </section>

      <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200 px-5 py-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-base font-semibold text-stone-950">
              Lista de fornecedores
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Busque por nome ou CNPJ.
            </p>
          </div>
          <div className="relative max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
              aria-hidden="true"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar fornecedor"
              className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 pl-9 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Fornecedor</th>
                <th className="px-5 py-3 font-semibold">CNPJ</th>
                <th className="px-5 py-3 font-semibold">Telefone</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-sm text-stone-400"
                  >
                    Nenhum fornecedor encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="text-stone-700">
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-950">{s.name}</p>
                      {s.contactName && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
                          <UserRound className="size-3" aria-hidden="true" />
                          {s.contactName}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-mono text-xs">
                      {formatCnpj(s.cnpj) || "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {s.phone ? (
                        <p className="flex items-center gap-1.5 text-xs">
                          <Phone
                            className="size-3.5 text-stone-400"
                            aria-hidden="true"
                          />
                          {s.phone}
                        </p>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {s.email ? (
                        <p className="flex items-center gap-1.5 text-xs">
                          <Mail
                            className="size-3.5 text-stone-400"
                            aria-hidden="true"
                          />
                          {s.email}
                        </p>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={s.active ? "Ativo" : "Inativo"}
                        tone={s.active ? "success" : "warning"}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openEdit(s)}
                        >
                          <Edit3 className="size-4" aria-hidden="true" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleToggle(s.id)}
                        >
                          <RotateCcw className="size-4" aria-hidden="true" />
                          {s.active ? "Inativar" : "Reativar"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function SupplierModal({
  isEditing,
  formState,
  saving,
  error,
  onClose,
  onSubmit,
  onUpdateForm,
}: {
  isEditing: boolean;
  formState: FormState;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="supplier-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Truck className="size-5 text-amber-600" aria-hidden="true" />
            <h2
              id="supplier-modal-title"
              className="text-base font-semibold text-stone-950"
            >
              {isEditing ? "Editar fornecedor" : "Novo fornecedor"}
            </h2>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid max-h-[calc(92vh-140px)] gap-3 overflow-y-auto px-5 py-5 md:grid-cols-2">
            <Field label="Nome / Razao social" className="md:col-span-2">
              <input
                value={formState.name}
                onChange={(e) => onUpdateForm("name", e.target.value)}
                placeholder="Ex.: Distribuidora Norte"
                required
                autoFocus
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </Field>

            <Field label="CNPJ (opcional)">
              <input
                value={formState.cnpj}
                onChange={(e) => onUpdateForm("cnpj", e.target.value)}
                placeholder="00.000.000/0000-00"
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </Field>

            <Field label="Telefone (opcional)">
              <input
                value={formState.phone}
                onChange={(e) => onUpdateForm("phone", e.target.value)}
                placeholder="(65) 3333-0000"
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </Field>

            <Field label="E-mail (opcional)">
              <input
                value={formState.email}
                onChange={(e) => onUpdateForm("email", e.target.value)}
                placeholder="comercial@fornecedor.com"
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </Field>

            <Field label="Contato / Representante (opcional)">
              <input
                value={formState.contactName}
                onChange={(e) => onUpdateForm("contactName", e.target.value)}
                placeholder="Nome do contato comercial"
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </Field>

            <Field label="Observacoes (opcional)" className="md:col-span-2">
              <textarea
                value={formState.notes}
                onChange={(e) => onUpdateForm("notes", e.target.value)}
                rows={3}
                placeholder="Condicoes comerciais, categorias atendidas ou observacoes internas"
                className="w-full resize-none rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </Field>

            {error && (
              <p className="md:col-span-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex flex-col-reverse justify-end gap-2 border-t border-stone-200 px-5 py-4 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-amber-400 text-stone-950 hover:bg-amber-300 disabled:opacity-50"
            >
              <Save className="size-4" aria-hidden="true" />
              {saving
                ? "Salvando..."
                : isEditing
                  ? "Salvar alteracoes"
                  : "Cadastrar fornecedor"}
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
