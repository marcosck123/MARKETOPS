"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  FileText,
  Save,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  closeCashRegister,
  openCashRegister,
} from "@/lib/actions/cash-registers";

type CashRegisterData = {
  id: string;
  name: string;
  status: "open" | "closed";
  openedAt: string | null;
  closedAt: string | null;
  openingBalance: number;
  closingBalance: number | null;
};

type CashOperationType = "open" | "close";

type CashOperationFormState = {
  registerId: string;
  operator: string;
  amount: string;
  notes: string;
};

const defaultOperationForm: CashOperationFormState = {
  registerId: "",
  operator: "",
  amount: "",
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

function getOperationTitle(operationType: CashOperationType | null) {
  return operationType === "open" ? "Abrir caixa" : "Fechar caixa";
}

export function CashRegistersContent({
  registers,
}: {
  registers: CashRegisterData[];
}) {
  const router = useRouter();
  const [operationForm, setOperationForm] =
    useState<CashOperationFormState>(defaultOperationForm);
  const [operationType, setOperationType] =
    useState<CashOperationType | null>(null);
  const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const registerById = useMemo(
    () => new Map(registers.map((r) => [r.id, r])),
    [registers],
  );

  const filteredRegisters = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return registers.filter((r) => {
      const matchesSearch =
        !search || r.name.toLowerCase().includes(search);
      const matchesStatus =
        statusFilter === "all" || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [registers, searchTerm, statusFilter]);

  const openRegisters = registers.filter((r) => r.status === "open");
  const totalOpenBalance = openRegisters.reduce(
    (total, r) => total + r.openingBalance,
    0,
  );

  function updateOperationForm<K extends keyof CashOperationFormState>(
    key: K,
    value: CashOperationFormState[K],
  ) {
    setOperationForm((current) => ({ ...current, [key]: value }));
  }

  function closeOperationModal() {
    setOperationForm(defaultOperationForm);
    setOperationType(null);
    setIsOperationModalOpen(false);
  }

  function openOperationModal(
    nextOperationType: CashOperationType,
    register: CashRegisterData,
  ) {
    setOperationType(nextOperationType);
    setOperationForm({
      registerId: register.id,
      operator: "",
      amount: nextOperationType === "close" && register.closingBalance != null
        ? String(register.openingBalance)
        : "",
      notes: "",
    });
    setIsOperationModalOpen(true);
  }

  async function handleSubmitOperation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = parseNumber(operationForm.amount);

    if (!operationType || !operationForm.registerId || amount < 0) return;

    let result;
    if (operationType === "open") {
      result = await openCashRegister(operationForm.registerId, amount);
    } else {
      result = await closeCashRegister(operationForm.registerId, amount);
    }

    if (result.success) {
      router.refresh();
      closeOperationModal();
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Operacao de caixa"
        title="Caixas"
        description="Gerencie caixas fisicos, abertura de sessao e fechamento basico antes do PDV."
        action={
          <StatusBadge label="Banco real" tone="info" />
        }
      />

      <CashOperationModal
        isOpen={isOperationModalOpen}
        operationType={operationType}
        formState={operationForm}
        selectedRegister={registerById.get(operationForm.registerId)}
        onClose={closeOperationModal}
        onSubmit={handleSubmitOperation}
        onUpdateForm={updateOperationForm}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Caixas cadastrados" value={String(registers.length)} />
        <SummaryCard label="Caixas abertos" value={String(openRegisters.length)} />
        <SummaryCard
          label="Saldo total aberto"
          value={formatCurrency(totalOpenBalance)}
        />
        <SummaryCard label="Caixas fechados" value={String(registers.length - openRegisters.length)} />
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="text-sm font-semibold text-amber-900">
              Regra operacional
            </h2>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Um caixa precisa estar aberto para receber suprimento,
              sangria e fechamento. O PDV futuramente deve registrar vendas
              dentro da sessao aberta.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Caixas fisicos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Controle disponibilidade e sessao atual.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_150px]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar caixa"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Todos</option>
              <option value="open">Abertos</option>
              <option value="closed">Fechados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Caixa</th>
                <th className="px-5 py-3 font-semibold">Sessao</th>
                <th className="px-5 py-3 font-semibold">Saldo inicial</th>
                <th className="px-5 py-3 font-semibold">Saldo fechamento</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegisters.map((register) => (
                <tr key={register.id} className="text-slate-700">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-950">{register.name}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {register.status === "open" ? (
                      <>
                        <StatusBadge label="Aberta" tone="success" />
                        <p className="mt-1 text-xs text-slate-500">
                          Desde {register.openedAt ?? "—"}
                        </p>
                      </>
                    ) : (
                      <>
                        <StatusBadge label="Fechada" tone="info" />
                        {register.closedAt && (
                          <p className="mt-1 text-xs text-slate-500">
                            Fechado {register.closedAt}
                          </p>
                        )}
                      </>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {register.status === "open"
                      ? formatCurrency(register.openingBalance)
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {register.closingBalance != null
                      ? formatCurrency(register.closingBalance)
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge
                      label={register.status === "open" ? "Aberto" : "Fechado"}
                      tone={register.status === "open" ? "success" : "warning"}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {register.status === "closed" ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openOperationModal("open", register)}
                        >
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                          Abrir
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openOperationModal("close", register)}
                        >
                          <Save className="size-4" aria-hidden="true" />
                          Fechar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            Historico de sessoes
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Relatorio basico por caixa, valores e status.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Periodo</th>
                <th className="px-5 py-3 font-semibold">Caixa</th>
                <th className="px-5 py-3 font-semibold">Saldo inicial</th>
                <th className="px-5 py-3 font-semibold">Saldo fechamento</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registers.filter((r) => r.openedAt).map((register) => (
                <tr key={register.id} className="text-slate-700">
                  <td className="px-5 py-4">
                    <p className="flex items-center gap-2 whitespace-nowrap">
                      <CalendarDays
                        className="size-4 text-slate-400"
                        aria-hidden="true"
                      />
                      {register.openedAt}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {register.closedAt ?? "Em andamento"}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="inline-flex items-center gap-2">
                      <UserRound
                        className="size-4 text-slate-400"
                        aria-hidden="true"
                      />
                      {register.name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {formatCurrency(register.openingBalance)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {register.closingBalance != null
                      ? formatCurrency(register.closingBalance)
                      : "Nao contado"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge
                      label={register.status === "open" ? "Aberto" : "Fechado"}
                      tone={register.status === "open" ? "success" : "info"}
                    />
                  </td>
                </tr>
              ))}
              {registers.filter((r) => r.openedAt).length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-sm text-slate-500"
                  >
                    Nenhuma sessao registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function CashOperationModal({
  isOpen,
  operationType,
  formState,
  selectedRegister,
  onClose,
  onSubmit,
  onUpdateForm,
}: {
  isOpen: boolean;
  operationType: CashOperationType | null;
  formState: CashOperationFormState;
  selectedRegister?: CashRegisterData;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof CashOperationFormState>(
    key: K,
    value: CashOperationFormState[K],
  ) => void;
}) {
  if (!isOpen || !operationType) {
    return null;
  }

  const amountLabel =
    operationType === "close" ? "Valor contado" : "Valor inicial";
  const isOpenOperation = operationType === "open";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cash-operation-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <BadgeDollarSign className="size-5 text-emerald-600" />
            <div>
              <h2
                id="cash-operation-modal-title"
                className="text-base font-semibold text-slate-950"
              >
                {getOperationTitle(operationType)}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedRegister?.name ?? "Caixa nao selecionado"}
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
            {isOpenOperation && (
              <Field label="Operador" className="md:col-span-2">
                <input
                  value={formState.operator}
                  onChange={(event) =>
                    onUpdateForm("operator", event.target.value)
                  }
                  placeholder="Nome do operador"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  autoFocus
                />
              </Field>
            )}

            <Field label={amountLabel} className={isOpenOperation ? "" : "md:col-span-2"}>
              <input
                value={formState.amount}
                onChange={(event) => onUpdateForm("amount", event.target.value)}
                inputMode="decimal"
                placeholder="0,00"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                autoFocus={!isOpenOperation}
              />
            </Field>

            <Field label="Observacoes" className="md:col-span-2">
              <textarea
                value={formState.notes}
                onChange={(event) => onUpdateForm("notes", event.target.value)}
                rows={3}
                placeholder="Observacoes de abertura ou fechamento"
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            {selectedRegister && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                <p className="text-sm font-medium text-slate-950">
                  {isOpenOperation
                    ? "Informe o saldo inicial para abertura."
                    : `Saldo inicial: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedRegister.openingBalance)}`}
                </p>
              </div>
            )}
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
              Salvar operacao
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
