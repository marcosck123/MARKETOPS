import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "today" | "week" | "month";

type Summary = {
  totalSales: number;
  ticketMedio: number;
  qtdSales: number;
  totalDescontos: number;
};

type PaymentRow = { method: string; total: number };

type Dre = {
  receitaBruta: number;
  descontos: number;
  receitaLiquida: number;
  custoMercadorias: number;
  margemBruta: number;
};

type SessionRow = {
  id: string;
  cashRegisterName: string;
  operatorName: string;
  status: string;
  totalSales: number;
  openedAt: string;
  closedAt: string | null;
};

type Props = {
  period: Period;
  summary: Summary;
  paymentBreakdown: PaymentRow[];
  dre: Dre;
  sessions: SessionRow[];
  totalOpenSessions: number;
};

const periodLabels: Record<Period, string> = {
  today: "Hoje",
  week: "Semana",
  month: "Mes",
};

const methodLabels: Record<string, string> = {
  cash: "Dinheiro",
  pix: "PIX",
  debit: "Debito",
  credit: "Credito",
  store_credit: "Credito Loja",
};

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function fmtPct(value: number, base: number): string {
  if (base === 0) return "—";
  return ((value / base) * 100).toFixed(1) + "%";
}

export function FinanceContent({
  period,
  summary,
  paymentBreakdown,
  dre,
  sessions,
  totalOpenSessions,
}: Props) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Dashboard financeiro
          </p>
          <h1 className="mt-1 text-2xl font-bold text-stone-900">Financeiro</h1>
        </div>

        <div className="flex gap-1 rounded-lg border border-stone-200 bg-white p-1 shadow-sm">
          {(["today", "week", "month"] as Period[]).map((p) => (
            <Link
              key={p}
              href={`/admin/financeiro?period=${p}`}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition",
                period === p
                  ? "bg-stone-900 text-white"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-900",
              )}
            >
              {periodLabels[p]}
            </Link>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total de Vendas"
          value={fmt(summary.totalSales)}
          sub={`${summary.qtdSales} venda${summary.qtdSales !== 1 ? "s" : ""}`}
        />
        <SummaryCard
          label="Ticket Medio"
          value={fmt(summary.ticketMedio)}
          sub="por venda"
        />
        <SummaryCard
          label="Qtd Vendas"
          value={String(summary.qtdSales)}
          sub="no periodo"
        />
        <SummaryCard
          label="Total Descontos"
          value={fmt(summary.totalDescontos)}
          sub="concedido"
          negative
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment breakdown */}
        <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="text-base font-semibold text-stone-950">
              Por metodo de pagamento
            </h2>
          </div>
          <div className="overflow-x-auto">
            {paymentBreakdown.length === 0 ? (
              <p className="px-5 py-6 text-sm text-stone-400">
                Sem pagamentos no periodo.
              </p>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">
                      Metodo
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Total
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paymentBreakdown.map((row) => (
                    <tr key={row.method} className="text-stone-700">
                      <td className="px-5 py-3 font-medium">
                        {methodLabels[row.method] ?? row.method}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {fmt(row.total)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-stone-400">
                        {fmtPct(row.total, summary.totalSales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* DRE simplificado */}
        <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="text-base font-semibold text-stone-950">
              DRE simplificado
            </h2>
          </div>
          <table className="w-full border-collapse text-sm">
            <tbody className="divide-y divide-stone-100">
              <DreRow label="Receita Bruta" value={dre.receitaBruta} />
              <DreRow
                label="Descontos"
                value={-dre.descontos}
                negative={dre.descontos > 0}
              />
              <DreRow
                label="Receita Liquida"
                value={dre.receitaLiquida}
                bold
              />
              <DreRow
                label="Custo de Mercadorias"
                value={-dre.custoMercadorias}
                negative={dre.custoMercadorias > 0}
              />
              <DreRow
                label="Margem Bruta"
                value={dre.margemBruta}
                bold
                highlight
              />
              <tr>
                <td className="px-5 py-2 text-xs text-stone-400">
                  Margem %
                </td>
                <td className="px-5 py-2 text-right text-xs tabular-nums text-stone-400">
                  {fmtPct(dre.margemBruta, dre.receitaLiquida)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      {/* Sessions */}
      <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="text-base font-semibold text-stone-950">
            Sessoes de caixa
          </h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            {totalOpenSessions} abertas
          </span>
        </div>
        <div className="overflow-x-auto">
          {sessions.length === 0 ? (
            <p className="px-5 py-6 text-sm text-stone-400">
              Nenhuma sessao no periodo.
            </p>
          ) : (
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Caixa</th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Operador
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Abertura
                  </th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Total vendas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sessions.map((s) => (
                  <tr key={s.id} className="text-stone-700">
                    <td className="px-5 py-3 font-medium text-stone-900">
                      {s.cashRegisterName}
                    </td>
                    <td className="px-5 py-3">{s.operatorName}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          s.status === "open"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-stone-100 text-stone-500",
                        )}
                      >
                        {s.status === "open" ? "Aberta" : "Fechada"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      {fmtDate(s.openedAt)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold">
                      {fmt(s.totalSales)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  negative,
}: {
  label: string;
  value: string;
  sub: string;
  negative?: boolean;
}) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-bold",
          negative ? "text-red-600" : "text-stone-950",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-stone-400">{sub}</p>
    </article>
  );
}

function DreRow({
  label,
  value,
  bold,
  negative,
  highlight,
}: {
  label: string;
  value: number;
  bold?: boolean;
  negative?: boolean;
  highlight?: boolean;
}) {
  return (
    <tr
      className={cn(highlight && value >= 0 ? "bg-amber-50" : highlight && value < 0 ? "bg-red-50" : "")}
    >
      <td
        className={cn(
          "px-5 py-3 text-stone-700",
          bold && "font-semibold text-stone-900",
        )}
      >
        {label}
      </td>
      <td
        className={cn(
          "px-5 py-3 text-right tabular-nums",
          bold && "font-semibold",
          negative ? "text-red-600" : highlight && value >= 0 ? "text-amber-700" : "",
        )}
      >
        {fmt(Math.abs(value))}
        {negative && value !== 0 && (
          <TrendingDown className="ml-1 inline size-3" aria-hidden="true" />
        )}
        {highlight && value > 0 && (
          <TrendingUp className="ml-1 inline size-3 text-amber-600" aria-hidden="true" />
        )}
      </td>
    </tr>
  );
}
