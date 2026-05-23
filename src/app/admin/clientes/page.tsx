import { AdminShell } from "@/components/layout/admin-shell";
import { CustomersContent } from "@/components/customers/customers-content";

export default function CustomersPage() {
  return (
    <AdminShell>
      <CustomersContent />
    </AdminShell>
  );
}
