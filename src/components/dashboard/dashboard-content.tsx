import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";

type RecentSale = {
  code: string;
  operatorName: string;
  cashRegisterName: string;
  total: string;
  finishedAt: string;
};

type ActiveSession = {
  id: string;
  cashRegisterName: string;
  operatorName: string;
};

type LowStockProduct = {
  name: string;
  sku: string;
  current: number;
  minimum: number;
};

type DashboardProps = {
  faturamentoHoje: string;
  pedidosHoje: number;
  ticketMedio: string;
  caixasAbertos: number;
  salesByDay: { label: string; value: number }[];
  recentSales: RecentSale[];
  activeSessions: ActiveSession[];
  lowStockProducts: LowStockProduct[];
};

export function DashboardContent({
  faturamentoHoje,
  pedidosHoje,
  ticketMedio,
  caixasAbertos,
  salesByDay,
  recentSales,
  activeSessions,
  lowStockProducts,
}: DashboardProps) {
  return (
    <>
      <PageHeader
        eyebrow="Visao administrativa"
        title="Dashboard operacional"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Faturamento hoje"
          value={faturamentoHoje}
          helper="Vendas finalizadas no dia"
          trend={pedidosHoje > 0 ? "Ativo" : "Sem vendas"}
          tone="amber"
        />
        <MetricCard
          label="Pedidos hoje"
          value={String(pedidosHoje)}
          helper="Operacoes finalizadas no PDV"
          trend={pedidosHoje > 0 ? `${pedidosHoje} venda${pedidosHoje !== 1 ? "s" : ""}` : "—"}
          tone="blue"
        />
        <MetricCard
          label="Ticket medio"
          value={ticketMedio}
          helper="Media por venda finalizada hoje"
          trend={pedidosHoje > 0 ? "Calculado" : "—"}
          tone="slate"
        />
        <MetricCard
          label="Caixas abertos"
          value={String(caixasAbertos)}
          helper="Sessoes de caixa ativas agora"
          trend={caixasAbertos > 0 ? "Em operacao" : "Nenhum"}
          tone="green"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <DashboardChartCard
          title="Faturamento dos ultimos 7 dias"
          subtitle="Resumo visual para acompanhar o ritmo da operacao"
          data={salesByDay}
        />

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-white">
                Caixas ativos
              </h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Sessoes abertas agora
              </p>
            </div>
            <StatusBadge
              label={`${caixasAbertos} aberto${caixasAbertos !== 1 ? "s" : ""}`}
              tone={caixasAbertos > 0 ? "success" : "default"}
            />
          </div>

          <div className="mt-5 space-y-3">
            {activeSessions.length === 0 ? (
              <p className="py-4 text-center text-sm text-stone-400">
                Nenhum caixa aberto no momento.
              </p>
            ) : (
              activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 dark:border-stone-700"
                >
                  <div>
                    <p className="font-medium text-stone-900 dark:text-white">
                      {session.cashRegisterName}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {session.operatorName}
                    </p>
                  </div>
                  <StatusBadge label="Aberto" tone="success" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <DataTable
          title="Ultimas vendas"
          columns={["Venda", "Operador", "Caixa", "Data/Hora", "Total"]}
          rows={
            recentSales.length === 0
              ? [[
                  <span key="empty" className="text-stone-400">
                    Nenhuma venda registrada.
                  </span>,
                  "", "", "", "",
                ]]
              : recentSales.map((sale) => [
                  <span key={sale.code} className="font-mono text-xs font-semibold text-stone-900">
                    {sale.code}
                  </span>,
                  sale.operatorName,
                  sale.cashRegisterName,
                  sale.finishedAt,
                  <span key={`total-${sale.code}`} className="font-semibold tabular-nums text-stone-900">
                    {sale.total}
                  </span>,
                ])
          }
        />

        <DataTable
          title="Produtos com estoque baixo"
          columns={["Produto", "SKU", "Atual", "Minimo", "Status"]}
          rows={
            lowStockProducts.length === 0
              ? [[
                  <span key="empty" className="text-stone-400">
                    Nenhum produto com estoque baixo.
                  </span>,
                  "", "", "", "",
                ]]
              : lowStockProducts.map((product) => [
                  product.name,
                  <span key={product.sku} className="font-mono text-xs">
                    {product.sku}
                  </span>,
                  product.current,
                  product.minimum,
                  <StatusBadge
                    key={`status-${product.sku}`}
                    label={product.current === 0 ? "Zerado" : product.current <= 5 ? "Critico" : "Baixo"}
                    tone={product.current === 0 ? "danger" : product.current <= 5 ? "danger" : "warning"}
                  />,
                ])
          }
        />
      </section>
    </>
  );
}
