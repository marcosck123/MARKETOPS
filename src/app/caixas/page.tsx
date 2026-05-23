import { db } from "@/lib/db";
import { CashRegistersContent } from "@/components/cash-registers/cash-registers-content";
import { AdminShell } from "@/components/layout/admin-shell";

export default async function CashRegistersPage() {
  const registersRaw = await db.cashRegister.findMany({
    orderBy: { name: "asc" },
  });

  const registers = registersRaw.map((r) => ({
    id: r.id,
    name: r.name,
    status: r.status as "open" | "closed",
    openedAt: r.openedAt
      ? new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(r.openedAt)
      : null,
    closedAt: r.closedAt
      ? new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(r.closedAt)
      : null,
    openingBalance: r.openingBalance,
    closingBalance: r.closingBalance,
  }));

  return (
    <AdminShell>
      <CashRegistersContent registers={registers} />
    </AdminShell>
  );
}
