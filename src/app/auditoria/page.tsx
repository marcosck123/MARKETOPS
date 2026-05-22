import { AuditContent } from "@/components/audit/audit-content";
import { AdminShell } from "@/components/layout/admin-shell";

export default function AuditPage() {
  return (
    <AdminShell>
      <AuditContent />
    </AdminShell>
  );
}
