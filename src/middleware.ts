import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const ROLE_ROUTES: Record<string, string[]> = {
  operator: ["/", "/pdv", "/vendas", "/caixas"],
  supervisor: ["/", "/supervisor"],
  estoque: ["/", "/admin/produtos", "/admin/secoes-categorias", "/admin/estoque", "/admin/compras", "/admin/fornecedores"],
  financeiro: ["/", "/admin/financeiro", "/admin/relatorios", "/admin/pagamentos", "/admin/auditoria", "/admin/caixas", "/admin/vendas", "/admin/compras"],
};

function isAllowed(role: string, pathname: string): boolean {
  if (role === "admin") return true;
  const allowed = ROLE_ROUTES[role] ?? [];
  return allowed.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  if (pathname === "/login") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = req.auth?.user?.role ?? "operator";
  if (!isAllowed(role, pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/auth).*)",
  ],
};
