import { AdminShell } from "@/components/layout/admin-shell";
import { PaymentsContent } from "@/components/payments/payments-content";

export default function PaymentsPage() {
  return (
    <AdminShell>
      <PaymentsContent />
    </AdminShell>
  );
}
