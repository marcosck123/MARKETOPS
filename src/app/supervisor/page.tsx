import { AdminShell } from "@/components/layout/admin-shell";
import { SupervisorContent } from "@/components/supervisor/supervisor-content";
import { getActiveHelpRequests } from "@/lib/actions/help-requests";
import { getPendingFiscalRequests } from "@/lib/actions/fiscal-requests";

export default async function SupervisorPage() {
  const [initialRequests, initialFiscalRequests] = await Promise.all([
    getActiveHelpRequests(),
    getPendingFiscalRequests(),
  ]);

  return (
    <AdminShell>
      <SupervisorContent
        initialRequests={initialRequests}
        initialFiscalRequests={initialFiscalRequests}
      />
    </AdminShell>
  );
}
