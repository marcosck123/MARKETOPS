"use client";

import { type FormEvent, useState } from "react";
import { Pencil, Plus, Search, UserCheck, UserX } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  createCustomer,
  toggleCustomerStatus,
  updateCustomer,
  type CustomerRow,
} from "@/lib/actions/customers";

type Props = {
  customers: CustomerRow[];
};

type FormState = {
  type: "cpf" | "cnpj";
  document: string;
  name: string;
  tradeName: string;
  email: string;
  phone: string;
};

const defaultForm: FormState = {
  type: "cpf",
  document: "",
  name: "",
  tradeName: "",
  email: "",
  phone: "",
};

function formatDocument(type: "cpf" | "cnpj", doc: string): string {
  const d = doc.replace(/\D/g, "");
  if (type === "cpf" && d.length === 11) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }
  if (type === "cnpj" && d.length === 14) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  }
  return doc;
}

export function CustomersContent({ customers: propCustomers }: Props) {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerRow[]>(propCustomers);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.document.includes(q.replace(/\D/g, ""))
    );
  });

  function openCreate() {
    setForm(defaultForm);
    setEditingId(null);
    setError("");
    setModalOpen(true);
  }

  function openEdit(customer: CustomerRow) {
    setForm({
      type: customer.type,
      document: customer.document,
      name: customer.name,
      tradeName: customer.tradeName ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
    });
    setEditingId(customer.id);
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = editingId
      ? await updateCustomer(editingId, form)
      : await createCustomer(form);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setModalOpen(false);

    if (!editingId && "data" in result && result.data) {
      const newRow: CustomerRow = {
        id: (result.data as { id: string }).id,
        type: form.type,
        document: form.document.replace(/\D/g, ""),
        name: form.name.trim(),
        tradeName: form.tradeName.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        active: true,
      };
      setCustomers((prev) => [...prev, newRow]);
    } else {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: form.name.trim(),
                tradeName: form.tradeName.trim() || null,
                email: form.email.trim() || null,
                phone: form.phone.trim() || null,
              }
            : c,
        ),
      );
    }

    router.refresh();
  }

  async function handleToggle(customer: CustomerRow) {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customer.id ? { ...c, active: !c.active } : c)),
    );
    await toggleCustomerStatus(customer.id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cadastro de clientes PF e PJ para emissão de NF-e
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
        >
          <Plus className="size-4" aria-hidden="true" />
          Novo cliente
        </Button>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Buscar por nome ou documento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Documento</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  {customers.length === 0
                    ? "Nenhum cliente cadastrado."
                    : "Nenhum resultado para a busca."}
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-600">
                      {customer.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">
                    {formatDocument(customer.type, customer.document)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{customer.name}</p>
                    {customer.tradeName && (
                      <p className="text-xs text-slate-400">{customer.tradeName}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {customer.email ?? customer.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void handleToggle(customer)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                        customer.active
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {customer.active ? (
                        <UserCheck className="size-3" aria-hidden="true" />
                      ) : (
                        <UserX className="size-3" aria-hidden="true" />
                      )}
                      {customer.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(customer)}
                      className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      title="Editar"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                {editingId ? "Editar cliente" : "Novo cliente"}
              </h2>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 px-6 py-5">
              {!editingId && (
                <div className="flex gap-2">
                  {(["cpf", "cnpj"] as const).map((t) => (
                    <label
                      key={t}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50"
                    >
                      <input
                        type="radio"
                        name="type"
                        value={t}
                        checked={form.type === t}
                        onChange={() => setForm((c) => ({ ...c, type: t }))}
                        className="accent-emerald-500"
                      />
                      <span className="text-sm font-semibold uppercase">{t}</span>
                    </label>
                  ))}
                </div>
              )}

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">
                  {form.type === "cpf" ? "CPF (11 dígitos)" : "CNPJ (14 dígitos)"}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  disabled={!!editingId}
                  value={form.document}
                  onChange={(e) => setForm((c) => ({ ...c, document: e.target.value }))}
                  placeholder={form.type === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">
                  {form.type === "cpf" ? "Nome" : "Razão Social"}
                </span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </label>

              {form.type === "cnpj" && (
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">
                    Nome Fantasia
                  </span>
                  <input
                    type="text"
                    value={form.tradeName}
                    onChange={(e) => setForm((c) => ({ ...c, tradeName: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </label>
              )}

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">E-mail</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Telefone</span>
                  <input
                    type="text"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </label>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  {loading ? "Salvando..." : editingId ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
