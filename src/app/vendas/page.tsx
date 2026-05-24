import { AdminShell } from "@/components/layout/admin-shell";
import { SalesContent } from "@/components/sales/sales-content";
import { db } from "@/lib/db";
import type { CashRegister, CashSession } from "@/lib/cash-data";
import type { Customer } from "@/lib/customer-data";
import type { Product } from "@/lib/product-data";

export default async function SalesPage() {
  const [productsRaw, cashSessionsRaw, cashRegistersRaw, customersRaw] =
    await Promise.all([
      db.product.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
      db.cashSession.findMany({
        where: { status: "open" },
        include: { cashRegister: { select: { id: true, name: true } } },
        orderBy: { openedAt: "desc" },
      }),
      db.cashRegister.findMany({ orderBy: { name: "asc" } }),
      db.customer.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    ]);

  const products: Product[] = productsRaw.map((p: (typeof productsRaw)[number]) => ({
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

  const cashSessions: CashSession[] = cashSessionsRaw.map((s: (typeof cashSessionsRaw)[number]) => ({
    id: s.id,
    registerId: s.cashRegisterId,
    operator: s.operatorName,
    openedAt: new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(s.openedAt),
    closedAt: s.closedAt
      ? new Intl.DateTimeFormat("pt-BR").format(s.closedAt)
      : "",
    openingAmount: s.openingBalance,
    countedAmount: 0,
    expectedAmount: 0,
    difference: 0,
    status: s.status as "open" | "closed",
    notes: "",
  }));

  const cashRegisters: CashRegister[] = cashRegistersRaw.map((r: (typeof cashRegistersRaw)[number]) => ({
    id: r.id,
    code: r.name,
    name: r.name,
    store: "",
    status: "active" as const,
    currentSessionId: "",
    lastClosedAt: r.closedAt
      ? new Intl.DateTimeFormat("pt-BR").format(r.closedAt)
      : "",
  }));

  const customers: Customer[] = customersRaw.map((c: (typeof customersRaw)[number]) => ({
    id: c.id,
    name: c.name,
    document: c.document,
    kind: c.type === "cpf" ? ("pf" as const) : ("pj" as const),
    email: c.email ?? "",
    phone: c.phone ?? "",
    city: c.city ?? "",
    address: c.street ?? "",
    creditLimit: 0,
    currentBalance: 0,
    purchasesCount: 0,
    lastPurchase: "",
    observations: "",
    status: "active" as const,
  }));

  return (
    <AdminShell>
      <SalesContent
        products={products}
        cashSessions={cashSessions}
        cashRegisters={cashRegisters}
        customers={customers}
      />
    </AdminShell>
  );
}
