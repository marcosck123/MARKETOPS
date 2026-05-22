"use client";

import { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CheckCircle2,
  CreditCard,
  FileText,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  type PaymentMethodConfig,
  type PaymentTransaction,
  type PaymentTransactionStatus,
  initialPaymentMethods,
  initialPaymentTransactions,
  paymentStatusLabels,
} from "@/lib/payment-data";
import {
  type PaymentMethod,
  paymentMethodLabels,
} from "@/lib/sale-data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getStatusTone(status: PaymentTransactionStatus) {
  if (status === "reconciled" || status === "approved") {
    return "success" as const;
  }

  if (status === "failed" || status === "refunded") {
    return "danger" as const;
  }

  return "warning" as const;
}

function getMethodTone(method: PaymentMethod) {
  if (method === "cash" || method === "pix") {
    return "success" as const;
  }

  if (method === "store_credit") {
    return "warning" as const;
  }

  return "info" as const;
}

export function PaymentsContent() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(
    initialPaymentTransactions,
  );
  const [methods, setMethods] =
    useState<PaymentMethodConfig[]>(initialPaymentMethods);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<"all" | PaymentMethod>(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | PaymentTransactionStatus
  >("all");

  const filteredTransactions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !search ||
        transaction.saleCode.toLowerCase().includes(search) ||
        transaction.customerName.toLowerCase().includes(search) ||
        transaction.authorizationCode.toLowerCase().includes(search);
      const matchesMethod =
        methodFilter === "all" || transaction.method === methodFilter;
      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [methodFilter, searchTerm, statusFilter, transactions]);

  const grossApproved = transactions
    .filter(
      (transaction) =>
        transaction.status === "approved" ||
        transaction.status === "reconciled",
    )
    .reduce((total, transaction) => total + transaction.grossAmount, 0);
  const netApproved = transactions
    .filter(
      (transaction) =>
        transaction.status === "approved" ||
        transaction.status === "reconciled",
    )
    .reduce((total, transaction) => total + transaction.netAmount, 0);
  const pendingAmount = transactions
    .filter((transaction) => transaction.status === "pending")
    .reduce((total, transaction) => total + transaction.grossAmount, 0);
  const reconciledCount = transactions.filter(
    (transaction) => transaction.status === "reconciled",
  ).length;

  function handleApprove(transactionId: string) {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === transactionId && transaction.status === "pending"
          ? {
              ...transaction,
              status: "approved",
              notes: "Pagamento aprovado manualmente.",
            }
          : transaction,
      ),
    );
  }

  function handleReconcile(transactionId: string) {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === transactionId && transaction.status === "approved"
          ? {
              ...transaction,
              status: "reconciled",
              reconciledAt: "20/05/2026 agora",
              notes: "Conciliado com extrato financeiro.",
            }
          : transaction,
      ),
    );
  }

  function handleRefund(transactionId: string) {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === transactionId &&
        (transaction.status === "approved" ||
          transaction.status === "reconciled")
          ? {
              ...transaction,
              status: "refunded",
              notes: "Estorno simulado registrado.",
            }
          : transaction,
      ),
    );
  }

  function handleRetry(transactionId: string) {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === transactionId && transaction.status === "failed"
          ? {
              ...transaction,
              status: "pending",
              authorizationCode: `${transaction.authorizationCode}-R1`,
              notes: "Reprocessamento enviado ao provedor.",
            }
          : transaction,
      ),
    );
  }

  function handleToggleMethod(methodId: string) {
    setMethods((current) =>
      current.map((method) =>
        method.id === methodId
          ? {
              ...method,
              enabled: !method.enabled,
            }
          : method,
      ),
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Controle financeiro"
        title="Pagamentos"
        description="Acompanhe pagamentos capturados no PDV, taxas, liquido estimado, conciliacao e estornos simulados antes das integracoes reais."
        action={<StatusBadge label="Simulado" tone="info" />}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Bruto aprovado" value={formatCurrency(grossApproved)} />
        <SummaryCard label="Liquido previsto" value={formatCurrency(netApproved)} />
        <SummaryCard label="Pendente" value={formatCurrency(pendingAmount)} />
        <SummaryCard label="Conciliados" value={String(reconciledCount)} />
      </section>

      <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-blue-700" />
          <div>
            <h2 className="text-sm font-semibold text-blue-900">
              Sem integracao TEF por enquanto
            </h2>
            <p className="mt-1 text-sm leading-6 text-blue-800">
              Este modulo prepara a regra e a operacao. PIX automatico, TEF,
              adquirentes e baixa bancaria entram depois da validacao do fluxo.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Transacoes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Consulte por venda, cliente, autorizacao, metodo e status.
            </p>
          </div>

          <div className="grid gap-2 lg:grid-cols-[1fr_160px_160px]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar transacao"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={methodFilter}
              onChange={(event) =>
                setMethodFilter(event.target.value as "all" | PaymentMethod)
              }
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Todos metodos</option>
              {Object.entries(paymentMethodLabels).map(([method, label]) => (
                <option key={method} value={method}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "all" | PaymentTransactionStatus,
                )
              }
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Todos status</option>
              {Object.entries(paymentStatusLabels).map(([status, label]) => (
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
                <th className="px-5 py-3 font-semibold">Venda</th>
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Metodo</th>
                <th className="px-5 py-3 font-semibold">Bruto</th>
                <th className="px-5 py-3 font-semibold">Taxa</th>
                <th className="px-5 py-3 font-semibold">Liquido</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="text-slate-700">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-950">
                      {transaction.saleCode}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {transaction.capturedAt}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {transaction.authorizationCode}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {transaction.customerName}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge
                      label={paymentMethodLabels[transaction.method]}
                      tone={getMethodTone(transaction.method)}
                    />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {formatCurrency(transaction.grossAmount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {formatCurrency(transaction.feeAmount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-950">
                    {formatCurrency(transaction.netAmount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge
                      label={paymentStatusLabels[transaction.status]}
                      tone={getStatusTone(transaction.status)}
                    />
                    {transaction.reconciledAt ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {transaction.reconciledAt}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {transaction.status === "pending" ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleApprove(transaction.id)}
                        >
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                          Aprovar
                        </Button>
                      ) : null}
                      {transaction.status === "approved" ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleReconcile(transaction.id)}
                        >
                          <ShieldCheck className="size-4" aria-hidden="true" />
                          Conciliar
                        </Button>
                      ) : null}
                      {transaction.status === "approved" ||
                      transaction.status === "reconciled" ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRefund(transaction.id)}
                        >
                          <RotateCcw className="size-4" aria-hidden="true" />
                          Estornar
                        </Button>
                      ) : null}
                      {transaction.status === "failed" ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRetry(transaction.id)}
                        >
                          <RefreshCcw className="size-4" aria-hidden="true" />
                          Reprocessar
                        </Button>
                      ) : null}
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
            Metodos de pagamento
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Configure disponibilidade, provedor, prazo e taxa estimada.
          </p>
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-5">
          {methods.map((method) => (
            <article
              key={method.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{method.label}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {method.provider}
                  </p>
                </div>
                <CreditCard className="size-5 shrink-0 text-emerald-600" />
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Prazo D+{method.settlementDays}</p>
                <p>Taxa {method.feePercent}%</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleToggleMethod(method.id)}
                className="mt-4 w-full"
              >
                <BadgeDollarSign className="size-4" aria-hidden="true" />
                {method.enabled ? "Desativar" : "Ativar"}
              </Button>
            </article>
          ))}
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
