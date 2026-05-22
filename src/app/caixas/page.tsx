import { CashRegistersContent } from "@/components/cash-registers/cash-registers-content";
import { AdminShell } from "@/components/layout/admin-shell";

export default function CashRegistersPage() {
  return (
    <AdminShell>
      <CashRegistersContent />
    </AdminShell>
  );
}
