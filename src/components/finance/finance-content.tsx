"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Landmark,
  Plus,
  RotateCcw,
  Save,
  Search,
  Wallet,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  type FinanceAccount,
  type FinanceEntry,
  type FinanceEntryStatus,
  type FinanceEntryType,
  financeAccountKindLabels,
  financeEntryTypeLabels,
  financeStatusLabels,
  initialFinanceAccounts,
  initialFinanceCategories,
  initialFinanceEntries,
} from "@/lib/finance-data";

type FinanceFormState = {
  type: FinanceEntryType;
  description: string;
  categoryId: string;
  accountId: string;
  party: string;
  amount: string;
  dueAt: string;
  paidAt: string;
  status: FinanceEntryStatus;
  notes: string;
};

const defaultFinanceForm: FinanceFormState = {
  type: "income",
  description: "",
  categoryId: "vendas-pdv",
  accountId: initialFinanceAccounts[0]?.id ?? "",
  party: "",
  amount: "",
  dueAt: "20/05/2026",
  paidAt: "",
  status: "scheduled",
  notes: "",
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

function getStatusTone(status: FinanceEntryStatus) {
  if (status === "paid") {
    return "success" as const;
  }

  if (status === "overdue") {
    return "danger" as const;
  }

  if (status === "canceled") {
    return "info" as const;
  }

  return "warning" as const;
}

function getTypeTone(type: FinanceEntryType) {
  if (type === "income") {
    return "success" as const;
  }

  if (type === "expense") {
    return "warning" as const;
  }

  return "info" as const;
}

function getSignedAmount(entry: FinanceEntry) {
  if (entry.status === "canceled") {
    return 0;
  }

  if (entry.type === "expense") {
    return -entry.amount;
  }

  return entry.amount;
}

function applyEntryToAccount(
  account: FinanceAccount,
  entry: FinanceEntry,
  direction: "apply" | "reverse",
) {
  const multiplier = direction === "apply" ? 1 : -1;
  const delta = getSignedAmount(entry) * multiplier;

  return {
    ...account,
    balance: account.balance + delta,
  };
}

function entryToForm(entry: FinanceEntry): FinanceFormState {
  return {
    type: entry.type,
    description: entry.description,
    categoryId: entry.categoryId,
    accountId: entry.accountId,
    party: entry.party,
    amount: String(entry.amount),
    dueAt: entry.dueAt,
    paidAt: entry.paidAt,
    status: entry.status,
    notes: entry.notes,
  };
}

export function FinanceContent() {
  const [accounts, setAccounts] =
    useState<FinanceAccount[]>(initialFinanceAccounts);
  const [entries, setEntries] = useState<FinanceEntry[]>(initialFinanceEntries);
  const [formState, setFormState] =
    useState<FinanceFormState>(defaultFinanceForm);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | FinanceEntryType>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | FinanceEntryStatus
  >("all");

  const accountById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
  );
  const categoryById = useMemo(
    () =>
      new Map(initialFinanceCategories.map((category) => [category.id, category])),
    [],
  );
  const categoriesForForm = useMemo(
    () =>
      initialFinanceCategories.filter(
        (category) => category.type === formState.type,
      ),
    [formState.type],
  );

  const filteredEntries = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return entries.filter((entry) => {
      const category = categoryById.get(entry.categoryId);
      const account = accountById.get(entry.accountId);
      const matchesSearch =
        !search ||
        entry.code.toLowerCase().includes(search) ||
        entry.description.toLowerCase().includes(search) ||
        entry.party.toLowerCase().includes(search) ||
        entry.source.toLowerCase().includes(search) ||
        category?.name.toLowerCase().includes(search) ||
        account?.name.toLowerCase().includes(search);
      const matchesType = typeFilter === "all" || entry.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || entry.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [accountById, categoryById, entries, searchTerm, statusFilter, typeFilter]);

  const totalBalance = accounts.reduce(
    (total, account) => total + account.balance,
    0,
  );
  const receivable = entries
    .filter(
      (entry) =>
        entry.type === "income" &&
        (entry.status === "scheduled" || entry.status === "overdue"),
    )
    .reduce((total, entry) => total + entry.amount, 0);
  const payable = entries
    .filter(
      (entry) =>
        entry.type === "expense" &&
        (entry.status === "scheduled" || entry.status === "overdue"),
    )
    .reduce((total, entry) => total + entry.amount, 0);
  const overdue = entries
    .filter((entry) => entry.status === "overdue")
    .reduce((total, entry) => total + entry.amount, 0);

  const categorySummary = initialFinanceCategories
    .map((category) => {
      const categoryEntries = entries.filter(
        (entry) => entry.categoryId === category.id && entry.status !== "canceled",
      );
      const total = categoryEntries.reduce((sum, entry) => sum + entry.amount, 0);

      return {
        ...category,
        total,
        count: categoryEntries.length,
      };
    })
    .filter((category) => category.count > 0);

  function updateForm<K extends keyof FinanceFormState>(
    key: K,
    value: FinanceFormState[K],
  ) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function handleTypeChange(type: FinanceEntryType) {
    const firstCategory =
      initialFinanceCategories.find((category) => category.type === type)?.id ??
      "";

    setFormState((current) => ({
      ...current,
      type,
      categoryId: firstCategory,
    }));
  }

  function openNewEntryModal() {
    setFormState(defaultFinanceForm);
    setEditingEntryId(null);
    setIsEntryModalOpen(true);
  }

  function openEditEntryModal(entry: FinanceEntry) {
    setFormState(entryToForm(entry));
    setEditingEntryId(entry.id);
    setIsEntryModalOpen(true);
  }

  function closeEntryModal() {
    setFormState(defaultFinanceForm);
    setEditingEntryId(null);
    setIsEntryModalOpen(false);
  }

  function handleSubmitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const description = formState.description.trim();
    const amount = parseNumber(formState.amount);

    if (!description || amount <= 0 || !formState.accountId || !formState.categoryId) {
      return;
    }

    const payload = {
      type: formState.type,
      description,
      categoryId: formState.categoryId,
      accountId: formState.accountId,
      party: formState.party.trim(),
      amount,
      dueAt: formState.dueAt,
      paidAt: formState.status === "paid" ? formState.paidAt || "20/05/2026" : "",
      status: formState.status,
      source: "Manual",
      notes: formState.notes.trim(),
    };

    if (editingEntryId) {
      const previousEntry = entries.find((entry) => entry.id === editingEntryId);

      setEntries((current) =>
        current.map((entry) =>
          entry.id === editingEntryId
            ? {
                ...entry,
                ...payload,
              }
            : entry,
        ),
      );

      if (previousEntry?.status === "paid") {
        setAccounts((current) =>
          current.map((account) =>
            account.id === previousEntry.accountId
              ? applyEntryToAccount(account, previousEntry, "reverse")
              : account,
          ),
        );
      }

      if (payload.status === "paid") {
        setAccounts((current) =>
          current.map((account) =>
            account.id === payload.accountId
              ? applyEntryToAccount(
                  account,
                  {
                    id: editingEntryId,
                    code: previousEntry?.code ?? "",
                    ...payload,
                  },
                  "apply",
                )
              : account,
          ),
        );
      }

      closeEntryModal();
      return;
    }

    const sequence = entries.length + 1001;
    const newEntry: FinanceEntry = {
      id: `fin-${sequence}`,
      code: `FIN-${sequence}`,
      ...payload,
    };

    setEntries((current) => [newEntry, ...current]);

    if (newEntry.status === "paid") {
      setAccounts((current) =>
        current.map((account) =>
          account.id === newEntry.accountId
            ? applyEntryToAccount(account, newEntry, "apply")
            : account,
        ),
      );
    }

    closeEntryModal();
  }

  function handleMarkPaid(entryId: string) {
    const entry = entries.find((currentEntry) => currentEntry.id === entryId);

    if (!entry || entry.status === "paid" || entry.status === "canceled") {
      return;
    }

    const paidEntry = {
      ...entry,
      status: "paid" as const,
      paidAt: "20/05/2026",
    };

    setEntries((current) =>
      current.map((currentEntry) =>
        currentEntry.id === entryId ? paidEntry : currentEntry,
      ),
    );
    setAccounts((current) =>
      current.map((account) =>
        account.id === paidEntry.accountId
          ? applyEntryToAccount(account, paidEntry, "apply")
          : account,
      ),
    );
  }

  function handleCancelEntry(entryId: string) {
    const entry = entries.find((currentEntry) => currentEntry.id === entryId);

    if (!entry || entry.status === "canceled") {
      return;
    }

    if (entry.status === "paid") {
      setAccounts((current) =>
        current.map((account) =>
          account.id === entry.accountId
            ? applyEntryToAccount(account, entry, "reverse")
            : account,
        ),
      );
    }

    setEntries((current) =>
      current.map((currentEntry) =>
        currentEntry.id === entryId
          ? {
              ...currentEntry,
              status: "canceled",
              notes: "Lancamento cancelado manualmente.",
            }
          : currentEntry,
      ),
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Gestao financeira"
        title="Financeiro"
        description="Controle contas a pagar, contas a receber, lancamentos manuais, categorias e fluxo de caixa inicial."
        action={
          <Button
            type="button"
            onClick={openNewEntryModal}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            Novo lancamento
          </Button>
        }
      />

      <FinanceEntryModal
        isOpen={isEntryModalOpen}
        isEditing={Boolean(editingEntryId)}
        formState={formState}
        accounts={accounts}
        categoriesForForm={categoriesForForm}
        onClose={closeEntryModal}
        onSubmit={handleSubmitEntry}
        onUpdateForm={updateForm}
        onTypeChange={handleTypeChange}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Saldo em contas" value={formatCurrency(totalBalance)} />
        <SummaryCard label="A receber" value={formatCurrency(receivable)} />
        <SummaryCard label="A pagar" value={formatCurrency(payable)} />
        <SummaryCard label="Vencido" value={formatCurrency(overdue)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Fluxo financeiro
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Filtre contas a pagar, receber e lancamentos manuais.
              </p>
            </div>

            <div className="grid gap-2 lg:grid-cols-[1fr_150px_150px]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar lancamento"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as "all" | FinanceEntryType)
                }
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">Todos tipos</option>
                {Object.entries(financeEntryTypeLabels).map(([type, label]) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | FinanceEntryStatus)
                }
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">Todos status</option>
                {Object.entries(financeStatusLabels).map(([status, label]) => (
                  <option key={status} value={status}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1160px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Lancamento</th>
                  <th className="px-5 py-3 font-semibold">Categoria</th>
                  <th className="px-5 py-3 font-semibold">Conta</th>
                  <th className="px-5 py-3 font-semibold">Vencimento</th>
                  <th className="px-5 py-3 font-semibold">Valor</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((entry) => {
                  const account = accountById.get(entry.accountId);
                  const category = categoryById.get(entry.categoryId);

                  return (
                    <tr key={entry.id} className="text-slate-700">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-950">
                          {entry.description}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {entry.code} | {entry.party || "Sem parte"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Origem: {entry.source}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge
                          label={category?.name ?? "Sem categoria"}
                          tone={getTypeTone(entry.type)}
                        />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {account?.name ?? "Conta removida"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <p>{entry.dueAt}</p>
                        {entry.paidAt ? (
                          <p className="mt-1 text-xs text-slate-500">
                            Pago em {entry.paidAt}
                          </p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-950">
                        <span
                          className={
                            entry.type === "expense"
                              ? "text-amber-700"
                              : "text-emerald-700"
                          }
                        >
                          {entry.type === "expense" ? "-" : "+"}
                          {formatCurrency(entry.amount)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge
                          label={financeStatusLabels[entry.status]}
                          tone={getStatusTone(entry.status)}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => openEditEntryModal(entry)}
                          >
                            <Wallet className="size-4" aria-hidden="true" />
                            Editar
                          </Button>
                          {entry.status !== "paid" &&
                          entry.status !== "canceled" ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleMarkPaid(entry.id)}
                            >
                              <CheckCircle2
                                className="size-4"
                                aria-hidden="true"
                              />
                              Baixar
                            </Button>
                          ) : null}
                          {entry.status !== "canceled" ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleCancelEntry(entry.id)}
                            >
                              <RotateCcw className="size-4" aria-hidden="true" />
                              Cancelar
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

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-950">
                Contas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Saldos operacionais do MVP.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-slate-950">{account.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {financeAccountKindLabels[account.kind]}
                    </p>
                  </div>
                  <p className="whitespace-nowrap font-semibold text-slate-950">
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-950">
                Categorias
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Totais agrupados por categoria.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {categorySummary.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-slate-950">{category.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {category.count} lancamentos
                    </p>
                  </div>
                  <StatusBadge
                    label={formatCurrency(category.total)}
                    tone={getTypeTone(category.type)}
                  />
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </>
  );
}

function FinanceEntryModal({
  isOpen,
  isEditing,
  formState,
  accounts,
  categoriesForForm,
  onClose,
  onSubmit,
  onUpdateForm,
  onTypeChange,
}: {
  isOpen: boolean;
  isEditing: boolean;
  formState: FinanceFormState;
  accounts: FinanceAccount[];
  categoriesForForm: typeof initialFinanceCategories;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof FinanceFormState>(
    key: K,
    value: FinanceFormState[K],
  ) => void;
  onTypeChange: (type: FinanceEntryType) => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="finance-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Landmark className="size-5 text-emerald-600" />
            <div>
              <h2
                id="finance-modal-title"
                className="text-base font-semibold text-slate-950"
              >
                {isEditing ? "Editar lancamento" : "Novo lancamento"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Informe tipo, categoria, conta e vencimento.
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
            <Field label="Tipo">
              <select
                value={formState.type}
                onChange={(event) =>
                  onTypeChange(event.target.value as FinanceEntryType)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                {Object.entries(financeEntryTypeLabels).map(([type, label]) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status">
              <select
                value={formState.status}
                onChange={(event) =>
                  onUpdateForm(
                    "status",
                    event.target.value as FinanceEntryStatus,
                  )
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                {Object.entries(financeStatusLabels).map(([status, label]) => (
                  <option key={status} value={status}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Descricao" className="md:col-span-2">
              <input
                value={formState.description}
                onChange={(event) =>
                  onUpdateForm("description", event.target.value)
                }
                placeholder="Ex.: pagamento fornecedor"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                autoFocus
              />
            </Field>

            <Field label="Categoria">
              <select
                value={formState.categoryId}
                onChange={(event) =>
                  onUpdateForm("categoryId", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                {categoriesForForm.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Conta">
              <select
                value={formState.accountId}
                onChange={(event) =>
                  onUpdateForm("accountId", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Parte">
              <input
                value={formState.party}
                onChange={(event) => onUpdateForm("party", event.target.value)}
                placeholder="Cliente, fornecedor ou destino"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="Valor">
              <div className="relative">
                {formState.type === "expense" ? (
                  <ArrowDown
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-amber-600"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowUp
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-emerald-600"
                    aria-hidden="true"
                  />
                )}
                <input
                  value={formState.amount}
                  onChange={(event) => onUpdateForm("amount", event.target.value)}
                  inputMode="decimal"
                  placeholder="0,00"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </Field>

            <Field label="Vencimento">
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  value={formState.dueAt}
                  onChange={(event) => onUpdateForm("dueAt", event.target.value)}
                  placeholder="20/05/2026"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </Field>

            <Field label="Pagamento">
              <input
                value={formState.paidAt}
                onChange={(event) => onUpdateForm("paidAt", event.target.value)}
                placeholder="20/05/2026"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="Observacoes" className="md:col-span-2">
              <textarea
                value={formState.notes}
                onChange={(event) => onUpdateForm("notes", event.target.value)}
                rows={3}
                placeholder="Detalhes internos, comprovante ou referencia"
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
              {isEditing ? "Salvar alteracoes" : "Cadastrar lancamento"}
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
