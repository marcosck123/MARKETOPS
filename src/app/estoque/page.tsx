import { AdminShell } from "@/components/layout/admin-shell";
import { StockContent } from "@/components/stock/stock-content";

export default function StockPage() {
  return (
    <AdminShell>
      <StockContent />
    </AdminShell>
  );
}
