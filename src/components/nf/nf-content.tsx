"use client";
import { useState } from "react";
import { FileText, Printer, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { FiscalRequestRow } from "@/lib/actions/fiscal-requests";

type StatusFilter = "all" | "pending" | "completed" | "cancelled";

type Props = { requests: FiscalRequestRow[] };

function formatDocument(doc: string): string {
  const d = doc.replace(/\D/g, "");
  if (d.length === 11) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
  if (d.length === 14) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
  return doc;
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

function openDanfePrint(req: FiscalRequestRow) {
  const w = window.open("", "_blank");
  if (!w) return;
  const keyFormatted = (req.nfeKey ?? "").replace(/(\d{4})/g, "$1 ").trim();
  const docFormatted = formatDocument(req.document);
  w.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>DANFE — ${req.nfeNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #000; padding: 24px; max-width: 780px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border: 2px solid #000; padding: 12px; margin-bottom: 8px; }
    .company { font-size: 16px; font-weight: bold; }
    .subtitle { font-size: 9px; color: #555; margin-top: 2px; }
    .danfe-title { text-align: right; }
    .danfe-title h1 { font-size: 13px; font-weight: bold; }
    .danfe-title p { font-size: 9px; color: #555; }
    .section { border: 1px solid #000; margin-bottom: 6px; }
    .section-header { background: #eee; padding: 4px 8px; font-weight: bold; font-size: 10px; border-bottom: 1px solid #000; }
    .section-body { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
    .field { padding: 6px 8px; border-right: 1px solid #ccc; }
    .field:last-child { border-right: none; }
    .field-label { font-size: 8px; color: #555; text-transform: uppercase; letter-spacing: 0.5px; }
    .field-value { font-size: 12px; font-weight: bold; margin-top: 2px; }
    .key-box { border: 1px solid #000; padding: 8px; margin-bottom: 6px; }
    .key-box .label { font-size: 9px; color: #555; text-transform: uppercase; margin-bottom: 4px; }
    .key-box .value { font-family: monospace; font-size: 10px; letter-spacing: 1.5px; word-break: break-all; background: #f5f5f5; padding: 4px; }
    .status-box { text-align: center; padding: 10px; border: 2px dashed #aaa; margin-bottom: 6px; font-size: 10px; color: #555; }
    .footer { font-size: 9px; color: #555; text-align: center; border-top: 1px dashed #ccc; padding-top: 8px; margin-top: 12px; }
    .print-btn { display: block; margin: 16px auto; padding: 8px 24px; background: #222; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">MARKETOPS COMERCIO LTDA</div>
      <div class="subtitle">Documento Auxiliar da Nota Fiscal Eletrônica</div>
      <div class="subtitle">Homologação — não possui validade fiscal</div>
    </div>
    <div class="danfe-title">
      <h1>DANFE</h1>
      <p>Nº ${req.nfeNumber ?? "—"}</p>
      <p>Série 1</p>
    </div>
  </div>

  <div class="key-box">
    <div class="label">Chave de Acesso (44 dígitos)</div>
    <div class="value">${keyFormatted || "—"}</div>
  </div>

  <div class="section">
    <div class="section-header">Destinatário</div>
    <div class="section-body">
      <div class="field">
        <div class="field-label">CPF / CNPJ</div>
        <div class="field-value">${docFormatted}</div>
      </div>
      <div class="field">
        <div class="field-label">Nome / Razão Social</div>
        <div class="field-value">${req.customerName ?? "Não informado"}</div>
      </div>
      <div class="field">
        <div class="field-label">Venda</div>
        <div class="field-value">${req.saleCode}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-header">Emissão</div>
    <div class="section-body">
      <div class="field">
        <div class="field-label">Data / Hora Emissão</div>
        <div class="field-value">${formatDate(req.createdAt)}</div>
      </div>
      <div class="field">
        <div class="field-label">Número NF-e</div>
        <div class="field-value">${req.nfeNumber ?? "—"}</div>
      </div>
      <div class="field">
        <div class="field-label">Status</div>
        <div class="field-value">Homologação</div>
      </div>
    </div>
  </div>

  <div class="status-box">
    ⚠ Este documento é uma simulação para fins de desenvolvimento.<br>
    Não possui validade fiscal. Integração com SEFAZ pendente.
  </div>

  <div class="footer">MARKETOPS — Sistema de Gestão Empresarial</div>
  <button class="print-btn" onclick="window.print()">🖨 Imprimir</button>
</body>
</html>`);
  w.document.close();
}

const STATUS_CONFIG = {
  pending:   { label: "Pendente",   bg: "rgba(239,159,39,0.1)",  color: "#B45309", icon: Clock },
  processing:{ label: "Processando",bg: "rgba(59,130,246,0.1)",  color: "#1D4ED8", icon: Clock },
  completed: { label: "Emitida",    bg: "rgba(59,109,17,0.08)", color: "#3B6D11", icon: CheckCircle2 },
  cancelled: { label: "Cancelada",  bg: "rgba(239,68,68,0.08)", color: "#DC2626", icon: XCircle },
} as const;

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all",       label: "Todas" },
  { key: "pending",   label: "Pendentes" },
  { key: "completed", label: "Emitidas" },
  { key: "cancelled", label: "Canceladas" },
];

export function NfContent({ requests }: Props) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = requests.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.saleCode.toLowerCase().includes(q) ||
        r.document.includes(q) ||
        (r.customerName ?? "").toLowerCase().includes(q) ||
        (r.nfeNumber ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    pending:   requests.filter((r) => r.status === "pending").length,
    completed: requests.filter((r) => r.status === "completed").length,
    cancelled: requests.filter((r) => r.status === "cancelled").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Histórico de NF-e</h1>
        <p className="mt-1 text-sm text-stone-500">
          Todas as solicitações de Nota Fiscal — {requests.length} no total
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pendentes", value: counts.pending, color: "#B45309", bg: "rgba(239,159,39,0.08)" },
          { label: "Emitidas",  value: counts.completed, color: "#3B6D11", bg: "rgba(59,109,17,0.08)" },
          { label: "Canceladas",value: counts.cancelled, color: "#DC2626", bg: "rgba(239,68,68,0.06)" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-stone-500">{label}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === key
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Buscar venda, documento, cliente…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none placeholder:text-stone-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-100 sm:w-64"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-stone-400">
            <FileText className="size-10 opacity-30" />
            <p className="text-sm">Nenhuma NF-e encontrada</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                {["Nº NF-e", "Venda", "Documento", "Cliente", "Status", "Data", "Ações"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const cfg = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                return (
                  <tr key={req.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                    <td className="px-4 py-3 font-mono text-xs text-stone-700">
                      {req.nfeNumber ?? <span className="text-stone-300">—</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-900">{req.saleCode}</td>
                    <td className="px-4 py-3 font-mono text-xs text-stone-600">
                      {formatDocument(req.document)}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {req.customerName ?? <span className="text-stone-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        <Icon className="size-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-500 tabular-nums">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {req.status === "completed" && (
                        <button
                          type="button"
                          onClick={() => openDanfePrint(req)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-50"
                        >
                          <Printer className="size-3" />
                          DANFE
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
