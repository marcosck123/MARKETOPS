import { AdminShell } from "@/components/layout/admin-shell";
import { SupervisorContent } from "@/components/supervisor/supervisor-content";
import { getActiveHelpRequests } from "@/lib/actions/help-requests";

export default async function SupervisorPage() {
  const initialRequests = await getActiveHelpRequests();

  return (
    <AdminShell>
      <SupervisorContent initialRequests={initialRequests} />
    </AdminShell>
  );
}
