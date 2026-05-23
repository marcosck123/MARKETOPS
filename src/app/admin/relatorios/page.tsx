import { AdminShell } from "@/components/layout/admin-shell";
import { ReportsContent } from "@/components/reports/reports-content";
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

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const rawPeriod = params.period;
  const validPeriods = ["today", "week", "month", "custom"];
  const period = validPeriods.includes(rawPeriod ?? "") ? rawPeriod! : "month";
  const dateFrom = params.dateFrom;
  const dateTo = params.dateTo;

  let periodStart: Date;
  let periodEnd: Date = new Date();

  if (period === "custom" && dateFrom && dateTo) {
    periodStart = new Date(dateFrom + "T00:00:00");
    periodEnd = new Date(dateTo + "T23:59:59");
  } else {
    periodStart = getPeriodStart(period);
  }

  const sales = await db.sale.findMany({
    where: {
      status: "finished",
      finishedAt: { gte: periodStart, lte: periodEnd },
    },
    orderBy: { finishedAt: "desc" },
    take: 500,
    include: {
      cashSession: {
        include: { cashRegister: { select: { name: true } } },
      },
      _count: { select: { items: true } },
      payments: { select: { method: true } },
    },
  });

  const saleRows = sales.map((s: (typeof sales)[number]) => ({
    id: s.id,
    code: s.code,
    finishedAt: s.finishedAt?.toISOString() ?? "",
    operatorName: s.operatorName,
    cashRegisterName: s.cashSession.cashRegister.name,
    itemsCount: s._count.items,
    subtotal: s.subtotal,
    discount: s.discount,
    total: s.total,
    paymentMethods: [...new Set(s.payments.map((p: { method: string }) => p.method))],
  }));

  return (
    <AdminShell>
      <ReportsContent
        period={period}
        dateFrom={dateFrom}
        dateTo={dateTo}
        sales={saleRows}
      />
    </AdminShell>
  );
}
