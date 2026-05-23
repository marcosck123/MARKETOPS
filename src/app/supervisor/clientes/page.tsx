import { AdminShell } from "@/components/layout/admin-shell";
import { CustomersContent } from "@/components/customers/customers-content";
import { listCustomers } from "@/lib/actions/customers";

export default async function ClientesPage() {
  const customers = await listCustomers();

  return (
    <AdminShell>
      <CustomersContent customers={customers} />
    </AdminShell>
  );
}
