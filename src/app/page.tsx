import { db } from "@/lib/db";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { AdminShell } from "@/components/layout/admin-shell";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function Home() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [salesAgg, recentSalesRaw, activeSessionsRaw, allActiveProducts] =
    await Promise.all([
      db.sale.aggregate({
        where: { status: "finished", finishedAt: { gte: today } },
        _sum: { total: true },
        _count: true,
      }),
      db.sale.findMany({
        where: { status: "finished" },
        orderBy: { finishedAt: "desc" },
        take: 5,
        include: {
          cashSession: {
            include: { cashRegister: { select: { name: true } } },
          },
        },
      }),
      db.cashSession.findMany({
        where: { status: "open" },
        include: { cashRegister: { select: { name: true } } },
        orderBy: { openedAt: "asc" },
      }),
      db.product.findMany({
        where: { status: "active" },
        select: { name: true, sku: true, currentStock: true, minimumStock: true },
      }),
    ]);

  const totalHoje = salesAgg._sum.total ?? 0;
  const pedidosHoje = salesAgg._count;
  const ticketMedio = pedidosHoje > 0 ? totalHoje / pedidosHoje : 0;
  const caixasAbertos = activeSessionsRaw.length;

  // Last 7 days chart — one aggregate per day
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });

  const salesByDayPromises = last7Days.map((dayStart) => {
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    return db.sale.aggregate({
      where: { status: "finished", finishedAt: { gte: dayStart, lt: dayEnd } },
      _sum: { total: true },
    });
  });
  const salesByDayRaw = await Promise.all(salesByDayPromises);
  const salesByDay = last7Days.map((d, i) => ({
    label: DAY_LABELS[d.getDay()],
    value: salesByDayRaw[i]._sum.total ?? 0,
  }));

  const recentSales = recentSalesRaw.map(
    (s: (typeof recentSalesRaw)[number]) => ({
      code: s.code || `#${s.sequence}`,
      operatorName: s.operatorName,
      cashRegisterName: s.cashSession.cashRegister.name,
      total: fmt(s.total),
      finishedAt: fmtDate(s.finishedAt),
    }),
  );

  const activeSessions = activeSessionsRaw.map(
    (s: (typeof activeSessionsRaw)[number]) => ({
      id: s.id,
      cashRegisterName: s.cashRegister.name,
      operatorName: s.operatorName,
    }),
  );

  const lowStockProducts = allActiveProducts
    .filter((p: (typeof allActiveProducts)[number]) => p.currentStock <= p.minimumStock)
    .slice(0, 10)
    .map((p: (typeof allActiveProducts)[number]) => ({
      name: p.name,
      sku: p.sku,
      current: p.currentStock,
      minimum: p.minimumStock,
    }));

  return (
    <AdminShell>
      <DashboardContent
        faturamentoHoje={fmt(totalHoje)}
        pedidosHoje={pedidosHoje}
        ticketMedio={fmt(ticketMedio)}
        caixasAbertos={caixasAbertos}
        salesByDay={salesByDay}
        recentSales={recentSales}
        activeSessions={activeSessions}
        lowStockProducts={lowStockProducts}
      />
    </AdminShell>
  );
}
