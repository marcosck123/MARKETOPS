"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import {
  Edit3,
  Mail,
  MapPin,
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
  type Supplier,
  type SupplierStatus,
  initialSuppliers,
} from "@/lib/supplier-data";

type SupplierFormState = {
  name: string;
  document: string;
  email: string;
  phone: string;
  city: string;
  representative: string;
  observations: string;
};

const defaultSupplierForm: SupplierFormState = {
  name: "",
  document: "",
  email: "",
  phone: "",
  city: "",
  representative: "",
  observations: "",
};

function normalizeId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function supplierToForm(supplier: Supplier): SupplierFormState {
  return {
    name: supplier.name,
    document: supplier.document,
    email: supplier.email,
    phone: supplier.phone,
    city: supplier.city,
    representative: supplier.representative,
    observations: supplier.observations,
  };
}

export function SuppliersContent() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [formState, setFormState] =
    useState<SupplierFormState>(defaultSupplierForm);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(
    null,
  );
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SupplierStatus>(
    "all",
  );

  const filteredSuppliers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch =
        !search ||
        supplier.name.toLowerCase().includes(search) ||
        supplier.document.toLowerCase().includes(search) ||
        supplier.representative.toLowerCase().includes(search) ||
        supplier.city.toLowerCase().includes(search);
      const matchesStatus =
        statusFilter === "all" || supplier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, suppliers]);

  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.status === "active",
  ).length;
  const inactiveSuppliers = suppliers.length - activeSuppliers;
  const linkedProducts = suppliers.reduce(
    (total, supplier) => total + supplier.linkedProducts,
    0,
  );

  function updateForm<K extends keyof SupplierFormState>(
    key: K,
    value: SupplierFormState[K],
  ) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function openNewSupplierModal() {
    setFormState(defaultSupplierForm);
    setEditingSupplierId(null);
    setIsSupplierModalOpen(true);
  }

  function closeSupplierModal() {
    setFormState(defaultSupplierForm);
    setEditingSupplierId(null);
    setIsSupplierModalOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = formState.name.trim();

    if (!name) {
      return;
    }

    const payload = {
      name,
      document: formState.document.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      city: formState.city.trim(),
      representative: formState.representative.trim(),
      observations: formState.observations.trim(),
    };

    if (editingSupplierId) {
      setSuppliers((current) =>
        current.map((supplier) =>
          supplier.id === editingSupplierId
            ? {
                ...supplier,
                ...payload,
              }
            : supplier,
        ),
      );
      closeSupplierModal();
      return;
    }

    const baseId = normalizeId(name) || "fornecedor";
    const id = suppliers.some((supplier) => supplier.id === baseId)
      ? `${baseId}-${Date.now()}`
      : baseId;

    setSuppliers((current) => [
      ...current,
      {
        id,
        ...payload,
        linkedProducts: 0,
        lastPurchase: "Sem compras",
        status: "active",
      },
    ]);
    closeSupplierModal();
  }

  function handleEditSupplier(supplier: Supplier) {
    setEditingSupplierId(supplier.id);
    setFormState(supplierToForm(supplier));
    setIsSupplierModalOpen(true);
  }

  function handleToggleSupplier(supplierId: string) {
    setSuppliers((current) =>
      current.map((supplier) =>
        supplier.id === supplierId
          ? {
              ...supplier,
              status: supplier.status === "active" ? "inactive" : "active",
            }
          : supplier,
      ),
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Cadastro operacional"
        title="Fornecedores"
        description="Cadastre fornecedores, contatos comerciais e status antes de iniciar pedidos de compra e recebimento de mercadorias."
        action={
          <Button
            type="button"
            onClick={openNewSupplierModal}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            Novo fornecedor
          </Button>
        }
      />

      <SupplierFormModal
        isOpen={isSupplierModalOpen}
        isEditing={Boolean(editingSupplierId)}
        formState={formState}
        onClose={closeSupplierModal}
        onSubmit={handleSubmit}
        onUpdateForm={updateForm}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Fornecedores ativos" value={String(activeSuppliers)} />
        <SummaryCard label="Inativos" value={String(inactiveSuppliers)} />
        <SummaryCard label="Produtos vinculados" value={String(linkedProducts)} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Lista de fornecedores
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Busque por nome, documento, representante ou cidade.
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
                placeholder="Buscar fornecedor"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | SupplierStatus)
              }
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Fornecedor</th>
                <th className="px-5 py-3 font-semibold">Contato</th>
                <th className="px-5 py-3 font-semibold">Representante</th>
                <th className="px-5 py-3 font-semibold">Produtos</th>
                <th className="px-5 py-3 font-semibold">Ultima compra</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="text-slate-700">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-950">{supplier.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {supplier.document || "Sem documento"}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="size-3" aria-hidden="true" />
                      {supplier.city || "Sem cidade"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="flex items-center gap-2 whitespace-nowrap">
                      <Mail className="size-4 text-slate-400" aria-hidden="true" />
                      {supplier.email || "Sem email"}
                    </p>
                    <p className="mt-2 flex items-center gap-2 whitespace-nowrap">
                      <Phone className="size-4 text-slate-400" aria-hidden="true" />
                      {supplier.phone || "Sem telefone"}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="flex items-center gap-2">
                      <UserRound className="size-4 text-slate-400" aria-hidden="true" />
                      {supplier.representative || "Sem representante"}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {supplier.linkedProducts}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {supplier.lastPurchase}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge
                      label={supplier.status === "active" ? "Ativo" : "Inativo"}
                      tone={supplier.status === "active" ? "success" : "warning"}
                    />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleEditSupplier(supplier)}
                      >
                        <Edit3 className="size-4" aria-hidden="true" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleToggleSupplier(supplier.id)}
                      >
                        <RotateCcw className="size-4" aria-hidden="true" />
                        {supplier.status === "active" ? "Inativar" : "Reativar"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function SupplierFormModal({
  isOpen,
  isEditing,
  formState,
  onClose,
  onSubmit,
  onUpdateForm,
}: {
  isOpen: boolean;
  isEditing: boolean;
  formState: SupplierFormState;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof SupplierFormState>(
    key: K,
    value: SupplierFormState[K],
  ) => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="supplier-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Truck className="size-5 text-emerald-600" />
            <div>
              <h2
                id="supplier-modal-title"
                className="text-base font-semibold text-slate-950"
              >
                {isEditing ? "Editar fornecedor" : "Novo fornecedor"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Informe dados comerciais e contatos para futuras compras.
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Fechar modal</span>
          </Button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid max-h-[calc(92vh-142px)] gap-3 overflow-y-auto px-5 py-5 md:grid-cols-2">
            <Field label="Nome / Razao social" className="md:col-span-2">
              <input
                value={formState.name}
                onChange={(event) => onUpdateForm("name", event.target.value)}
                placeholder="Ex.: Distribuidora Norte"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                autoFocus
              />
            </Field>

            <Field label="CNPJ / CPF">
              <input
                value={formState.document}
                onChange={(event) => onUpdateForm("document", event.target.value)}
                placeholder="00.000.000/0000-00"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="Cidade">
              <input
                value={formState.city}
                onChange={(event) => onUpdateForm("city", event.target.value)}
                placeholder="Cuiaba"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="E-mail">
              <input
                value={formState.email}
                onChange={(event) => onUpdateForm("email", event.target.value)}
                placeholder="comercial@fornecedor.com"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="Telefone">
              <input
                value={formState.phone}
                onChange={(event) => onUpdateForm("phone", event.target.value)}
                placeholder="(65) 3333-0000"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="Representante" className="md:col-span-2">
              <input
                value={formState.representative}
                onChange={(event) =>
                  onUpdateForm("representative", event.target.value)
                }
                placeholder="Nome do contato comercial"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="Observacoes" className="md:col-span-2">
              <textarea
                value={formState.observations}
                onChange={(event) =>
                  onUpdateForm("observations", event.target.value)
                }
                rows={3}
                placeholder="Condicoes comerciais, categorias atendidas ou observacoes internas"
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>
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
              {isEditing ? "Salvar alteracoes" : "Cadastrar fornecedor"}
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
