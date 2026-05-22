"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  type Customer,
  type CustomerKind,
  type CustomerStatus,
  customerKindLabels,
  initialCustomers,
} from "@/lib/customer-data";

type CustomerFormState = {
  name: string;
  document: string;
  kind: CustomerKind;
  email: string;
  phone: string;
  city: string;
  address: string;
  creditLimit: string;
  currentBalance: string;
  observations: string;
};

const defaultCustomerForm: CustomerFormState = {
  name: "",
  document: "",
  kind: "pf",
  email: "",
  phone: "",
  city: "",
  address: "",
  creditLimit: "",
  currentBalance: "",
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

function customerToForm(customer: Customer): CustomerFormState {
  return {
    name: customer.name,
    document: customer.document,
    kind: customer.kind,
    email: customer.email,
    phone: customer.phone,
    city: customer.city,
    address: customer.address,
    creditLimit: String(customer.creditLimit),
    currentBalance: String(customer.currentBalance),
    observations: customer.observations,
  };
}

export function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [formState, setFormState] =
    useState<CustomerFormState>(defaultCustomerForm);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(
    null,
  );
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | CustomerKind>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CustomerStatus>(
    "all",
  );

  const filteredCustomers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !search ||
        customer.name.toLowerCase().includes(search) ||
        customer.document.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.city.toLowerCase().includes(search);
      const matchesKind = kindFilter === "all" || customer.kind === kindFilter;
      const matchesStatus =
        statusFilter === "all" || customer.status === statusFilter;

      return matchesSearch && matchesKind && matchesStatus;
    });
  }, [customers, kindFilter, searchTerm, statusFilter]);

  const activeCustomers = customers.filter(
    (customer) => customer.status === "active",
  ).length;
  const inactiveCustomers = customers.length - activeCustomers;
  const totalCreditLimit = customers.reduce(
    (total, customer) => total + customer.creditLimit,
    0,
  );
  const openBalance = customers.reduce(
    (total, customer) => total + customer.currentBalance,
    0,
  );

  function updateForm<K extends keyof CustomerFormState>(
    key: K,
    value: CustomerFormState[K],
  ) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function openNewCustomerModal() {
    setFormState(defaultCustomerForm);
    setEditingCustomerId(null);
    setIsCustomerModalOpen(true);
  }

  function closeCustomerModal() {
    setFormState(defaultCustomerForm);
    setEditingCustomerId(null);
    setIsCustomerModalOpen(false);
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
      kind: formState.kind,
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      city: formState.city.trim(),
      address: formState.address.trim(),
      creditLimit: parseNumber(formState.creditLimit),
      currentBalance: parseNumber(formState.currentBalance),
      observations: formState.observations.trim(),
    };

    if (editingCustomerId) {
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === editingCustomerId
            ? {
                ...customer,
                ...payload,
              }
            : customer,
        ),
      );
      closeCustomerModal();
      return;
    }

    const baseId = normalizeId(name) || "cliente";
    const id = customers.some((customer) => customer.id === baseId)
      ? `${baseId}-${Date.now()}`
      : baseId;

    setCustomers((current) => [
      ...current,
      {
        id,
        ...payload,
        purchasesCount: 0,
        lastPurchase: "Sem compras",
        status: "active",
      },
    ]);
    closeCustomerModal();
  }

  function handleEditCustomer(customer: Customer) {
    setEditingCustomerId(customer.id);
    setFormState(customerToForm(customer));
    setIsCustomerModalOpen(true);
  }

  function handleToggleCustomer(customerId: string) {
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              status: customer.status === "active" ? "inactive" : "active",
            }
          : customer,
      ),
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Cadastro operacional"
        title="Clientes"
        description="Cadastre clientes finais e empresas compradoras para preparar vendas, fiado controlado, limites e historico comercial."
        action={
          <Button
            type="button"
            onClick={openNewCustomerModal}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            Novo cliente
          </Button>
        }
      />

      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        isEditing={Boolean(editingCustomerId)}
        formState={formState}
        onClose={closeCustomerModal}
        onSubmit={handleSubmit}
        onUpdateForm={updateForm}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Clientes ativos" value={String(activeCustomers)} />
        <SummaryCard label="Inativos" value={String(inactiveCustomers)} />
        <SummaryCard
          label="Limite concedido"
          value={formatCurrency(totalCreditLimit)}
        />
        <SummaryCard label="Saldo aberto" value={formatCurrency(openBalance)} />
      </section>

      <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <ShoppingCart className="mt-0.5 size-5 shrink-0 text-blue-700" />
          <div>
            <h2 className="text-sm font-semibold text-blue-900">
              Base para vendas
            </h2>
            <p className="mt-1 text-sm leading-6 text-blue-800">
              Clientes cadastrados aqui poderao ser vinculados ao motor de venda,
              ao PDV e aos controles financeiros nas proximas etapas.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Lista de clientes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Busque por nome, documento, e-mail ou cidade.
            </p>
          </div>

          <div className="grid gap-2 lg:grid-cols-[1fr_160px_150px]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar cliente"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={kindFilter}
              onChange={(event) =>
                setKindFilter(event.target.value as "all" | CustomerKind)
              }
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Todos tipos</option>
              <option value="pf">Pessoa fisica</option>
              <option value="pj">Pessoa juridica</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | CustomerStatus)
              }
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Todos status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Contato</th>
                <th className="px-5 py-3 font-semibold">Limite</th>
                <th className="px-5 py-3 font-semibold">Saldo aberto</th>
                <th className="px-5 py-3 font-semibold">Historico</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => {
                const availableCredit = Math.max(
                  0,
                  customer.creditLimit - customer.currentBalance,
                );

                return (
                  <tr key={customer.id} className="text-slate-700">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-950">
                        {customer.name}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <UserRound className="size-3" aria-hidden="true" />
                        {customer.document || "Sem documento"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {customerKindLabels[customer.kind]}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 whitespace-nowrap">
                        <Mail className="size-4 text-slate-400" aria-hidden="true" />
                        {customer.email || "Sem email"}
                      </p>
                      <p className="mt-2 flex items-center gap-2 whitespace-nowrap">
                        <Phone className="size-4 text-slate-400" aria-hidden="true" />
                        {customer.phone || "Sem telefone"}
                      </p>
                      <p className="mt-2 flex items-center gap-2 whitespace-nowrap text-slate-500">
                        <MapPin className="size-4 text-slate-400" aria-hidden="true" />
                        {customer.city || "Sem cidade"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <p>{formatCurrency(customer.creditLimit)}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Disponivel {formatCurrency(availableCredit)}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={formatCurrency(customer.currentBalance)}
                        tone={customer.currentBalance > 0 ? "warning" : "success"}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <p>{customer.purchasesCount} compras</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ultima: {customer.lastPurchase}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={customer.status === "active" ? "Ativo" : "Inativo"}
                        tone={customer.status === "active" ? "success" : "warning"}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit3 className="size-4" aria-hidden="true" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleToggleCustomer(customer.id)}
                        >
                          <RotateCcw className="size-4" aria-hidden="true" />
                          {customer.status === "active" ? "Inativar" : "Reativar"}
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

function CustomerFormModal({
  isOpen,
  isEditing,
  formState,
  onClose,
  onSubmit,
  onUpdateForm,
}: {
  isOpen: boolean;
  isEditing: boolean;
  formState: CustomerFormState;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof CustomerFormState>(
    key: K,
    value: CustomerFormState[K],
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
      aria-labelledby="customer-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <UserRound className="size-5 text-emerald-600" />
            <div>
              <h2
                id="customer-modal-title"
                className="text-base font-semibold text-slate-950"
              >
                {isEditing ? "Editar cliente" : "Novo cliente"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Informe dados de contato, perfil comercial e limite inicial.
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
                placeholder="Ex.: Mercado Sao Lucas"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                autoFocus
              />
            </Field>

            <Field label="Tipo">
              <select
                value={formState.kind}
                onChange={(event) =>
                  onUpdateForm("kind", event.target.value as CustomerKind)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                <option value="pf">Pessoa fisica</option>
                <option value="pj">Pessoa juridica</option>
              </select>
            </Field>

            <Field label="CPF / CNPJ">
              <input
                value={formState.document}
                onChange={(event) => onUpdateForm("document", event.target.value)}
                placeholder="000.000.000-00"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="E-mail">
              <input
                value={formState.email}
                onChange={(event) => onUpdateForm("email", event.target.value)}
                placeholder="cliente@email.com"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="Telefone">
              <input
                value={formState.phone}
                onChange={(event) => onUpdateForm("phone", event.target.value)}
                placeholder="(65) 99999-0000"
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

            <Field label="Endereco">
              <input
                value={formState.address}
                onChange={(event) => onUpdateForm("address", event.target.value)}
                placeholder="Rua, bairro ou referencia"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="Limite de credito">
              <div className="relative">
                <BadgeDollarSign
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  value={formState.creditLimit}
                  onChange={(event) =>
                    onUpdateForm("creditLimit", event.target.value)
                  }
                  inputMode="decimal"
                  placeholder="0,00"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </Field>

            <Field label="Saldo aberto">
              <input
                value={formState.currentBalance}
                onChange={(event) =>
                  onUpdateForm("currentBalance", event.target.value)
                }
                inputMode="decimal"
                placeholder="0,00"
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
                placeholder="Perfil de compra, condicoes comerciais ou observacoes internas"
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
              {isEditing ? "Salvar alteracoes" : "Cadastrar cliente"}
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
