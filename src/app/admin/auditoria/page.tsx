import { AuditContent, type AuditLogRow } from "@/components/audit/audit-content";
import { AdminShell } from "@/components/layout/admin-shell";
import { db } from "@/lib/db";
import type { AuditModule, AuditAction, AuditSeverity, AuditReviewStatus } from "@/lib/audit-data";

export default async function AuditPage() {
  const logsRaw = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const logs: AuditLogRow[] = logsRaw.map((log: (typeof logsRaw)[number]) => ({
    id: log.id,
    module: log.module as AuditModule,
    action: log.action as AuditAction,
    severity: log.severity as AuditSeverity,
    reviewStatus: log.reviewStatus as AuditReviewStatus,
    actorName: log.actorName,
    actorRole: log.actorRole,
    target: log.target,
    targetId: log.targetId,
    description: log.description,
    createdAt: new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(log.createdAt),
  }));

  return (
    <AdminShell>
      <AuditContent logs={logs} />
    </AdminShell>
  );
}
