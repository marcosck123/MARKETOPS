"use client";

import {
  BadgeDollarSign,
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  FileBarChart2,
  Landmark,
  Monitor,
  Package,
  QrCode,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { label: "Dashboard", icon: BarChart3, href: "/" },
  { label: "Secoes e categorias", icon: Tags, href: "/secoes-categorias" },
  { label: "Produtos", icon: Package, href: "/produtos" },
  { label: "Estoque", icon: Warehouse, href: "/estoque" },
  { label: "Compras", icon: Boxes, href: "/compras" },
  { label: "Vendas", icon: ShoppingCart, href: "/vendas" },
  { label: "PDV", icon: Monitor, href: "/pdv" },
  { label: "Pagamentos", icon: CreditCard, href: "/pagamentos" },
  { label: "Caixas", icon: BadgeDollarSign, href: "/caixas" },
  { label: "Clientes", icon: Users, href: "/clientes" },
  { label: "Fornecedores", icon: Truck, href: "/fornecedores" },
  { label: "Financeiro", icon: Landmark, href: "/financeiro" },
  { label: "Relatorios", icon: FileBarChart2, href: "/relatorios" },
  { label: "Auditoria", icon: ClipboardList, href: "/auditoria" },
  { label: "Seguranca", icon: ShieldCheck, href: "/seguranca" },
  { label: "Self-checkout", icon: QrCode, href: "/self-checkout" },
  { label: "Configuracoes", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen border-r border-slate-800 bg-slate-950 text-white lg:flex lg:flex-col">
      <div className="border-b border-slate-800 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500 text-lg font-bold text-slate-950">
            M
          </div>
          <div>
            <p className="text-lg font-semibold">MARKETOPS</p>
            <p className="text-xs text-slate-400">Operacao ao caixa</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === pathname;
          const content = (
            <>
              <span className="flex items-center gap-3">
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </span>
              {isActive ? (
                <span className="h-2 w-2 rounded-full bg-slate-950" />
              ) : null}
            </>
          );

          if (!item.href) {
            return (
              <span
                key={item.label}
                className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500"
                title="Modulo planejado para as proximas etapas"
              >
                {content}
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="rounded-lg bg-slate-900 p-4">
          <p className="text-sm font-medium text-white">MVP 1</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Base administrativa, produtos, estoque e caixas.
          </p>
        </div>
      </div>
    </aside>
  );
}
