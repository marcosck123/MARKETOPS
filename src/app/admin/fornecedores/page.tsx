import { AdminShell } from "@/components/layout/admin-shell";
import { SuppliersContent } from "@/components/suppliers/suppliers-content";
import { listSuppliers } from "@/lib/actions/suppliers";

export default async function SuppliersPage() {
  const suppliers = await listSuppliers();
  return (
    <AdminShell>
      <SuppliersContent initialSuppliers={suppliers} />
    </AdminShell>
  );
}
