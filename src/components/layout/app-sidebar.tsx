"use client";

import type React from "react";
import {
  BadgeDollarSign,
  BarChart3,
  Boxes,
  Cable,
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
};

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
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
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === pathname;
          const content = (
            <>
              <span className="flex items-center gap-3">
                <Icon className="size-4" aria-hidden={true} />
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

      <div className="border-t border-slate-800 p-4 space-y-3">
        {user && (
          <div className="flex items-center gap-3 rounded-lg bg-slate-900 px-3 py-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500 text-sm font-bold text-slate-950">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {userName}
              </p>
              {userRoleLabel && (
                <p className="text-xs text-slate-400">{userRoleLabel}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: "/login" })}
              className="shrink-0 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              title="Sair"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="sr-only">Sair</span>
            </button>
          </div>
        )}

        <div className="rounded-lg bg-slate-900 p-4">
          <p className="text-sm font-medium text-white">MVP 2</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Persistencia real com Prisma, autenticacao e controle de acesso.
          </p>
        </div>
      </div>
    </aside>
  );
}
