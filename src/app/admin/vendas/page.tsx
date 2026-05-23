import { AdminShell } from "@/components/layout/admin-shell";
import { db } from "@/lib/db";

const methodLabels: Record<string, string> = {
  cash: "Dinheiro",
  pix: "PIX",
  debit: "Debito",
  credit: "Credito",
  store_credit: "Cred. Loja",
};

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

export default async function AdminVendasPage() {
  const sales = await db.sale.findMany({
    where: { status: "finished" },
    orderBy: { finishedAt: "desc" },
    take: 300,
    include: {
      _count: { select: { items: true } },
      payments: { select: { method: true } },
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
            Historico de vendas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Todas as vendas finalizadas — somente leitura.
          </p>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              {sales.length} venda{sales.length !== 1 ? "s" : ""} registrada
              {sales.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="overflow-x-auto">
            {sales.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-400">
                Nenhuma venda finalizada.
              </p>
            ) : (
              <table className="w-full min-w-[750px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Codigo</th>
                    <th className="px-5 py-3 font-semibold">Data/Hora</th>
                    <th className="px-5 py-3 font-semibold">Operador</th>
                    <th className="px-5 py-3 font-semibold">Itens</th>
                    <th className="px-5 py-3 font-semibold">Pagamentos</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.map((sale) => {
                    const methods = [
                      ...new Set(sale.payments.map((p) => p.method)),
                    ];
                    return (
                      <tr key={sale.id} className="text-slate-700">
                        <td className="whitespace-nowrap px-5 py-3 font-mono text-xs font-semibold text-slate-900">
                          {sale.code}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                          {fmtDate(sale.finishedAt)}
                        </td>
                        <td className="px-5 py-3">{sale.operatorName}</td>
                        <td className="px-5 py-3 tabular-nums">
                          {sale._count.items}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {methods.map((m) => (
                              <span
                                key={m}
                                className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600"
                              >
                                {methodLabels[m] ?? m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right font-semibold tabular-nums">
                          {fmt(sale.total)}
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
