"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  Edit3,
  FileText,
  Plus,
  RotateCcw,
  Save,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  type CashMovement,
  type CashMovementType,
  type CashRegister,
  type CashRegisterStatus,
  type CashSession,
  cashMovementTypeLabels,
  cashRegisterStatusLabels,
  cashSessionStatusLabels,
  initialCashMovements,
  initialCashRegisters,
  initialCashSessions,
} from "@/lib/cash-data";

type CashRegisterFormState = {
  code: string;
  name: string;
  store: string;
  status: CashRegisterStatus;
};

type CashOperationType = "open" | "supply" | "withdrawal" | "close";

type CashOperationFormState = {
  registerId: string;
  sessionId: string;
  operator: string;
  amount: string;
  reason: string;
  responsible: string;
  notes: string;
};

const defaultRegisterForm: CashRegisterFormState = {
  code: "",
  name: "",
  store: "Loja matriz",
  status: "active",
};

const defaultOperationForm: CashOperationFormState = {
  registerId: "",
  sessionId: "",
  operator: "",
  amount: "",
  reason: "",
  responsible: "Gerente",
  notes: "",
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

function getMovementImpact(type: CashMovementType, amount: number) {
  if (type === "withdrawal") {
    return -amount;
  }

  if (type === "closing") {
    return 0;
  }

  return amount;
}

function calculateExpectedAmount(sessionId: string, movements: CashMovement[]) {
  return movements
    .filter((movement) => movement.sessionId === sessionId)
    .reduce(
      (total, movement) => total + getMovementImpact(movement.type, movement.amount),
      0,
    );
}

function cashRegisterToForm(
  cashRegister: CashRegister,
): CashRegisterFormState {
  return {
    code: cashRegister.code,
    name: cashRegister.name,
    store: cashRegister.store,
    status: cashRegister.status,
  };
}

function getOperationTitle(operationType: CashOperationType | null) {
  if (operationType === "open") {
    return "Abrir sessao";
  }

  if (operationType === "supply") {
    return "Registrar suprimento";
  }

  if (operationType === "withdrawal") {
    return "Registrar sangria";
  }

  return "Fechar sessao";
}

export function CashRegistersContent() {
  const [cashRegisters, setCashRegisters] =
    useState<CashRegister[]>(initialCashRegisters);
  const [cashSessions, setCashSessions] =
    useState<CashSession[]>(initialCashSessions);
  const [cashMovements, setCashMovements] =
    useState<CashMovement[]>(initialCashMovements);
  const [registerForm, setRegisterForm] =
    useState<CashRegisterFormState>(defaultRegisterForm);
  const [operationForm, setOperationForm] =
    useState<CashOperationFormState>(defaultOperationForm);
  const [editingRegisterId, setEditingRegisterId] = useState<string | null>(
    null,
  );
  const [operationType, setOperationType] =
    useState<CashOperationType | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CashRegisterStatus>(
    "all",
  );

  const sessionById = useMemo(
    () => new Map(cashSessions.map((session) => [session.id, session])),
    [cashSessions],
  );

  const registerById = useMemo(
    () => new Map(cashRegisters.map((register) => [register.id, register])),
    [cashRegisters],
  );

  const filteredRegisters = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return cashRegisters.filter((cashRegister) => {
      const matchesSearch =
        !search ||
        cashRegister.code.toLowerCase().includes(search) ||
        cashRegister.name.toLowerCase().includes(search) ||
        cashRegister.store.toLowerCase().includes(search);
      const matchesStatus =
        statusFilter === "all" || cashRegister.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cashRegisters, searchTerm, statusFilter]);

  const openSessions = cashSessions.filter(
    (session) => session.status === "open",
  );
  const closedSessions = cashSessions.filter(
    (session) => session.status === "closed",
  );
  const activeRegisters = cashRegisters.filter(
    (cashRegister) => cashRegister.status === "active",
  ).length;
  const expectedOpenAmount = openSessions.reduce(
    (total, session) =>
      total + calculateExpectedAmount(session.id, cashMovements),
    0,
  );
  const closedDifference = closedSessions.reduce(
    (total, session) => total + session.difference,
    0,
  );

  function updateRegisterForm<K extends keyof CashRegisterFormState>(
    key: K,
    value: CashRegisterFormState[K],
  ) {
    setRegisterForm((current) => ({ ...current, [key]: value }));
  }

  function updateOperationForm<K extends keyof CashOperationFormState>(
    key: K,
    value: CashOperationFormState[K],
  ) {
    setOperationForm((current) => ({ ...current, [key]: value }));
  }

  function openNewRegisterModal() {
    setRegisterForm(defaultRegisterForm);
    setEditingRegisterId(null);
    setIsRegisterModalOpen(true);
  }

  function closeRegisterModal() {
    setRegisterForm(defaultRegisterForm);
    setEditingRegisterId(null);
    setIsRegisterModalOpen(false);
  }

  function openEditRegisterModal(cashRegister: CashRegister) {
    setRegisterForm(cashRegisterToForm(cashRegister));
    setEditingRegisterId(cashRegister.id);
    setIsRegisterModalOpen(true);
  }

  function closeOperationModal() {
    setOperationForm(defaultOperationForm);
    setOperationType(null);
    setIsOperationModalOpen(false);
  }

  function openOperationModal(
    nextOperationType: CashOperationType,
    cashRegister: CashRegister,
  ) {
    const currentSession = cashRegister.currentSessionId
      ? sessionById.get(cashRegister.currentSessionId)
      : undefined;
    const expectedAmount = currentSession
      ? calculateExpectedAmount(currentSession.id, cashMovements)
      : 0;

    setOperationType(nextOperationType);
    setOperationForm({
      registerId: cashRegister.id,
      sessionId: currentSession?.id ?? "",
      operator: currentSession?.operator ?? "",
      amount:
        nextOperationType === "close" && expectedAmount > 0
          ? String(expectedAmount)
          : "",
      reason:
        nextOperationType === "open"
          ? "Abertura de sessao"
          : nextOperationType === "supply"
            ? "Suprimento de caixa"
            : nextOperationType === "withdrawal"
              ? "Sangria para cofre"
              : "Fechamento de sessao",
      responsible: currentSession?.operator ?? "Gerente",
      notes: currentSession?.notes ?? "",
    });
    setIsOperationModalOpen(true);
  }

  function handleSubmitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = registerForm.code.trim().toUpperCase();
    const name = registerForm.name.trim();

    if (!code || !name) {
      return;
    }

    const payload = {
      code,
      name,
      store: registerForm.store.trim() || "Loja matriz",
      status: registerForm.status,
    };

    if (editingRegisterId) {
      setCashRegisters((current) =>
        current.map((cashRegister) =>
          cashRegister.id === editingRegisterId
            ? {
                ...cashRegister,
                ...payload,
              }
            : cashRegister,
        ),
      );
      closeRegisterModal();
      return;
    }

    const baseId = normalizeId(code) || "caixa";
    const id = cashRegisters.some((cashRegister) => cashRegister.id === baseId)
      ? `${baseId}-${Date.now()}`
      : baseId;

    setCashRegisters((current) => [
      ...current,
      {
        id,
        ...payload,
        currentSessionId: "",
        lastClosedAt: "Sem fechamento",
      },
    ]);
    closeRegisterModal();
  }

  function handleToggleRegister(registerId: string) {
    setCashRegisters((current) =>
      current.map((cashRegister) =>
        cashRegister.id === registerId && !cashRegister.currentSessionId
          ? {
              ...cashRegister,
              status: cashRegister.status === "active" ? "inactive" : "active",
            }
          : cashRegister,
      ),
    );
  }

  function handleSubmitOperation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!operationType) {
      return;
    }

    const amount = parseNumber(operationForm.amount);
    const cashRegister = registerById.get(operationForm.registerId);

    if (!cashRegister || amount < 0) {
      return;
    }

    if (operationType === "open") {
      const operator = operationForm.operator.trim();

      if (!operator || cashRegister.currentSessionId) {
        return;
      }

      const sessionId = `sessao-${Date.now()}`;
      const openedAt = "20/05/2026 agora";

      setCashSessions((current) => [
        {
          id: sessionId,
          registerId: cashRegister.id,
          operator,
          openedAt,
          closedAt: "",
          openingAmount: amount,
          countedAmount: 0,
          expectedAmount: amount,
          difference: 0,
          status: "open",
          notes: operationForm.notes.trim(),
        },
        ...current,
      ]);
      setCashRegisters((current) =>
        current.map((currentRegister) =>
          currentRegister.id === cashRegister.id
            ? { ...currentRegister, currentSessionId: sessionId }
            : currentRegister,
        ),
      );
      setCashMovements((current) => [
        {
          id: `cash-mov-${Date.now()}`,
          sessionId,
          type: "opening",
          amount,
          reason: operationForm.reason.trim() || "Abertura de sessao",
          responsible: operator,
          createdAt: openedAt,
        },
        ...current,
      ]);
      closeOperationModal();
      return;
    }

    const session = sessionById.get(operationForm.sessionId);

    if (!session || session.status !== "open") {
      return;
    }

    if (operationType === "close") {
      const expectedAmount = calculateExpectedAmount(session.id, cashMovements);
      const difference = amount - expectedAmount;
      const closedAt = "20/05/2026 agora";

      setCashSessions((current) =>
        current.map((currentSession) =>
          currentSession.id === session.id
            ? {
                ...currentSession,
                closedAt,
                countedAmount: amount,
                expectedAmount,
                difference,
                status: "closed",
                notes: operationForm.notes.trim(),
              }
            : currentSession,
        ),
      );
      setCashRegisters((current) =>
        current.map((currentRegister) =>
          currentRegister.id === cashRegister.id
            ? {
                ...currentRegister,
                currentSessionId: "",
                lastClosedAt: closedAt,
              }
            : currentRegister,
        ),
      );
      setCashMovements((current) => [
        {
          id: `cash-mov-${Date.now()}`,
          sessionId: session.id,
          type: "closing",
          amount,
          reason: operationForm.reason.trim() || "Fechamento de sessao",
          responsible: operationForm.responsible.trim() || session.operator,
          createdAt: closedAt,
        },
        ...current,
      ]);
      closeOperationModal();
      return;
    }

    if (amount <= 0) {
      return;
    }

    const movementType: CashMovementType =
      operationType === "supply" ? "supply" : "withdrawal";
    const createdAt = "20/05/2026 agora";
    const expectedAmount =
      calculateExpectedAmount(session.id, cashMovements) +
      getMovementImpact(movementType, amount);

    setCashMovements((current) => [
      {
        id: `cash-mov-${Date.now()}`,
        sessionId: session.id,
        type: movementType,
        amount,
        reason: operationForm.reason.trim() || cashMovementTypeLabels[movementType],
        responsible: operationForm.responsible.trim() || session.operator,
        createdAt,
      },
      ...current,
    ]);
    setCashSessions((current) =>
      current.map((currentSession) =>
        currentSession.id === session.id
          ? { ...currentSession, expectedAmount }
          : currentSession,
      ),
    );
    closeOperationModal();
  }

  return (
    <>
      <PageHeader
        eyebrow="Operacao de caixa"
        title="Caixas"
        description="Gerencie caixas fisicos, abertura de sessao, suprimentos, sangrias e fechamento basico antes do PDV."
        action={
          <Button
            type="button"
            onClick={openNewRegisterModal}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            Novo caixa
          </Button>
        }
      />

      <CashRegisterFormModal
        isOpen={isRegisterModalOpen}
        isEditing={Boolean(editingRegisterId)}
        formState={registerForm}
        onClose={closeRegisterModal}
        onSubmit={handleSubmitRegister}
        onUpdateForm={updateRegisterForm}
      />

      <CashOperationModal
        isOpen={isOperationModalOpen}
        operationType={operationType}
        formState={operationForm}
        selectedRegister={registerById.get(operationForm.registerId)}
        selectedSession={sessionById.get(operationForm.sessionId)}
        expectedAmount={
          operationForm.sessionId
            ? calculateExpectedAmount(operationForm.sessionId, cashMovements)
            : 0
        }
        onClose={closeOperationModal}
        onSubmit={handleSubmitOperation}
        onUpdateForm={updateOperationForm}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Caixas ativos" value={String(activeRegisters)} />
        <SummaryCard label="Sessoes abertas" value={String(openSessions.length)} />
        <SummaryCard
          label="Saldo esperado"
          value={formatCurrency(expectedOpenAmount)}
        />
        <SummaryCard
          label="Diferenca fechada"
          value={formatCurrency(closedDifference)}
        />
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="text-sm font-semibold text-amber-900">
              Regra operacional
            </h2>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Um caixa precisa ter sessao aberta para receber suprimento,
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
              Controle disponibilidade, sessao atual e ultima conferencia.
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
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | CashRegisterStatus)
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
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Caixa</th>
                <th className="px-5 py-3 font-semibold">Loja</th>
                <th className="px-5 py-3 font-semibold">Sessao</th>
                <th className="px-5 py-3 font-semibold">Operador</th>
                <th className="px-5 py-3 font-semibold">Saldo esperado</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegisters.map((cashRegister) => {
                const currentSession = cashRegister.currentSessionId
                  ? sessionById.get(cashRegister.currentSessionId)
                  : undefined;
                const expectedAmount = currentSession
                  ? calculateExpectedAmount(currentSession.id, cashMovements)
                  : 0;
                const canOperate = cashRegister.status === "active";

                return (
                  <tr key={cashRegister.id} className="text-slate-700">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-950">
                        {cashRegister.code}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {cashRegister.name}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {cashRegister.store}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {currentSession ? (
                        <>
                          <StatusBadge label="Aberta" tone="success" />
                          <p className="mt-1 text-xs text-slate-500">
                            Desde {currentSession.openedAt}
                          </p>
                        </>
                      ) : (
                        <>
                          <StatusBadge label="Sem sessao" tone="info" />
                          <p className="mt-1 text-xs text-slate-500">
                            Ultimo fechamento {cashRegister.lastClosedAt}
                          </p>
                        </>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {currentSession ? currentSession.operator : "Sem operador"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatCurrency(expectedAmount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={cashRegisterStatusLabels[cashRegister.status]}
                        tone={
                          cashRegister.status === "active" ? "success" : "warning"
                        }
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openEditRegisterModal(cashRegister)}
                        >
                          <Edit3 className="size-4" aria-hidden="true" />
                          Editar
                        </Button>
                        {!currentSession ? (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!canOperate}
                            onClick={() => openOperationModal("open", cashRegister)}
                          >
                            <CheckCircle2 className="size-4" aria-hidden="true" />
                            Abrir
                          </Button>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                openOperationModal("supply", cashRegister)
                              }
                            >
                              <ArrowUp className="size-4" aria-hidden="true" />
                              Suprimento
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                openOperationModal("withdrawal", cashRegister)
                              }
                            >
                              <ArrowDown className="size-4" aria-hidden="true" />
                              Sangria
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                openOperationModal("close", cashRegister)
                              }
                            >
                              <Save className="size-4" aria-hidden="true" />
                              Fechar
                            </Button>
                          </>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          disabled={Boolean(currentSession)}
                          onClick={() => handleToggleRegister(cashRegister.id)}
                        >
                          <RotateCcw className="size-4" aria-hidden="true" />
                          {cashRegister.status === "active"
                            ? "Inativar"
                            : "Reativar"}
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

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            Sessoes de caixa
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Relatorio basico por caixa, operador, valores e diferencas.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Periodo</th>
                <th className="px-5 py-3 font-semibold">Caixa</th>
                <th className="px-5 py-3 font-semibold">Operador</th>
                <th className="px-5 py-3 font-semibold">Inicial</th>
                <th className="px-5 py-3 font-semibold">Esperado</th>
                <th className="px-5 py-3 font-semibold">Contado</th>
                <th className="px-5 py-3 font-semibold">Diferenca</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cashSessions.map((session) => {
                const cashRegister = registerById.get(session.registerId);
                const expectedAmount =
                  session.status === "open"
                    ? calculateExpectedAmount(session.id, cashMovements)
                    : session.expectedAmount;

                return (
                  <tr key={session.id} className="text-slate-700">
                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 whitespace-nowrap">
                        <CalendarDays
                          className="size-4 text-slate-400"
                          aria-hidden="true"
                        />
                        {session.openedAt}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {session.closedAt || "Em andamento"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {cashRegister?.code ?? "Caixa removido"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="inline-flex items-center gap-2">
                        <UserRound
                          className="size-4 text-slate-400"
                          aria-hidden="true"
                        />
                        {session.operator}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatCurrency(session.openingAmount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatCurrency(expectedAmount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {session.status === "closed"
                        ? formatCurrency(session.countedAmount)
                        : "Nao contado"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={formatCurrency(session.difference)}
                        tone={
                          session.difference === 0
                            ? "success"
                            : session.difference > 0
                              ? "info"
                              : "warning"
                        }
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={cashSessionStatusLabels[session.status]}
                        tone={session.status === "open" ? "success" : "info"}
                      />
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
            Movimentos recentes
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Aberturas, suprimentos, sangrias, vendas simuladas e fechamentos.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Data</th>
                <th className="px-5 py-3 font-semibold">Caixa</th>
                <th className="px-5 py-3 font-semibold">Tipo</th>
                <th className="px-5 py-3 font-semibold">Valor</th>
                <th className="px-5 py-3 font-semibold">Responsavel</th>
                <th className="px-5 py-3 font-semibold">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cashMovements.map((movement) => {
                const session = sessionById.get(movement.sessionId);
                const cashRegister = session
                  ? registerById.get(session.registerId)
                  : undefined;
                const impact = getMovementImpact(movement.type, movement.amount);

                return (
                  <tr key={movement.id} className="text-slate-700">
                    <td className="whitespace-nowrap px-5 py-4">
                      {movement.createdAt}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {cashRegister?.code ?? "Caixa removido"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {cashMovementTypeLabels[movement.type]}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={formatCurrency(movement.amount)}
                        tone={
                          impact < 0
                            ? "warning"
                            : movement.type === "closing"
                              ? "info"
                              : "success"
                        }
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {movement.responsible}
                    </td>
                    <td className="min-w-64 px-5 py-4 text-slate-500">
                      {movement.reason}
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

function CashRegisterFormModal({
  isOpen,
  isEditing,
  formState,
  onClose,
  onSubmit,
  onUpdateForm,
}: {
  isOpen: boolean;
  isEditing: boolean;
  formState: CashRegisterFormState;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof CashRegisterFormState>(
    key: K,
    value: CashRegisterFormState[K],
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
      aria-labelledby="cash-register-modal-title"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <BadgeDollarSign className="size-5 text-emerald-600" />
            <div>
              <h2
                id="cash-register-modal-title"
                className="text-base font-semibold text-slate-950"
              >
                {isEditing ? "Editar caixa" : "Novo caixa"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Cadastre um ponto fisico de atendimento.
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
            <Field label="Codigo">
              <input
                value={formState.code}
                onChange={(event) => onUpdateForm("code", event.target.value)}
                placeholder="CX-03"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm uppercase outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                autoFocus
              />
            </Field>

            <Field label="Status">
              <select
                value={formState.status}
                onChange={(event) =>
                  onUpdateForm("status", event.target.value as CashRegisterStatus)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </Field>

            <Field label="Nome" className="md:col-span-2">
              <input
                value={formState.name}
                onChange={(event) => onUpdateForm("name", event.target.value)}
                placeholder="Caixa frente 3"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="Loja" className="md:col-span-2">
              <input
                value={formState.store}
                onChange={(event) => onUpdateForm("store", event.target.value)}
                placeholder="Loja matriz"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
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
              {isEditing ? "Salvar alteracoes" : "Cadastrar caixa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CashOperationModal({
  isOpen,
  operationType,
  formState,
  selectedRegister,
  selectedSession,
  expectedAmount,
  onClose,
  onSubmit,
  onUpdateForm,
}: {
  isOpen: boolean;
  operationType: CashOperationType | null;
  formState: CashOperationFormState;
  selectedRegister?: CashRegister;
  selectedSession?: CashSession;
  expectedAmount: number;
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
    operationType === "close"
      ? "Valor contado"
      : operationType === "open"
        ? "Valor inicial"
        : "Valor";
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
                {selectedRegister?.code ?? "Caixa"} |{" "}
                {selectedRegister?.name ?? "Nao selecionado"}
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
            <Field label="Operador" className={isOpenOperation ? "" : "md:col-span-2"}>
              <input
                value={formState.operator}
                onChange={(event) => onUpdateForm("operator", event.target.value)}
                placeholder="Nome do operador"
                disabled={!isOpenOperation}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                autoFocus={isOpenOperation}
              />
            </Field>

            {isOpenOperation ? null : (
              <Field label="Responsavel">
                <input
                  value={formState.responsible}
                  onChange={(event) =>
                    onUpdateForm("responsible", event.target.value)
                  }
                  placeholder="Gerente"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </Field>
            )}

            <Field label={amountLabel}>
              <input
                value={formState.amount}
                onChange={(event) => onUpdateForm("amount", event.target.value)}
                inputMode="decimal"
                placeholder="0,00"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                autoFocus={!isOpenOperation}
              />
            </Field>

            <Field label="Motivo">
              <input
                value={formState.reason}
                onChange={(event) => onUpdateForm("reason", event.target.value)}
                placeholder="Motivo da operacao"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="Observacoes" className="md:col-span-2">
              <textarea
                value={formState.notes}
                onChange={(event) => onUpdateForm("notes", event.target.value)}
                rows={3}
                placeholder="Conferencia, observacoes de fechamento ou detalhe interno"
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <p className="text-sm font-medium text-slate-950">
                Saldo esperado: {formatCurrency(expectedAmount)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Sessao: {selectedSession?.id ?? "sera criada ao salvar"}
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
