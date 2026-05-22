import { FinanceContent } from "@/components/finance/finance-content";
import { AdminShell } from "@/components/layout/admin-shell";

export default function FinancePage() {
  return (
    <AdminShell>
      <FinanceContent />
    </AdminShell>
  );
}
