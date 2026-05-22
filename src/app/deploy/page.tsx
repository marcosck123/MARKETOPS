import { DeployContent } from "@/components/deploy/deploy-content";
import { AdminShell } from "@/components/layout/admin-shell";

export default function DeployPage() {
  return (
    <AdminShell>
      <DeployContent />
    </AdminShell>
  );
}
