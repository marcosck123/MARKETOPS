import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    const adminRoutes = [
      "produtos",
      "secoes-categorias",
      "estoque",
      "compras",
      "fornecedores",
      "clientes",
      "pagamentos",
      "financeiro",
      "relatorios",
      "auditoria",
      "seguranca",
      "self-checkout",
      "impressao",
      "integracoes",
      "testes",
      "deploy",
    ];
    return adminRoutes.map((route) => ({
      source: `/${route}`,
      destination: `/admin/${route}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
