import { AdminShell } from "@/components/layout/admin-shell";
import { PurchasesContent } from "@/components/purchases/purchases-content";
import { db } from "@/lib/db";
import { listStockReceipts } from "@/lib/actions/stock-receipts";
import { listSuppliers } from "@/lib/actions/suppliers";

export default async function PurchasesPage() {
  const [receipts, suppliers, products] = await Promise.all([
    listStockReceipts(),
    listSuppliers(),
    db.product.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, sku: true },
    }),
  ]);
  return (
    <AdminShell>
      <PurchasesContent
        initialReceipts={receipts}
        suppliers={suppliers}
        products={products}
      />
    </AdminShell>
  );
}
