import { db } from "@/lib/db";
import { type Product } from "@/lib/product-data";
import { ProductsContent } from "@/components/products/products-content";
import { AdminShell } from "@/components/layout/admin-shell";

export default async function ProductsPage() {
  const [productsRaw, sections, categories] = await Promise.all([
    db.product.findMany({ orderBy: { name: "asc" } }),
    db.section.findMany({ orderBy: { name: "asc" } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const products: Product[] = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    barcode: p.barcode,
    sku: p.sku,
    sectionId: p.sectionId,
    categoryId: p.categoryId,
    unit: p.unit as Product["unit"],
    costPrice: p.costPrice,
    salePrice: p.salePrice,
    wholesalePrice: p.wholesalePrice,
    currentStock: p.currentStock,
    minimumStock: p.minimumStock,
    status: p.status as "active" | "inactive",
  }));

  return (
    <AdminShell>
      <ProductsContent
        products={products}
        sections={sections.map((s) => ({ id: s.id, name: s.name }))}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          sectionId: c.sectionId,
        }))}
      />
    </AdminShell>
  );
}
