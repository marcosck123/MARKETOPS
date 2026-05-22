export type AuditModule =
  | "auth"
  | "catalog"
  | "stock"
  | "purchase"
  | "sale"
  | "cash"
  | "payment"
  | "finance";

export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "approved"
  | "canceled"
  | "opened"
  | "closed"
  | "login"
  | "failed_login";

export type AuditSeverity = "info" | "warning" | "critical";

export type AuditReviewStatus = "pending" | "reviewed" | "ignored";

export type AuditLog = {
  id: string;
  code: string;
  module: AuditModule;
  action: AuditAction;
  severity: AuditSeverity;
  reviewStatus: AuditReviewStatus;
  actorName: string;
  actorRole: string;
  storeName: string;
  target: string;
  targetId: string;
  description: string;
  before: string;
  after: string;
  occurredAt: string;
  ipAddress: string;
  device: string;
};

export const auditModuleLabels: Record<AuditModule, string> = {
  auth: "Acesso",
  catalog: "Cadastros",
  stock: "Estoque",
  purchase: "Compras",
  sale: "Vendas",
  cash: "Caixas",
  payment: "Pagamentos",
  finance: "Financeiro",
};

export const auditActionLabels: Record<AuditAction, string> = {
  created: "Criou",
  updated: "Alterou",
  deleted: "Excluiu",
  approved: "Aprovou",
  canceled: "Cancelou",
  opened: "Abriu",
  closed: "Fechou",
  login: "Login",
  failed_login: "Login falhou",
};

export const auditSeverityLabels: Record<AuditSeverity, string> = {
  info: "Informativo",
  warning: "Atencao",
  critical: "Critico",
};

export const auditReviewStatusLabels: Record<AuditReviewStatus, string> = {
  pending: "Pendente",
  reviewed: "Revisado",
  ignored: "Ignorado",
};

export const initialAuditLogs: AuditLog[] = [
  {
    id: "audit-1001",
    code: "LOG-1001",
    module: "cash",
    action: "opened",
    severity: "info",
    reviewStatus: "reviewed",
    actorName: "Ana Silva",
    actorRole: "Gerente",
    storeName: "Loja Matriz",
    target: "Caixa PDV-01",
    targetId: "cash-001",
    description: "Sessao de caixa aberta com valor inicial conferido.",
    before: "Sessao fechada",
    after: "Sessao aberta com R$ 300,00",
    occurredAt: "20/05/2026 08:02",
    ipAddress: "192.168.0.24",
    device: "Terminal caixa 01",
  },
  {
    id: "audit-1002",
    code: "LOG-1002",
    module: "stock",
    action: "updated",
    severity: "warning",
    reviewStatus: "pending",
    actorName: "Carlos Mendes",
    actorRole: "Estoque",
    storeName: "Loja Matriz",
    target: "Arroz Tipo 1 5kg",
    targetId: "prod-001",
    description: "Ajuste manual reduziu saldo sem pedido de compra vinculado.",
    before: "128 unidades",
    after: "116 unidades",
    occurredAt: "20/05/2026 09:21",
    ipAddress: "192.168.0.32",
    device: "Notebook estoque",
  },
  {
    id: "audit-1003",
    code: "LOG-1003",
    module: "payment",
    action: "approved",
    severity: "info",
    reviewStatus: "reviewed",
    actorName: "Sistema MARKETOPS",
    actorRole: "Sistema",
    storeName: "Loja Matriz",
    target: "VEN-1003",
    targetId: "sale-1003",
    description: "Pagamento em credito aprovado pela adquirente simulada.",
    before: "Pendente",
    after: "Aprovado",
    occurredAt: "20/05/2026 10:42",
    ipAddress: "10.0.0.12",
    device: "Gateway pagamento",
  },
  {
    id: "audit-1004",
    code: "LOG-1004",
    module: "sale",
    action: "canceled",
    severity: "warning",
    reviewStatus: "pending",
    actorName: "Pedro Rocha",
    actorRole: "Caixa",
    storeName: "Loja Centro",
    target: "VEN-1006",
    targetId: "sale-1006",
    description: "Venda cancelada apos tentativa de pagamento PIX recusada.",
    before: "Venda aguardando pagamento",
    after: "Venda cancelada",
    occurredAt: "20/05/2026 12:10",
    ipAddress: "192.168.1.14",
    device: "Terminal caixa 02",
  },
  {
    id: "audit-1005",
    code: "LOG-1005",
    module: "finance",
    action: "created",
    severity: "info",
    reviewStatus: "pending",
    actorName: "Marina Costa",
    actorRole: "Financeiro",
    storeName: "Loja Matriz",
    target: "LCT-3005",
    targetId: "fin-3005",
    description: "Lancamento manual de despesa operacional criado.",
    before: "Sem lancamento",
    after: "Despesa agendada para 22/05/2026",
    occurredAt: "20/05/2026 13:35",
    ipAddress: "192.168.0.41",
    device: "Desktop financeiro",
  },
  {
    id: "audit-1006",
    code: "LOG-1006",
    module: "auth",
    action: "failed_login",
    severity: "critical",
    reviewStatus: "pending",
    actorName: "usuario.desconhecido",
    actorRole: "Nao identificado",
    storeName: "Loja Matriz",
    target: "Painel administrativo",
    targetId: "auth-admin",
    description: "Tres tentativas de login falharam em menos de cinco minutos.",
    before: "Acesso bloqueado",
    after: "Bloqueio temporario aplicado",
    occurredAt: "20/05/2026 14:06",
    ipAddress: "189.46.21.77",
    device: "Navegador externo",
  },
  {
    id: "audit-1007",
    code: "LOG-1007",
    module: "purchase",
    action: "approved",
    severity: "info",
    reviewStatus: "reviewed",
    actorName: "Ana Silva",
    actorRole: "Gerente",
    storeName: "Loja Matriz",
    target: "PED-2004",
    targetId: "purchase-2004",
    description: "Pedido de compra aprovado para envio ao fornecedor.",
    before: "Rascunho",
    after: "Enviado ao fornecedor",
    occurredAt: "20/05/2026 14:28",
    ipAddress: "192.168.0.24",
    device: "Terminal gerencia",
  },
  {
    id: "audit-1008",
    code: "LOG-1008",
    module: "catalog",
    action: "deleted",
    severity: "critical",
    reviewStatus: "pending",
    actorName: "Suporte Interno",
    actorRole: "Suporte",
    storeName: "Loja Centro",
    target: "Categoria temporaria",
    targetId: "cat-temp",
    description: "Categoria inativa removida por suporte administrativo.",
    before: "Categoria inativa",
    after: "Registro removido",
    occurredAt: "20/05/2026 15:12",
    ipAddress: "192.168.1.55",
    device: "Console suporte",
  },
  {
    id: "audit-1009",
    code: "LOG-1009",
    module: "cash",
    action: "closed",
    severity: "warning",
    reviewStatus: "pending",
    actorName: "Pedro Rocha",
    actorRole: "Caixa",
    storeName: "Loja Centro",
    target: "Caixa PDV-02",
    targetId: "cash-002",
    description: "Fechamento registrado com diferenca acima do limite interno.",
    before: "Saldo esperado R$ 1.842,70",
    after: "Saldo contado R$ 1.812,70",
    occurredAt: "20/05/2026 18:11",
    ipAddress: "192.168.1.14",
    device: "Terminal caixa 02",
  },
];
