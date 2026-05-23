import { db } from "@/lib/db";
import { SectionsCategoriesContent } from "@/components/catalog/sections-categories-content";
import { AdminShell } from "@/components/layout/admin-shell";

export default async function SectionsCategoriesPage() {
  const [sections, categoriesRaw] = await Promise.all([
    db.section.findMany({ orderBy: { name: "asc" } }),
    db.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  const categories = categoriesRaw.map((cat: (typeof categoriesRaw)[number]) => ({
    id: cat.id,
    sectionId: cat.sectionId,
    name: cat.name,
    status: cat.status as "active" | "inactive",
    products: cat._count.products,
  }));

  return (
    <AdminShell>
      <SectionsCategoriesContent
        sections={sections.map((s: (typeof sections)[number]) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          status: s.status as "active" | "inactive",
        }))}
        categories={categories}
      />
    </AdminShell>
  );
}
