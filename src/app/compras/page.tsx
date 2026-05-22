import { AdminShell } from "@/components/layout/admin-shell";
import { PurchasesContent } from "@/components/purchases/purchases-content";

export default function PurchasesPage() {
  return (
    <AdminShell>
      <PurchasesContent />
    </AdminShell>
  );
}
