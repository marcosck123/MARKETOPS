import { AdminShell } from "@/components/layout/admin-shell";
import { SuppliersContent } from "@/components/suppliers/suppliers-content";

export default function SuppliersPage() {
  return (
    <AdminShell>
      <SuppliersContent />
    </AdminShell>
  );
}
