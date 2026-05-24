"use client";

import { type FormEvent, type ReactNode, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileSearch,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { createAuditLog, updateAuditLogReview } from "@/lib/actions/audit-log";
import {
  type AuditAction,
  type AuditModule,
  type AuditReviewStatus,
  type AuditSeverity,
  auditActionLabels,
  auditModuleLabels,
  auditReviewStatusLabels,
  auditSeverityLabels,
} from "@/lib/audit-data";

export type AuditLogRow = {
  id: string;
  module: AuditModule;
  action: AuditAction;
  severity: AuditSeverity;
  reviewStatus: AuditReviewStatus;
  actorName: string;
  actorRole: string;
  target: string;
  targetId: string;
  description: string;
  createdAt: string;
};

function getSeverityTone(severity: AuditSeverity) {
  if (severity === "critical") return "danger" as const;
  if (severity === "warning") return "warning" as const;
  return "info" as const;
}

function getReviewTone(status: AuditReviewStatus) {
  if (status === "reviewed") return "success" as const;
  if (status === "ignored") return "info" as const;
  return "warning" as const;
}

const moduleOptions = Object.keys(auditModuleLabels) as AuditModule[];
const actionOptions = Object.keys(auditActionLabels) as AuditAction[];
const severityOptions = Object.keys(auditSeverityLabels) as AuditSeverity[];
const reviewStatusOptions = Object.keys(auditReviewStatusLabels) as AuditReviewStatus[];

type AuditFormState = {
  module: AuditModule;
  action: AuditAction;
  severity: AuditSeverity;
  actorName: string;
  actorRole: string;
  target: string;
  description: string;
};

const emptyAuditForm: AuditFormState = {
  module: "stock",
  action: "updated",
  severity: "warning",
  actorName: "",
  actorRole: "",
  target: "",
  description: "",
};

type Props = {
  logs: AuditLogRow[];
};

export function AuditContent({ logs: initialLogs }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [logs, setLogs] = useState<AuditLogRow[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState<"all" | AuditModule>("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | AuditSeverity>("all");
  const [reviewFilter, setReviewFilter] = useState<"all" | AuditReviewStatus>("all");
  const [selectedLogId, setSelectedLogId] = useState(initialLogs[0]?.id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredLogs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesSearch =
        !search ||
        log.id.toLowerCase().includes(search) ||
        log.actorName.toLowerCase().includes(search) ||
        log.target.toLowerCase().includes(search) ||
        log.description.toLowerCase().includes(search);
      const matchesModule = moduleFilter === "all" || log.module === moduleFilter;
      const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
      const matchesReview = reviewFilter === "all" || log.reviewStatus === reviewFilter;
      return matchesSearch && matchesModule && matchesSeverity && matchesReview;
    });
  }, [logs, moduleFilter, reviewFilter, searchTerm, severityFilter]);

  const selectedLog = logs.find((log) => log.id === selectedLogId) ?? filteredLogs[0] ?? logs[0];
  const pendingLogs = logs.filter((log) => log.reviewStatus === "pending");
  const criticalLogs = logs.filter((log) => log.severity === "critical");
  const reviewedLogs = logs.filter((log) => log.reviewStatus === "reviewed");
  const criticalPending = logs.filter(
    (log) => log.severity === "critical" && log.reviewStatus === "pending",
  );

  function optimisticReview(logId: string, reviewStatus: AuditReviewStatus) {
    setLogs((current) =>
      current.map((log) => (log.id === logId ? { ...log, reviewStatus } : log)),
    );
  }

  function handleReviewStatus(logId: string, status: AuditReviewStatus) {
    optimisticReview(logId, status);
    startTransition(async () => {
      await updateAuditLogReview(logId, status);
      router.refresh();
    });
  }

  async function handleCreateLog(formState: AuditFormState) {
    await createAuditLog({
      module: formState.module,
      action: formState.action,
      severity: formState.severity,
      actorName: formState.actorName.trim(),
      actorRole: formState.actorRole.trim(),
      target: formState.target.trim(),
      targetId: "manual",
      description: formState.description.trim(),
    });
    setIsModalOpen(false);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        eyebrow="Governanca operacional"
        title="Auditoria e logs"
        description="Rastreie acoes criticas do MARKETOPS por modulo, usuario, origem, impacto e status de revisao."
        action={
          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            Registrar evento
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total de eventos" value={String(logs.length)} />
        <SummaryCard label="Pendentes" value={String(pendingLogs.length)} />
        <SummaryCard label="Criticos" value={String(criticalLogs.length)} />
        <SummaryCard label="Revisados" value={String(reviewedLogs.length)} />
      </section>

      {criticalPending.length > 0 ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-red-700" />
            <div>
              <h2 className="text-sm font-semibold text-red-900">
                Eventos criticos aguardando revisao
              </h2>
              <p className="mt-1 text-sm leading-6 text-red-800">
                {criticalPending.length} evento(s) exigem conferencia antes do fechamento operacional.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Trilha de eventos</h2>
              <p className="mt-1 text-sm text-slate-500">
                Consulte a origem, o alvo e o resultado das operacoes.
              </p>
            </div>

            <div className="grid gap-2 lg:grid-cols-[1fr_150px_150px_160px]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar log"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <select
                value={moduleFilter}
                onChange={(event) => setModuleFilter(event.target.value as "all" | AuditModule)}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">Todos modulos</option>
                {moduleOptions.map((module) => (
                  <option key={module} value={module}>{auditModuleLabels[module]}</option>
                ))}
              </select>

              <select
                value={severityFilter}
                onChange={(event) => setSeverityFilter(event.target.value as "all" | AuditSeverity)}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">Todos riscos</option>
                {severityOptions.map((severity) => (
                  <option key={severity} value={severity}>{auditSeverityLabels[severity]}</option>
                ))}
              </select>

              <select
                value={reviewFilter}
                onChange={(event) => setReviewFilter(event.target.value as "all" | AuditReviewStatus)}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">Todos status</option>
                {reviewStatusOptions.map((status) => (
                  <option key={status} value={status}>{auditReviewStatusLabels[status]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredLogs.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-400">
                Nenhum evento registrado ainda.
              </p>
            ) : (
              <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Evento</th>
                    <th className="px-5 py-3 font-semibold">Modulo</th>
                    <th className="px-5 py-3 font-semibold">Responsavel</th>
                    <th className="px-5 py-3 font-semibold">Risco</th>
                    <th className="px-5 py-3 font-semibold">Revisao</th>
                    <th className="px-5 py-3 font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="text-slate-700">
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs font-semibold text-slate-900">{log.id.slice(-8).toUpperCase()}</p>
                        <p className="mt-1 text-xs text-slate-500">{log.createdAt}</p>
                        <p className="mt-1 max-w-md text-xs text-slate-500">{log.description}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge label={auditModuleLabels[log.module] ?? log.module} tone="info" />
                        <p className="mt-2 text-xs text-slate-500">
                          {auditActionLabels[log.action] ?? log.action}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-medium text-slate-950">{log.actorName}</p>
                        <p className="mt-1 text-xs text-slate-500">{log.actorRole}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge
                          label={auditSeverityLabels[log.severity] ?? log.severity}
                          tone={getSeverityTone(log.severity)}
                        />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge
                          label={auditReviewStatusLabels[log.reviewStatus] ?? log.reviewStatus}
                          tone={getReviewTone(log.reviewStatus)}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedLogId(log.id)}
                          >
                            <Eye className="size-4" aria-hidden="true" />
                            Detalhes
                          </Button>
                          {log.reviewStatus === "pending" ? (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={isPending}
                                onClick={() => handleReviewStatus(log.id, "reviewed")}
                              >
                                <CheckCircle2 className="size-4" aria-hidden="true" />
                                Revisar
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={isPending}
                                onClick={() => handleReviewStatus(log.id, "ignored")}
                              >
                                <X className="size-4" aria-hidden="true" />
                                Ignorar
                              </Button>
                            </>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              disabled={isPending}
                              onClick={() => handleReviewStatus(log.id, "pending")}
                            >
                              <RotateCcw className="size-4" aria-hidden="true" />
                              Reabrir
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <AuditDetailPanel log={selectedLog} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <PolicyCard
          icon={<ClipboardList className="size-5" aria-hidden="true" />}
          title="Retencao inicial"
          description="Guardar logs operacionais, actor, modulo, alvo e origem antes de limpar historico."
        />
        <PolicyCard
          icon={<AlertTriangle className="size-5" aria-hidden="true" />}
          title="Acoes sensiveis"
          description="Exclusoes, cancelamentos, ajustes de estoque e falhas de acesso entram como prioridade."
        />
        <PolicyCard
          icon={<FileSearch className="size-5" aria-hidden="true" />}
          title="Revisao diaria"
          description="Eventos criticos ou pendentes devem ser conferidos antes do fechamento administrativo."
        />
      </section>

      {isModalOpen ? (
        <AuditEventModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateLog}
        />
      ) : null}
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

function PolicyCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 text-emerald-700">{icon}</div>
      <h2 className="mt-4 text-base font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}

function AuditDetailPanel({ log }: { log?: AuditLogRow }) {
  if (!log) {
    return (
      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Nenhum log selecionado.</p>
      </aside>
    );
  }

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            {auditModuleLabels[log.module] ?? log.module}
          </p>
          <h2 className="mt-1 font-mono text-lg font-semibold text-slate-950">
            {log.id.slice(-8).toUpperCase()}
          </h2>
        </div>
        <StatusBadge
          label={auditSeverityLabels[log.severity] ?? log.severity}
          tone={getSeverityTone(log.severity)}
        />
      </div>

      <div className="mt-5 space-y-4 text-sm">
        <DetailRow label="Acao" value={auditActionLabels[log.action] ?? log.action} />
        <DetailRow label="Alvo" value={`${log.target} (${log.targetId})`} />
        <DetailRow label="Responsavel" value={`${log.actorName} — ${log.actorRole}`} />
        <DetailRow label="Quando" value={log.createdAt} />
        <DetailRow label="Descricao" value={log.description} />
      </div>
    </aside>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-slate-700">{value}</p>
    </div>
  );
}

function AuditEventModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (formState: AuditFormState) => Promise<void>;
}) {
  const [formState, setFormState] = useState<AuditFormState>(emptyAuditForm);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !formState.actorName.trim() ||
      !formState.actorRole.trim() ||
      !formState.target.trim() ||
      !formState.description.trim()
    ) return;
    setLoading(true);
    await onSubmit(formState);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-event-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">Evento manual</p>
            <h2 id="audit-event-modal-title" className="mt-1 text-xl font-semibold text-slate-950">
              Registrar log
            </h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Modulo</span>
              <select
                value={formState.module}
                onChange={(e) => setFormState((s) => ({ ...s, module: e.target.value as AuditModule }))}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                {moduleOptions.map((m) => (
                  <option key={m} value={m}>{auditModuleLabels[m]}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Acao</span>
              <select
                value={formState.action}
                onChange={(e) => setFormState((s) => ({ ...s, action: e.target.value as AuditAction }))}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                {actionOptions.map((a) => (
                  <option key={a} value={a}>{auditActionLabels[a]}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Risco</span>
              <select
                value={formState.severity}
                onChange={(e) => setFormState((s) => ({ ...s, severity: e.target.value as AuditSeverity }))}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                {severityOptions.map((sv) => (
                  <option key={sv} value={sv}>{auditSeverityLabels[sv]}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Responsavel</span>
              <input
                value={formState.actorName}
                onChange={(e) => setFormState((s) => ({ ...s, actorName: e.target.value }))}
                placeholder="Nome do usuario"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Cargo</span>
              <input
                value={formState.actorRole}
                onChange={(e) => setFormState((s) => ({ ...s, actorRole: e.target.value }))}
                placeholder="Gerente, caixa, suporte"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          <label className="block space-y-1 text-sm font-medium text-slate-700">
            <span>Alvo</span>
            <input
              value={formState.target}
              onChange={(e) => setFormState((s) => ({ ...s, target: e.target.value }))}
              placeholder="Venda, produto, caixa ou lancamento"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="block space-y-1 text-sm font-medium text-slate-700">
            <span>Descricao</span>
            <textarea
              value={formState.description}
              onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
              rows={4}
              placeholder="Descreva o evento registrado"
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-slate-950 text-white hover:bg-slate-800"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {loading ? "Salvando..." : "Salvar log"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
