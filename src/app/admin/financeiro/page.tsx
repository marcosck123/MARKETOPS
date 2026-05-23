import { AdminShell } from "@/components/layout/admin-shell";
import { FinanceContent } from "@/components/finance/finance-content";
import { db } from "@/lib/db";

function getPeriodStart(period: string): Date {
  const now = new Date();
  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "week") {
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const rawPeriod = params.period;
  const period: "today" | "week" | "month" =
    rawPeriod === "today" || rawPeriod === "week" ? rawPeriod : "month";

  const periodStart = getPeriodStart(period);

  const [salesAgg, paymentGroups, stockSaidas, sessions] = await Promise.all([
    db.sale.aggregate({
      where: { status: "finished", finishedAt: { gte: periodStart } },
      _sum: { total: true, subtotal: true, discount: true },
      _count: true,
    }),
    db.salePayment.groupBy({
      by: ["method"],
      where: {
        sale: { status: "finished", finishedAt: { gte: periodStart } },
      },
      _sum: { amount: true },
    }),
    db.stockEntry.findMany({
      where: { type: "saida", createdAt: { gte: periodStart } },
      include: { product: { select: { costPrice: true } } },
    }),
    db.cashSession.findMany({
      where: { openedAt: { gte: periodStart } },
      include: {
        cashRegister: { select: { name: true } },
        sales: { where: { status: "finished" }, select: { total: true } },
      },
      orderBy: { openedAt: "desc" },
    }),
  ]);

  const qtdSales = salesAgg._count;
  const totalSales = salesAgg._sum.total ?? 0;
  const totalSubtotal = salesAgg._sum.subtotal ?? 0;
  const totalDescontos = salesAgg._sum.discount ?? 0;
  const ticketMedio = qtdSales > 0 ? totalSales / qtdSales : 0;

  const custoMercadorias = stockSaidas.reduce(
    (sum: number, e: (typeof stockSaidas)[number]) => sum + e.quantity * e.product.costPrice,
    0,
  );
  const margemBruta = totalSales - custoMercadorias;

  const sessionRows = sessions.map((s: (typeof sessions)[number]) => ({
    id: s.id,
    cashRegisterName: s.cashRegister.name,
    operatorName: s.operatorName,
    status: s.status as string,
    totalSales: s.sales.reduce((sum: number, sale: { total: number }) => sum + sale.total, 0),
    openedAt: s.openedAt.toISOString(),
    closedAt: s.closedAt?.toISOString() ?? null,
  }));

  return (
    <AdminShell>
      <FinanceContent
        period={period}
        summary={{ totalSales, ticketMedio, qtdSales, totalDescontos }}
        paymentBreakdown={paymentGroups.map((g: (typeof paymentGroups)[number]) => ({
          method: g.method,
          total: g._sum.amount ?? 0,
        }))}
        dre={{
          receitaBruta: totalSubtotal,
          descontos: totalDescontos,
          receitaLiquida: totalSales,
          custoMercadorias,
          margemBruta,
        }}
        sessions={sessionRows}
        totalOpenSessions={sessions.filter((s: (typeof sessions)[number]) => s.status === "open").length}
      />
    </AdminShell>
  );
}
