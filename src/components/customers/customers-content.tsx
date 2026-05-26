"use client";

import { type FormEvent, useState } from "react";
import { MapPin, Pencil, Plus, Search, UserCheck, UserX, X } from "lucide-react";
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
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  noComplement: boolean;
  district: string;
  city: string;
  state: string;
  ie: string;
  ieIsento: boolean;
};

const defaultForm: FormState = {
  type: "cpf",
  document: "",
  name: "",
  tradeName: "",
  email: "",
  phone: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  noComplement: false,
  district: "",
  city: "",
  state: "",
  ie: "",
  ieIsento: false,
};

const BR_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];

function formatDocument(type: "cpf" | "cnpj", doc: string): string {
  const d = doc.replace(/\D/g, "");
  if (type === "cpf" && d.length === 11)
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
  if (type === "cnpj" && d.length === 14)
    return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
  return doc;
}

function formatZip(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 8);
  if (d.length > 5) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return d;
}

const INPUT = "h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:bg-stone-50 disabled:text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-amber-400 dark:disabled:bg-stone-900 dark:disabled:text-stone-600";
const LABEL = "mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400";
const SECTION_TITLE = "mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400";

export function CustomersContent({ customers: propCustomers }: Props) {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerRow[]>(propCustomers);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
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

  function openEdit(c: CustomerRow) {
    const ieIsento = c.ie === "ISENTO";
    setForm({
      type: c.type,
      document: c.document,
      name: c.name,
      tradeName: c.tradeName ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      zipCode: c.zipCode ?? "",
      street: c.street ?? "",
      number: c.number ?? "",
      complement: ieIsento ? "" : (c.complement ?? ""),
      noComplement: !c.complement && !ieIsento,
      district: c.district ?? "",
      city: c.city ?? "",
      state: c.state ?? "",
      ie: ieIsento ? "" : (c.ie ?? ""),
      ieIsento,
    });
    setEditingId(c.id);
    setError("");
    setModalOpen(true);
  }

  async function fetchCep() {
    const digits = form.zipCode.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json() as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };
      if (!data.erro) {
        setForm((f) => ({
          ...f,
          street: data.logradouro || f.street,
          district: data.bairro || f.district,
          city: data.localidade || f.city,
          state: data.uf || f.state,
        }));
      }
    } catch {
      // silently ignore CEP lookup errors
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      type: form.type,
      document: form.document,
      name: form.name,
      tradeName: form.tradeName || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      zipCode: form.zipCode || undefined,
      street: form.street || undefined,
      number: form.number || undefined,
      complement: form.noComplement ? undefined : (form.complement || undefined),
      district: form.district || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      ie: form.ieIsento ? "ISENTO" : (form.ie || undefined),
    };

    const result = editingId
      ? await updateCustomer(editingId, payload)
      : await createCustomer(payload);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setModalOpen(false);

    const addressSnap = {
      zipCode: form.zipCode || null,
      street: form.street || null,
      number: form.number || null,
      complement: form.noComplement ? null : (form.complement || null),
      district: form.district || null,
      city: form.city || null,
      state: form.state || null,
      ie: form.ieIsento ? "ISENTO" : (form.ie || null),
    };

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
        ...addressSnap,
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
                ...addressSnap,
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
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Clientes</h1>
          <p className="mt-1 text-sm text-stone-500">
            Cadastro de clientes PF e PJ para emissão de NF-e
          </p>
        </div>
        <Button onClick={openCreate} className="bg-amber-400 text-stone-950 hover:bg-amber-300">
          <Plus className="size-4" aria-hidden="true" />
          Novo cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
        <input
          type="text"
          placeholder="Buscar por nome ou documento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-4 text-sm text-stone-800 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50 text-left text-xs font-medium uppercase tracking-wide text-stone-500 dark:border-stone-700 dark:bg-stone-900">
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Documento</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-stone-400">
                  {customers.length === 0 ? "Nenhum cliente cadastrado." : "Nenhum resultado para a busca."}
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-stone-50 dark:hover:bg-stone-700/50">
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-semibold uppercase text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                      {customer.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-700 dark:text-stone-300">
                    {formatDocument(customer.type, customer.document)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900 dark:text-stone-100">{customer.name}</p>
                    {customer.tradeName && (
                      <p className="text-xs text-stone-400">{customer.tradeName}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    <p>{customer.email ?? "—"}</p>
                    {customer.phone && <p className="text-xs text-stone-400">{customer.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {customer.city
                      ? `${customer.city}${customer.state ? ` / ${customer.state}` : ""}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void handleToggle(customer)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                        customer.active
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-400"
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
                      className="rounded-md p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-700"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-950/70 p-4 py-10">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-stone-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-700">
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                {editingId ? "Editar cliente" : "Novo cliente"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)}>
              <div className="space-y-7 px-6 py-6">

                {/* Tipo de pessoa */}
                {!editingId && (
                  <div>
                    <p className={SECTION_TITLE}>Tipo de pessoa</p>
                    <div className="flex gap-2">
                      {(["cpf", "cnpj"] as const).map((t) => (
                        <label
                          key={t}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-4 py-2.5 transition hover:border-amber-400 has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50 dark:border-stone-700 dark:has-[:checked]:bg-amber-950/40"
                        >
                          <input
                            type="radio"
                            name="type"
                            value={t}
                            checked={form.type === t}
                            onChange={() => setForm((c) => ({ ...c, type: t, document: "" }))}
                            className="accent-amber-400"
                          />
                          <span className="text-sm font-bold uppercase text-stone-700 dark:text-stone-300">{t}</span>
                          <span className="text-xs text-stone-400">
                            {t === "cpf" ? "Pessoa Física" : "Pessoa Jurídica"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Identificação */}
                <div>
                  <p className={SECTION_TITLE}>Identificação</p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className={LABEL}>{form.type === "cpf" ? "CPF *" : "CNPJ *"}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        disabled={!!editingId}
                        value={form.document}
                        onChange={(e) => setForm((c) => ({ ...c, document: e.target.value }))}
                        placeholder={form.type === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
                        className={INPUT}
                      />
                    </label>
                    <label className="block">
                      <span className={LABEL}>{form.type === "cpf" ? "Nome completo *" : "Razão social *"}</span>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                        className={INPUT}
                      />
                    </label>
                    {form.type === "cnpj" && (
                      <label className="col-span-2 block">
                        <span className={LABEL}>Nome fantasia</span>
                        <input
                          type="text"
                          value={form.tradeName}
                          onChange={(e) => setForm((c) => ({ ...c, tradeName: e.target.value }))}
                          className={INPUT}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Contato */}
                <div>
                  <p className={SECTION_TITLE}>Contato</p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className={LABEL}>E-mail</span>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                        placeholder="contato@empresa.com.br"
                        className={INPUT}
                      />
                    </label>
                    <label className="block">
                      <span className={LABEL}>Telefone / WhatsApp</span>
                      <input
                        type="text"
                        inputMode="tel"
                        value={form.phone}
                        onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))}
                        placeholder="(00) 00000-0000"
                        className={INPUT}
                      />
                    </label>
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <p className={SECTION_TITLE}>Endereço</p>
                  <div className="grid grid-cols-3 gap-3">
                    {/* CEP + UF */}
                    <label className="col-span-2 block">
                      <span className={LABEL}>CEP</span>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={form.zipCode}
                          onChange={(e) => setForm((c) => ({ ...c, zipCode: formatZip(e.target.value) }))}
                          onBlur={() => void fetchCep()}
                          placeholder="00000-000"
                          maxLength={9}
                          className={`${INPUT} pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => void fetchCep()}
                          disabled={cepLoading}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-stone-400 transition hover:text-amber-600 disabled:opacity-40"
                          title="Buscar endereço pelo CEP"
                        >
                          <MapPin className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </label>
                    <label className="block">
                      <span className={LABEL}>UF</span>
                      <select
                        value={form.state}
                        onChange={(e) => setForm((c) => ({ ...c, state: e.target.value }))}
                        className={INPUT}
                      >
                        <option value="">—</option>
                        {BR_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </label>

                    {/* Rua + Número */}
                    <label className="col-span-2 block">
                      <span className={LABEL}>Logradouro / Rua</span>
                      <input
                        type="text"
                        value={form.street}
                        onChange={(e) => setForm((c) => ({ ...c, street: e.target.value }))}
                        placeholder="Ex.: Rua das Flores"
                        className={INPUT}
                      />
                    </label>
                    <label className="block">
                      <span className={LABEL}>Número</span>
                      <input
                        type="text"
                        value={form.number}
                        onChange={(e) => setForm((c) => ({ ...c, number: e.target.value }))}
                        placeholder="142"
                        className={INPUT}
                      />
                    </label>

                    {/* Bairro + Cidade */}
                    <label className="block">
                      <span className={LABEL}>Bairro</span>
                      <input
                        type="text"
                        value={form.district}
                        onChange={(e) => setForm((c) => ({ ...c, district: e.target.value }))}
                        className={INPUT}
                      />
                    </label>
                    <label className="col-span-2 block">
                      <span className={LABEL}>Cidade</span>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm((c) => ({ ...c, city: e.target.value }))}
                        className={INPUT}
                      />
                    </label>

                    {/* Complemento + checkbox */}
                    <label className="col-span-2 block">
                      <span className={LABEL}>Complemento</span>
                      <input
                        type="text"
                        value={form.complement}
                        disabled={form.noComplement}
                        onChange={(e) => setForm((c) => ({ ...c, complement: e.target.value }))}
                        placeholder="Apto, sala, bloco..."
                        className={INPUT}
                      />
                    </label>
                    <div className="flex items-end">
                      <label className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-3 py-2.5 transition hover:bg-stone-50 has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50 dark:border-stone-700 dark:hover:bg-stone-800 dark:has-[:checked]:bg-amber-950/40">
                        <input
                          type="checkbox"
                          checked={form.noComplement}
                          onChange={(e) =>
                            setForm((c) => ({
                              ...c,
                              noComplement: e.target.checked,
                              complement: e.target.checked ? "" : c.complement,
                            }))
                          }
                          className="accent-amber-400"
                        />
                        <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Sem complemento</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Fiscal — CNPJ only */}
                {form.type === "cnpj" && (
                  <div>
                    <p className={SECTION_TITLE}>Fiscal</p>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className={LABEL}>Inscrição Estadual (IE)</span>
                        <input
                          type="text"
                          value={form.ieIsento ? "ISENTO" : form.ie}
                          disabled={form.ieIsento}
                          onChange={(e) => setForm((c) => ({ ...c, ie: e.target.value }))}
                          placeholder="000.000.000.000"
                          className={INPUT}
                        />
                      </label>
                      <div className="flex items-end">
                        <label className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-3 py-2.5 transition hover:bg-stone-50 has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50 dark:border-stone-700 dark:hover:bg-stone-800 dark:has-[:checked]:bg-amber-950/40">
                          <input
                            type="checkbox"
                            checked={form.ieIsento}
                            onChange={(e) =>
                              setForm((c) => ({
                                ...c,
                                ieIsento: e.target.checked,
                                ie: e.target.checked ? "" : c.ie,
                              }))
                            }
                            className="accent-amber-400"
                          />
                          <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Contribuinte isento</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    {error}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-2 border-t border-stone-200 px-6 py-4 dark:border-stone-700">
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
                  className="flex-1 bg-amber-400 text-stone-950 hover:bg-amber-300 disabled:opacity-50"
                >
                  {loading ? "Salvando..." : editingId ? "Salvar alterações" : "Criar cliente"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
