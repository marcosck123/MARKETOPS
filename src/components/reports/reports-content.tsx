"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileBarChart2 } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SaleRow = {
  id: string;
  code: string;
  finishedAt: string;
  operatorName: string;
  cashRegisterName: string;
  itemsCount: number;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethods: string[];
};

type Props = {
  period: string;
  dateFrom?: string;
  dateTo?: string;
  sales: SaleRow[];
};

const periodLabels: Record<string, string> = {
  today: "Hoje",
  week: "Semana",
  month: "Mes",
  custom: "Personalizado",
};

const methodLabels: Record<string, string> = {
  cash: "Dinheiro",
  pix: "PIX",
  debit: "Debito",
  credit: "Credito",
  store_credit: "Cred. Loja",
};

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function generateCsv(sales: SaleRow[]): string {
  const bom = "﻿";
  const header =
    "Codigo,Data,Operador,Caixa,Itens,Subtotal,Desconto,Total,Pagamentos";
  const rows = sales.map((s) => {
    const cols = [
      s.code,
      fmtDate(s.finishedAt),
      s.operatorName,
      s.cashRegisterName,
      String(s.itemsCount),
      s.subtotal.toFixed(2).replace(".", ","),
      s.discount.toFixed(2).replace(".", ","),
      s.total.toFixed(2).replace(".", ","),
      s.paymentMethods.map((m) => methodLabels[m] ?? m).join(";"),
    ];
    return cols.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");
  });
  return bom + [header, ...rows].join("\n");
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ReportsContent({ period, dateFrom, dateTo, sales }: Props) {
  const router = useRouter();
  const [from, setFrom] = useState(dateFrom ?? "");
  const [to, setTo] = useState(dateTo ?? "");

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalDiscount = sales.reduce((sum, s) => sum + s.discount, 0);

  function handleExportCsv() {
    const today = new Date().toISOString().slice(0, 10);
    const csv = generateCsv(sales);
    downloadCsv(csv, `relatorio-vendas-${today}.csv`);
  }

  function handleCustomFilter() {
    if (!from || !to) return;
    router.push(
      `/admin/relatorios?period=custom&dateFrom=${from}&dateTo=${to}`,
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Financeiro"
        title="Relatorios"
        description="Exportar e consultar historico de vendas por periodo."
        action={
          <Button
            type="button"
            onClick={handleExportCsv}
            disabled={sales.length === 0}
            className="bg-amber-400 text-stone-950 hover:bg-amber-300 disabled:opacity-50"
          >
            <Download className="size-4" aria-hidden="true" />
            Exportar CSV
          </Button>
        }
      />

      {/* Period filter */}
      <section className="flex flex-wrap items-end gap-3">
        <div className="flex gap-1 rounded-lg border border-stone-200 bg-white p-1 shadow-sm">
          {(["today", "week", "month", "custom"] as const).map((p) => (
            <Link
              key={p}
              href={
                p === "custom"
                  ? `/admin/relatorios?period=custom${from ? `&dateFrom=${from}` : ""}${to ? `&dateTo=${to}` : ""}`
                  : `/admin/relatorios?period=${p}`
              }
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

        {(period === "custom" || from || to) && (
          <div className="flex flex-wrap items-end gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-500">
                De
              </span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-500">
                Ate
              </span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-9 rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </label>
            <Button
              type="button"
              onClick={handleCustomFilter}
              disabled={!from || !to}
              className="bg-stone-800 text-white hover:bg-stone-700 disabled:opacity-50"
            >
              Filtrar
            </Button>
          </div>
        )}
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Vendas</p>
          <p className="mt-2 text-2xl font-bold text-stone-950">
            {sales.length}
          </p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Receita Total</p>
          <p className="mt-2 text-2xl font-bold text-stone-950">
            {fmt(totalRevenue)}
          </p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Total Descontos</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {fmt(totalDiscount)}
          </p>
        </article>
      </section>

      {/* Table */}
      <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileBarChart2
              className="size-4 text-stone-400"
              aria-hidden="true"
            />
            <h2 className="text-base font-semibold text-stone-950">
              Tabela de vendas
            </h2>
          </div>
          <p className="text-sm text-stone-500">{sales.length} registro(s)</p>
        </div>

        <div className="overflow-x-auto">
          {sales.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-stone-400">
              Nenhuma venda no periodo selecionado.
            </p>
          ) : (
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Codigo</th>
                  <th className="px-5 py-3 font-semibold">Data</th>
                  <th className="px-5 py-3 font-semibold">Operador</th>
                  <th className="px-5 py-3 font-semibold">Caixa</th>
                  <th className="px-5 py-3 text-right font-semibold">Itens</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Subtotal
                  </th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Desconto
                  </th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Pagamentos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sales.map((s) => (
                  <tr key={s.id} className="text-stone-700">
                    <td className="whitespace-nowrap px-5 py-2.5 font-mono text-xs font-semibold text-stone-900">
                      {s.code}
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-stone-500">
                      {fmtDate(s.finishedAt)}
                    </td>
                    <td className="px-5 py-2.5">{s.operatorName}</td>
                    <td className="whitespace-nowrap px-5 py-2.5">
                      {s.cashRegisterName}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums">
                      {s.itemsCount}
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right tabular-nums">
                      {fmt(s.subtotal)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right tabular-nums text-red-500">
                      {s.discount > 0 ? `- ${fmt(s.discount)}` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right font-semibold tabular-nums">
                      {fmt(s.total)}
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {s.paymentMethods.map((m) => (
                          <span
                            key={m}
                            className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-600"
                          >
                            {methodLabels[m] ?? m}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
