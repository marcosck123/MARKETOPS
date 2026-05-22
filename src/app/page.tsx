import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { AdminShell } from "@/components/layout/admin-shell";

export default function Home() {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  );
}
