import { AdminShell } from "@/components/layout/admin-shell";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminCaixasPage() {
  const sessions = await db.cashSession.findMany({
    orderBy: { openedAt: "desc" },
    take: 300,
    include: {
      cashRegister: { select: { name: true } },
      sales: { where: { status: "finished" }, select: { total: true } },
    },
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Leitura financeiro
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Sessoes de caixa
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Historico de sessoes por operador — somente leitura.
          </p>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              {sessions.length} sessao{sessions.length !== 1 ? "es" : ""}{" "}
              registrada{sessions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="overflow-x-auto">
            {sessions.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-400">
                Nenhuma sessao registrada.
              </p>
            ) : (
              <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Caixa</th>
                    <th className="px-5 py-3 font-semibold">Operador</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Abertura</th>
                    <th className="px-5 py-3 font-semibold">Fechamento</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Saldo abertura
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Saldo fechamento
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Total vendas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((session) => {
                    const totalSales = session.sales.reduce(
                      (sum, s) => sum + s.total,
                      0,
                    );
                    const isOpen = session.status === "open";
                    return (
                      <tr key={session.id} className="text-slate-700">
                        <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-900">
                          {session.cashRegister.name}
                        </td>
                        <td className="px-5 py-3">{session.operatorName}</td>
                        <td className="whitespace-nowrap px-5 py-3">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              isOpen
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500",
                            )}
                          >
                            {isOpen ? "Aberta" : "Fechada"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                          {fmtDate(session.openedAt)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                          {fmtDate(session.closedAt)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums">
                          {fmt(session.openingBalance)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums">
                          {session.closingBalance != null
                            ? fmt(session.closingBalance)
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right font-semibold tabular-nums">
                          {fmt(totalSales)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
