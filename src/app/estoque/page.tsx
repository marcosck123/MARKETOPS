import { db } from "@/lib/db";
import { AdminShell } from "@/components/layout/admin-shell";
import { StockContent } from "@/components/stock/stock-content";

export default async function StockPage() {
  const [productsRaw, sections, categories, entriesRaw, grouped] =
    await Promise.all([
      db.product.findMany({ orderBy: { name: "asc" } }),
      db.section.findMany({ orderBy: { name: "asc" } }),
      db.category.findMany({ orderBy: { name: "asc" } }),
      db.stockEntry.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      db.stockEntry.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
      }),
    ]);

  const stockMap = new Map(
    grouped.map((g) => [g.productId, g._sum.quantity ?? 0]),
  );

  const products = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    barcode: p.barcode,
    sectionId: p.sectionId,
    categoryId: p.categoryId,
    costPrice: p.costPrice,
    currentStock: stockMap.has(p.id) ? (stockMap.get(p.id) ?? 0) : p.currentStock,
    minimumStock: p.minimumStock,
    status: p.status as "active" | "inactive",
  }));

  const movements = entriesRaw.map((e) => ({
    id: e.id,
    productId: e.productId,
    type: e.type as "entrada" | "saida" | "ajuste",
    quantity: e.quantity,
    reason: e.reason,
    responsible: e.responsible,
    createdAt: new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(e.createdAt),
  }));

  return (
    <AdminShell>
      <StockContent
        products={products}
        sections={sections.map((s) => ({ id: s.id, name: s.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        movements={movements}
      />
    </AdminShell>
  );
}
