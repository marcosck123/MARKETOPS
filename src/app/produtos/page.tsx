import { AdminShell } from "@/components/layout/admin-shell";
import { ProductsContent } from "@/components/products/products-content";

export default function ProductsPage() {
  return (
    <AdminShell>
      <ProductsContent />
    </AdminShell>
  );
}
