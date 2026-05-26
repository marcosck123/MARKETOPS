"use client";

import type React from "react";
import {
  BadgeDollarSign,
  BarChart3,
  Boxes,
  Cable,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileBarChart2,
  Landmark,
  LogOut,
  Monitor,
  Package,
  Printer,
  QrCode,
  Rocket,
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
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  href?: string;
  roles: string[];
};

const navigationItems: NavItem[] = [
  { label: "Dashboard", icon: BarChart3, href: "/", roles: ["admin", "operator", "supervisor", "estoque", "financeiro"] },
  { label: "PDV", icon: Monitor, href: "/pdv", roles: ["admin", "operator"] },
  { label: "Caixas", icon: BadgeDollarSign, href: "/caixas", roles: ["admin", "operator"] },
  { label: "Vendas", icon: ShoppingCart, href: "/vendas", roles: ["admin", "operator"] },
  { label: "Vendas (fin.)", icon: ShoppingCart, href: "/admin/vendas", roles: ["admin", "financeiro"] },
  { label: "Caixas (fin.)", icon: BadgeDollarSign, href: "/admin/caixas", roles: ["admin", "financeiro"] },
  { label: "Fila NF / Chamados", icon: ClipboardList, href: "/supervisor", roles: ["admin", "supervisor"] },
  { label: "Clientes (NF)", icon: Users, href: "/supervisor/clientes", roles: ["admin", "supervisor"] },
  { label: "Produtos", icon: Package, href: "/admin/produtos", roles: ["admin", "estoque"] },
  { label: "Secoes e categorias", icon: Tags, href: "/admin/secoes-categorias", roles: ["admin", "estoque"] },
  { label: "Estoque", icon: Warehouse, href: "/admin/estoque", roles: ["admin", "estoque"] },
  { label: "Compras", icon: Boxes, href: "/admin/compras", roles: ["admin", "estoque", "financeiro"] },
  { label: "Fornecedores", icon: Truck, href: "/admin/fornecedores", roles: ["admin", "estoque"] },
  { label: "Financeiro", icon: Landmark, href: "/admin/financeiro", roles: ["admin", "financeiro"] },
  { label: "Pagamentos", icon: CreditCard, href: "/admin/pagamentos", roles: ["admin", "financeiro"] },
  { label: "Relatorios", icon: FileBarChart2, href: "/admin/relatorios", roles: ["admin", "financeiro"] },
  { label: "Auditoria", icon: ClipboardList, href: "/admin/auditoria", roles: ["admin", "financeiro"] },
  { label: "Usuarios", icon: Users, href: "/admin/usuarios", roles: ["admin"] },
  { label: "Seguranca", icon: ShieldCheck, href: "/admin/seguranca", roles: ["admin"] },
  { label: "Self-checkout", icon: QrCode, href: "/admin/self-checkout", roles: ["admin"] },
  { label: "Impressao", icon: Printer, href: "/admin/impressao", roles: ["admin"] },
  { label: "Integracoes", icon: Cable, href: "/admin/integracoes", roles: ["admin"] },
  { label: "Testes", icon: ClipboardCheck, href: "/admin/testes", roles: ["admin"] },
  { label: "Deploy", icon: Rocket, href: "/admin/deploy", roles: ["admin"] },
  { label: "Configuracoes", icon: Settings, href: "/admin/configuracoes", roles: ["admin"] },
];

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  operator: "Operador",
  supervisor: "Supervisor",
  estoque: "Estoque",
  financeiro: "Financeiro",
};

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const user = session?.user;
  const userInitial =
    user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U";
  const userName = user?.name ?? user?.email ?? "Usuario";
  const userRoleLabel = user?.role ? (roleLabels[user.role] ?? user.role) : null;
  const roleKey = user?.role ?? "operator";
  const visibleItems = navigationItems.filter((item) =>
    item.roles.includes(roleKey),
  );

  return (
    <aside
      className={`hidden min-h-screen flex-col border-r border-stone-200 bg-white text-stone-800 transition-all duration-300 dark:border-stone-800 dark:bg-stone-950 dark:text-white lg:flex ${
        collapsed ? "w-14" : "w-52"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-stone-200 dark:border-stone-800 ${collapsed ? "justify-center px-3 py-5" : "justify-between px-4 py-5"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-400 text-base font-bold text-stone-950">
              M
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-wide text-stone-900 dark:text-white" style={{ fontFamily: "var(--font-syne)" }}>
                MARKETOPS
              </p>
              <p className="truncate text-xs text-stone-500 dark:text-stone-400">Operacao ao caixa</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-400 text-base font-bold text-stone-950">
            M
          </div>
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="shrink-0 rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-900 dark:hover:text-stone-300"
            title="Recolher menu"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-900 dark:hover:text-stone-300"
          title="Expandir menu"
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      {/* Nav */}
      <nav className={`flex-1 space-y-0.5 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-3"}`}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === pathname;

          if (!item.href) {
            return (
              <span
                key={item.label}
                className={`flex cursor-not-allowed items-center rounded-lg py-2 text-sm font-medium text-stone-400 dark:text-stone-600 ${
                  collapsed ? "justify-center px-2" : "gap-3 px-3"
                }`}
                title={collapsed ? item.label : "Modulo planejado para as proximas etapas"}
              >
                <Icon className="size-4 shrink-0" aria-hidden={true} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-lg py-2 text-sm font-medium transition-colors ${
                collapsed ? "justify-center px-2" : "gap-3 px-3"
              } ${
                isActive
                  ? "bg-amber-400 text-stone-950"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-white"
              }`}
            >
              <Icon className="size-4 shrink-0" aria-hidden={true} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className={`border-t border-stone-200 dark:border-stone-800 ${collapsed ? "p-2" : "p-3"}`}>
        {user && (
          <div className={`flex items-center rounded-lg bg-stone-100 dark:bg-stone-900 ${
            collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"
          }`}>
            <div
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-400 text-sm font-bold text-stone-950"
              title={collapsed ? userName : undefined}
            >
              {userInitial}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-900 dark:text-white">
                    {userName}
                  </p>
                  {userRoleLabel && (
                    <p className="text-xs text-stone-500 dark:text-stone-400">{userRoleLabel}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void signOut({ callbackUrl: "/login" })}
                  className="shrink-0 rounded-md p-1.5 text-stone-500 transition hover:bg-stone-200 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-white"
                  title="Sair"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  <span className="sr-only">Sair</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
