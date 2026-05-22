import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  lowStockProducts,
  metricCards,
  recentSales,
  salesByDay,
} from "@/lib/mock-data";

export function DashboardContent() {
  return (
    <>
      <PageHeader
        eyebrow="Visao administrativa"
        title="Dashboard operacional"
        action={
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Dados mockados do MVP 1
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <DashboardChartCard
          title="Faturamento dos ultimos dias"
          subtitle="Resumo visual para acompanhar o ritmo da operacao"
          data={salesByDay}
        />

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Caixas ativos
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Situacao dos terminais em operacao
              </p>
            </div>
            <StatusBadge label="3 abertos" tone="success" />
          </div>

          <div className="mt-5 space-y-3">
            {["Caixa 01", "Caixa 02", "Caixa 04"].map((cashier, index) => (
              <div
                key={cashier}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{cashier}</p>
                  <p className="text-sm text-slate-500">Operador {index + 1}</p>
                </div>
                <StatusBadge label="Aberto" tone="success" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <DataTable
          title="Ultimas vendas"
          columns={["Venda", "Cliente", "Caixa", "Total", "Status"]}
          rows={recentSales.map((sale) => [
            sale.id,
            sale.customer,
            sale.cashier,
            sale.total,
            <StatusBadge
              key={sale.id}
              label={sale.status}
              tone={sale.status === "Finalizada" ? "success" : "warning"}
            />,
          ])}
        />

        <DataTable
          title="Produtos com estoque baixo"
          columns={["Produto", "SKU", "Atual", "Minimo", "Status"]}
          rows={lowStockProducts.map((product) => [
            product.name,
            product.sku,
            product.current,
            product.minimum,
            <StatusBadge
              key={product.sku}
              label={product.current <= 5 ? "Critico" : "Baixo"}
              tone={product.current <= 5 ? "danger" : "warning"}
            />,
          ])}
        />
      </section>
    </>
  );
}
