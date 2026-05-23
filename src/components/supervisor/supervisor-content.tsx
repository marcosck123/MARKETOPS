"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle2, FileText, Printer, X } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  attendHelpRequest,
  getActiveHelpRequests,
  type HelpRequestRow,
} from "@/lib/actions/help-requests";
import {
  cancelFiscalRequest,
  completeFiscalRequest,
  getPendingFiscalRequests,
  type FiscalRequestRow,
} from "@/lib/actions/fiscal-requests";
import { cn } from "@/lib/utils";

type Props = {
  initialRequests: HelpRequestRow[];
  initialFiscalRequests: FiscalRequestRow[];
};

type NfeResult = {
  nfeKey: string;
  nfeNumber: string;
  saleCode: string;
  document: string;
  customerName: string | null;
};

function playBeep(ctx: AudioContext) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.type = "sine";
  oscillator.frequency.value = 440;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.2);
}

function getRemainingSeconds(expiresAt: Date, nowMs: number): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - nowMs) / 1000));
}

function getProgressPercent(expiresAt: Date, nowMs: number): number {
  const remaining = getRemainingSeconds(expiresAt, nowMs);
  return Math.min(100, Math.max(0, (remaining / 60) * 100));
}

function formatDocument(doc: string): string {
  const d = doc.replace(/\D/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length === 14) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  return doc;
}

function openDanfePrint(nfe: NfeResult) {
  const w = window.open("", "_blank");
  if (!w) return;
  const keyFormatted = nfe.nfeKey.replace(/(\d{4})/g, "$1 ").trim();
  w.document.write(`<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><title>DANFE — ${nfe.nfeNumber}</title>
<style>
  body { font-family: monospace; font-size: 11px; margin: 20px; color: #000; }
  h1 { font-size: 14px; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 12px; }
  .row { display: flex; gap: 24px; margin-bottom: 6px; }
  .label { font-weight: bold; min-width: 120px; }
  .key { font-size: 10px; letter-spacing: 1px; word-break: break-all; background: #f5f5f5; padding: 4px; border: 1px solid #ccc; margin-top: 8px; }
  .footer { margin-top: 24px; font-size: 9px; color: #555; border-top: 1px dashed #999; padding-top: 8px; }
  @media print { .no-print { display: none; } }
</style></head><body>
<h1>DANFE — Documento Auxiliar da NF-e (MOCK)</h1>
<div class="row"><span class="label">Número NF-e:</span><span>${nfe.nfeNumber}</span></div>
<div class="row"><span class="label">Venda:</span><span>${nfe.saleCode}</span></div>
<div class="row"><span class="label">CPF/CNPJ:</span><span>${formatDocument(nfe.document)}</span></div>
${nfe.customerName ? `<div class="row"><span class="label">Cliente:</span><span>${nfe.customerName}</span></div>` : ""}
<div class="key">Chave de acesso: ${keyFormatted}</div>
<div class="footer">Este é um documento simulado (mock) — não possui validade fiscal.</div>
<br><button class="no-print" onclick="window.print()">Imprimir</button>
</body></html>`);
  w.document.close();
}

export function SupervisorContent({ initialRequests, initialFiscalRequests }: Props) {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<HelpRequestRow[]>(initialRequests);
  const [fiscalRequests, setFiscalRequests] = useState<FiscalRequestRow[]>(initialFiscalRequests);
  const [now, setNow] = useState(() => Date.now());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [nfeResult, setNfeResult] = useState<NfeResult | null>(null);
  const [emitting, setEmitting] = useState<string | null>(null);

  // 4s polling
  useEffect(() => {
    const interval = setInterval(async () => {
      const [fresh, freshNF] = await Promise.all([
        getActiveHelpRequests(),
        getPendingFiscalRequests(),
      ]);
      setRequests(fresh);
      setFiscalRequests(freshNF);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 1s ticker for progress bars
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Alarm when help requests exist
  const hasRequests = requests.length > 0;
  useEffect(() => {
    if (!hasRequests) {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      return;
    }

    const beep = () => {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      playBeep(audioCtxRef.current);
    };

    beep();
    alarmIntervalRef.current = setInterval(beep, 5000);

    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    };
  }, [hasRequests]);

  // Tab title badge (help requests + NF queue)
  const total = requests.length + fiscalRequests.length;
  useEffect(() => {
    document.title =
      total > 0
        ? `(${total}) Supervisor — MARKETOPS`
        : "Supervisor — MARKETOPS";
    return () => {
      document.title = "MARKETOPS";
    };
  }, [total]);

  async function handleAttend(id: string) {
    const supervisorName = session?.user?.name ?? "Supervisor";
    await attendHelpRequest(id, supervisorName);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleEmitNfe(req: FiscalRequestRow) {
    const supervisorId = session?.user?.id ?? "supervisor";
    setEmitting(req.id);
    const result = await completeFiscalRequest(req.id, supervisorId);
    setEmitting(null);

    if (!result.success) return;

    setFiscalRequests((prev) => prev.filter((r) => r.id !== req.id));
    setNfeResult({
      nfeKey: result.data.nfeKey,
      nfeNumber: result.data.nfeNumber,
      saleCode: req.saleCode,
      document: req.document,
      customerName: req.customerName,
    });
  }

  async function handleCancelNfe(id: string) {
    await cancelFiscalRequest(id);
    setFiscalRequests((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Supervisor</h1>
        <p className="mt-1 text-sm text-slate-500">Fila de chamados e NF-e em tempo real</p>
      </div>

      {/* Help requests */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Chamados de ajuda
        </h2>
        {requests.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
            <CheckCircle2 className="size-5 text-emerald-400" aria-hidden="true" />
            <p className="text-sm text-slate-500">Nenhum chamado ativo</p>
          </div>
        ) : (
          requests.map((req) => {
            const remaining = getRemainingSeconds(req.expiresAt, now);
            const progress = getProgressPercent(req.expiresAt, now);
            const isUrgent = remaining <= 20;

            return (
              <div
                key={req.id}
                className={cn(
                  "rounded-xl border bg-white p-4 shadow-sm",
                  isUrgent ? "border-red-200" : "border-amber-200",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                        isUrgent ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600",
                      )}
                    >
                      <Bell className="size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{req.cashRegisterName}</p>
                      <p className="text-sm text-slate-500">{req.operatorName}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleAttend(req.id)}
                    className="shrink-0 rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
                  >
                    Atender
                  </button>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Tempo restante</span>
                    <span className={cn("font-medium tabular-nums", isUrgent ? "text-red-500" : "text-amber-600")}>
                      {remaining}s
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn("h-full rounded-full transition-all duration-1000", isUrgent ? "bg-red-500" : "bg-amber-400")}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* NF queue */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Fila de NF-e
        </h2>
        {fiscalRequests.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
            <FileText className="size-5 text-slate-300" aria-hidden="true" />
            <p className="text-sm text-slate-500">Nenhuma NF pendente</p>
          </div>
        ) : (
          fiscalRequests.map((req) => (
            <div key={req.id} className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-600">
                    <FileText className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{req.saleCode}</p>
                    <p className="font-mono text-xs text-slate-500">
                      {formatDocument(req.document)}
                    </p>
                    {req.customerName && (
                      <p className="text-xs text-slate-400">{req.customerName}</p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => void handleCancelNfe(req.id)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-red-200 hover:text-red-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={emitting === req.id}
                    onClick={() => void handleEmitNfe(req)}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
                  >
                    {emitting === req.id ? "Emitindo..." : "Emitir NF"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* NF-e success modal */}
      {nfeResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-500" aria-hidden="true" />
                <h2 className="text-base font-semibold text-slate-900">NF-e Emitida</h2>
              </div>
              <button
                type="button"
                onClick={() => setNfeResult(null)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Número NF-e</span>
                <span className="font-semibold">{nfeResult.nfeNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Venda</span>
                <span className="font-semibold">{nfeResult.saleCode}</span>
              </div>
              {nfeResult.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Cliente</span>
                  <span className="font-semibold">{nfeResult.customerName}</span>
                </div>
              )}
            </div>

            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="mb-1 text-xs font-medium text-slate-500">Chave de acesso</p>
              <p className="break-all font-mono text-xs text-slate-700">{nfeResult.nfeKey}</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setNfeResult(null)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => openDanfePrint(nfeResult)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-800 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                <Printer className="size-4" aria-hidden="true" />
                Imprimir DANFE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
