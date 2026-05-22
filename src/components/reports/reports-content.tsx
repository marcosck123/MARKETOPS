"use client";

import { type ReactNode, useMemo, useState } from "react";
import {
  Boxes,
  CreditCard,
  FileBarChart2,
  Package,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { initialCashRegisters, initialCashSessions } from "@/lib/cash-data";
import { initialPaymentTransactions } from "@/lib/payment-data";
import { type Product, initialProducts } from "@/lib/product-data";
import {
  initialPurchaseOrders,
  purchaseStatusLabels,
} from "@/lib/purchase-data";
import {
  type PaymentMethod,
  initialSales,
  paymentMethodLabels,
} from "@/lib/sale-data";

type ReportView =
  | "overview"
  | "sales"
  | "payments"
  | "stock"
  | "purchases";

type ProductSalesRow = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

type OperatorSalesRow = {
  operator: string;
  sales: number;
  revenue: number;
};

type PaymentMethodRow = {
  method: PaymentMethod;
  grossAmount: number;
  netAmount: number;
  transactions: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function getPurchaseTotal(orderId: string) {
  const order = initialPurchaseOrders.find(
    (purchaseOrder) => purchaseOrder.id === orderId,
  );

  if (!order) {
    return 0;
  }

  return order.items.reduce(
    (total, item) => total + item.quantity * item.unitCost,
    0,
  );
}

export function ReportsContent() {
  const [activeView, setActiveView] = useState<ReportView>("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const productById = useMemo(
    () => new Map(initialProducts.map((product) => [product.id, product])),
    [],
  );
  const cashSessionById = useMemo(
    () => new Map(initialCashSessions.map((session) => [session.id, session])),
    [],
  );
  const cashRegisterById = useMemo(
    () =>
      new Map(initialCashRegisters.map((cashRegister) => [cashRegister.id, cashRegister])),
    [],
  );

  const finishedSales = initialSales.filter((sale) => sale.status === "finished");
  const openSales = initialSales.filter((sale) => sale.status === "open");
  const revenue = finishedSales.reduce((total, sale) => total + sale.total, 0);
  const averageTicket =
    finishedSales.length > 0 ? revenue / finishedSales.length : 0;
  const grossPayments = initialPaymentTransactions
    .filter(
      (transaction) =>
        transaction.status === "approved" ||
        transaction.status === "reconciled",
    )
    .reduce((total, transaction) => total + transaction.grossAmount, 0);
  const netPayments = initialPaymentTransactions
    .filter(
      (transaction) =>
        transaction.status === "approved" ||
        transaction.status === "reconciled",
    )
    .reduce((total, transaction) => total + transaction.netAmount, 0);
  const stockValue = initialProducts.reduce(
    (total, product) => total + product.currentStock * product.costPrice,
    0,
  );
  const lowStockProducts = initialProducts.filter(
    (product) => product.currentStock <= product.minimumStock,
  );
  const pendingPurchaseValue = initialPurchaseOrders
    .filter(
      (purchaseOrder) =>
        purchaseOrder.status === "draft" ||
        purchaseOrder.status === "sent" ||
        purchaseOrder.status === "partial_received",
    )
    .reduce((total, purchaseOrder) => total + getPurchaseTotal(purchaseOrder.id), 0);

  const productSales = useMemo<ProductSalesRow[]>(() => {
    const rows = new Map<string, ProductSalesRow>();

    for (const sale of initialSales) {
      if (sale.status !== "finished") {
        continue;
      }

      for (const item of sale.items) {
        const product = productById.get(item.productId);
        const current = rows.get(item.productId);

        rows.set(item.productId, {
          productId: item.productId,
          name: product?.name ?? "Produto removido",
          quantity: (current?.quantity ?? 0) + item.quantity,
          revenue: (current?.revenue ?? 0) + item.total,
        });
      }
    }

    return Array.from(rows.values()).sort((a, b) => b.revenue - a.revenue);
  }, [productById]);

  const operatorSales = useMemo<OperatorSalesRow[]>(() => {
    const rows = new Map<string, OperatorSalesRow>();

    for (const sale of initialSales) {
      if (sale.status !== "finished") {
        continue;
      }

      const current = rows.get(sale.operator);

      rows.set(sale.operator, {
        operator: sale.operator,
        sales: (current?.sales ?? 0) + 1,
        revenue: (current?.revenue ?? 0) + sale.total,
      });
    }

    return Array.from(rows.values()).sort((a, b) => b.revenue - a.revenue);
  }, []);

  const paymentMethods = useMemo<PaymentMethodRow[]>(() => {
    const rows = new Map<PaymentMethod, PaymentMethodRow>();

    for (const transaction of initialPaymentTransactions) {
      if (transaction.status === "failed" || transaction.status === "refunded") {
        continue;
      }

      const current = rows.get(transaction.method);

      rows.set(transaction.method, {
        method: transaction.method,
        grossAmount: (current?.grossAmount ?? 0) + transaction.grossAmount,
        netAmount: (current?.netAmount ?? 0) + transaction.netAmount,
        transactions: (current?.transactions ?? 0) + 1,
      });
    }

    return Array.from(rows.values()).sort((a, b) => b.grossAmount - a.grossAmount);
  }, []);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return initialProducts.filter(
      (product) =>
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.barcode.includes(search),
    );
  }, [searchTerm]);

  return (
    <>
      <PageHeader
        eyebrow="Visao gerencial"
        title="Relatorios"
        description="Analise vendas, pagamentos, estoque, operadores e compras pendentes com dados consolidados do MVP."
        action={<StatusBadge label="Mock consolidado" tone="info" />}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Faturamento" value={formatCurrency(revenue)} />
        <SummaryCard label="Ticket medio" value={formatCurrency(averageTicket)} />
        <SummaryCard label="Liquido recebido" value={formatCurrency(netPayments)} />
        <SummaryCard label="Estoque em custo" value={formatCurrency(stockValue)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Painel rapido
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Indicadores principais para acompanhamento diario.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["overview", "Geral"],
                ["sales", "Vendas"],
                ["payments", "Pagamentos"],
                ["stock", "Estoque"],
                ["purchases", "Compras"],
              ].map(([view, label]) => (
                <Button
                  key={view}
                  type="button"
                  variant={activeView === view ? "default" : "outline"}
                  onClick={() => setActiveView(view as ReportView)}
                  className={
                    activeView === view
                      ? "bg-slate-950 text-white hover:bg-slate-800"
                      : ""
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <InsightCard
              icon={<ShoppingCart className="size-5" aria-hidden="true" />}
              label="Vendas abertas"
              value={String(openSales.length)}
              detail={formatCurrency(
                openSales.reduce((total, sale) => total + sale.total, 0),
              )}
            />
            <InsightCard
              icon={<CreditCard className="size-5" aria-hidden="true" />}
              label="Bruto aprovado"
              value={formatCurrency(grossPayments)}
              detail={`${paymentMethods.length} metodos usados`}
            />
            <InsightCard
              icon={<Package className="size-5" aria-hidden="true" />}
              label="Estoque baixo"
              value={String(lowStockProducts.length)}
              detail="Produtos abaixo do minimo"
            />
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <FileBarChart2 className="mt-0.5 size-5 shrink-0 text-amber-700" />
            <div>
              <h2 className="text-sm font-semibold text-amber-900">
                Proxima evolucao
              </h2>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Depois do banco real, estes relatorios devem aceitar periodo,
                loja, operador, caixa e exportacao.
              </p>
            </div>
          </div>
        </div>
      </section>

      {(activeView === "overview" || activeView === "sales") && (
        <section className="grid gap-4 xl:grid-cols-2">
          <ReportTable title="Produtos mais vendidos" description="Ranking por receita finalizada.">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Produto</th>
                  <th className="px-5 py-3 font-semibold">Qtd.</th>
                  <th className="px-5 py-3 font-semibold">Receita</th>
                  <th className="px-5 py-3 font-semibold">Participacao</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productSales.map((row) => (
                  <tr key={row.productId} className="text-slate-700">
                    <td className="px-5 py-4 font-medium text-slate-950">
                      {row.name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {row.quantity}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatCurrency(row.revenue)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatPercent(revenue > 0 ? (row.revenue / revenue) * 100 : 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ReportTable>

          <ReportTable title="Vendas por operador" description="Faturamento finalizado por responsavel.">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Operador</th>
                  <th className="px-5 py-3 font-semibold">Vendas</th>
                  <th className="px-5 py-3 font-semibold">Receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operatorSales.map((row) => (
                  <tr key={row.operator} className="text-slate-700">
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 font-medium text-slate-950">
                        <UserRound className="size-4 text-slate-400" aria-hidden="true" />
                        {row.operator}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">{row.sales}</td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatCurrency(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ReportTable>
        </section>
      )}

      {(activeView === "overview" || activeView === "payments") && (
        <ReportTable title="Pagamentos por metodo" description="Valores brutos, liquidos e perdas por taxa.">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Metodo</th>
                <th className="px-5 py-3 font-semibold">Transacoes</th>
                <th className="px-5 py-3 font-semibold">Bruto</th>
                <th className="px-5 py-3 font-semibold">Liquido</th>
                <th className="px-5 py-3 font-semibold">Taxas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paymentMethods.map((row) => (
                <tr key={row.method} className="text-slate-700">
                  <td className="px-5 py-4">
                    <StatusBadge
                      label={paymentMethodLabels[row.method]}
                      tone={row.method === "cash" || row.method === "pix" ? "success" : "info"}
                    />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {row.transactions}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {formatCurrency(row.grossAmount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-950">
                    {formatCurrency(row.netAmount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {formatCurrency(row.grossAmount - row.netAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportTable>
      )}

      {(activeView === "overview" || activeView === "stock") && (
        <ReportTable
          title="Estoque e alertas"
          description="Produtos filtraveis com saldo, minimo e valor de custo."
          action={
            <div className="relative w-full max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar produto"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          }
        >
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Produto</th>
                <th className="px-5 py-3 font-semibold">SKU</th>
                <th className="px-5 py-3 font-semibold">Atual</th>
                <th className="px-5 py-3 font-semibold">Minimo</th>
                <th className="px-5 py-3 font-semibold">Valor custo</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product: Product) => {
                const isLowStock = product.currentStock <= product.minimumStock;

                return (
                  <tr key={product.id} className="text-slate-700">
                    <td className="px-5 py-4 font-medium text-slate-950">
                      {product.name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {product.sku}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {product.currentStock}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {product.minimumStock}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatCurrency(product.currentStock * product.costPrice)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={isLowStock ? "Baixo" : "OK"}
                        tone={isLowStock ? "warning" : "success"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ReportTable>
      )}

      {(activeView === "overview" || activeView === "purchases") && (
        <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
          <ReportTable title="Compras pendentes" description="Pedidos ainda nao recebidos totalmente.">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Pedido</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Previsao</th>
                  <th className="px-5 py-3 font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialPurchaseOrders
                  .filter((purchaseOrder) => purchaseOrder.status !== "received")
                  .map((purchaseOrder) => (
                    <tr key={purchaseOrder.id} className="text-slate-700">
                      <td className="px-5 py-4 font-medium text-slate-950">
                        {purchaseOrder.code}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge
                          label={purchaseStatusLabels[purchaseOrder.status]}
                          tone={
                            purchaseOrder.status === "canceled"
                              ? "danger"
                              : "warning"
                          }
                        />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {purchaseOrder.expectedAt || "Sem previsao"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {formatCurrency(getPurchaseTotal(purchaseOrder.id))}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </ReportTable>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Boxes className="size-5 text-emerald-600" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Compras abertas
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Valor pendente de recebimento.
                </p>
              </div>
            </div>
            <p className="mt-5 text-3xl font-semibold text-slate-950">
              {formatCurrency(pendingPurchaseValue)}
            </p>
          </div>
        </section>
      )}

      {activeView === "sales" && (
        <ReportTable title="Vendas por caixa" description="Relaciona venda finalizada com a sessao e caixa.">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Venda</th>
                <th className="px-5 py-3 font-semibold">Caixa</th>
                <th className="px-5 py-3 font-semibold">Operador</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Finalizada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finishedSales.map((sale) => {
                const session = cashSessionById.get(sale.cashSessionId);
                const cashRegister = session
                  ? cashRegisterById.get(session.registerId)
                  : undefined;

                return (
                  <tr key={sale.id} className="text-slate-700">
                    <td className="px-5 py-4 font-medium text-slate-950">
                      {sale.code}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {cashRegister?.code ?? "Sem caixa"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {sale.operator}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {sale.finishedAt}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ReportTable>
      )}
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </article>
  );
}

function InsightCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-emerald-700">{icon}</div>
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </article>
  );
}

function ReportTable({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {action}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}
