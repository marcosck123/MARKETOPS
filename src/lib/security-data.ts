export type SecurityRole =
  | "ADMIN"
  | "GERENTE"
  | "CAIXA"
  | "ESTOQUE"
  | "FINANCEIRO"
  | "SUPORTE";

export type SecurityUserStatus = "active" | "blocked" | "invited";

export type PermissionArea =
  | "dashboard"
  | "catalog"
  | "stock"
  | "purchases"
  | "sales"
  | "pos"
  | "cash"
  | "payments"
  | "finance"
  | "reports"
  | "audit"
  | "security";

export type PermissionLevel = "none" | "read" | "write" | "approve" | "admin";

export type SecurityUser = {
  id: string;
  name: string;
  email: string;
  role: SecurityRole;
  status: SecurityUserStatus;
  storeName: string;
  mfaEnabled: boolean;
  lastAccess: string;
  failedAttempts: number;
  riskScore: number;
};

export type SecuritySessionStatus = "active" | "expired" | "revoked";

export type SecuritySession = {
  id: string;
  userId: string;
  userName: string;
  status: SecuritySessionStatus;
  device: string;
  ipAddress: string;
  storeName: string;
  startedAt: string;
  lastActivity: string;
};

export type SecurityPolicy = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  impact: "low" | "medium" | "high";
};

export type RolePermission = {
  role: SecurityRole;
  permissions: Record<PermissionArea, PermissionLevel>;
};

export const securityRoleLabels: Record<SecurityRole, string> = {
  ADMIN: "Admin",
  GERENTE: "Gerente",
  CAIXA: "Caixa",
  ESTOQUE: "Estoque",
  FINANCEIRO: "Financeiro",
  SUPORTE: "Suporte",
};

export const securityUserStatusLabels: Record<SecurityUserStatus, string> = {
  active: "Ativo",
  blocked: "Bloqueado",
  invited: "Convidado",
};

export const securitySessionStatusLabels: Record<SecuritySessionStatus, string> = {
  active: "Ativa",
  expired: "Expirada",
  revoked: "Revogada",
};

export const permissionAreaLabels: Record<PermissionArea, string> = {
  dashboard: "Dashboard",
  catalog: "Cadastros",
  stock: "Estoque",
  purchases: "Compras",
  sales: "Vendas",
  pos: "PDV",
  cash: "Caixas",
  payments: "Pagamentos",
  finance: "Financeiro",
  reports: "Relatorios",
  audit: "Auditoria",
  security: "Seguranca",
};

export const permissionLevelLabels: Record<PermissionLevel, string> = {
  none: "Sem acesso",
  read: "Leitura",
  write: "Edicao",
  approve: "Aprovacao",
  admin: "Total",
};

export const initialSecurityUsers: SecurityUser[] = [
  {
    id: "user-1001",
    name: "Ana Silva",
    email: "ana.silva@marketops.local",
    role: "ADMIN",
    status: "active",
    storeName: "Loja Matriz",
    mfaEnabled: true,
    lastAccess: "20/05/2026 15:58",
    failedAttempts: 0,
    riskScore: 12,
  },
  {
    id: "user-1002",
    name: "Marina Costa",
    email: "marina.costa@marketops.local",
    role: "FINANCEIRO",
    status: "active",
    storeName: "Loja Matriz",
    mfaEnabled: true,
    lastAccess: "20/05/2026 14:33",
    failedAttempts: 0,
    riskScore: 18,
  },
  {
    id: "user-1003",
    name: "Pedro Rocha",
    email: "pedro.rocha@marketops.local",
    role: "CAIXA",
    status: "active",
    storeName: "Loja Centro",
    mfaEnabled: false,
    lastAccess: "20/05/2026 12:11",
    failedAttempts: 1,
    riskScore: 42,
  },
  {
    id: "user-1004",
    name: "Carlos Mendes",
    email: "carlos.mendes@marketops.local",
    role: "ESTOQUE",
    status: "active",
    storeName: "Loja Matriz",
    mfaEnabled: false,
    lastAccess: "20/05/2026 09:26",
    failedAttempts: 0,
    riskScore: 28,
  },
  {
    id: "user-1005",
    name: "Suporte Interno",
    email: "suporte@marketops.local",
    role: "SUPORTE",
    status: "blocked",
    storeName: "Todas as lojas",
    mfaEnabled: true,
    lastAccess: "19/05/2026 17:44",
    failedAttempts: 3,
    riskScore: 78,
  },
  {
    id: "user-1006",
    name: "Beatriz Nunes",
    email: "beatriz.nunes@marketops.local",
    role: "GERENTE",
    status: "invited",
    storeName: "Loja Centro",
    mfaEnabled: false,
    lastAccess: "Convite pendente",
    failedAttempts: 0,
    riskScore: 8,
  },
];

export const initialSecuritySessions: SecuritySession[] = [
  {
    id: "session-9001",
    userId: "user-1001",
    userName: "Ana Silva",
    status: "active",
    device: "Terminal gerencia",
    ipAddress: "192.168.0.24",
    storeName: "Loja Matriz",
    startedAt: "20/05/2026 08:01",
    lastActivity: "20/05/2026 15:58",
  },
  {
    id: "session-9002",
    userId: "user-1002",
    userName: "Marina Costa",
    status: "active",
    device: "Desktop financeiro",
    ipAddress: "192.168.0.41",
    storeName: "Loja Matriz",
    startedAt: "20/05/2026 09:02",
    lastActivity: "20/05/2026 14:33",
  },
  {
    id: "session-9003",
    userId: "user-1003",
    userName: "Pedro Rocha",
    status: "active",
    device: "Terminal caixa 02",
    ipAddress: "192.168.1.14",
    storeName: "Loja Centro",
    startedAt: "20/05/2026 07:58",
    lastActivity: "20/05/2026 12:11",
  },
  {
    id: "session-9004",
    userId: "user-1005",
    userName: "Suporte Interno",
    status: "revoked",
    device: "Console suporte",
    ipAddress: "192.168.1.55",
    storeName: "Loja Centro",
    startedAt: "19/05/2026 16:40",
    lastActivity: "19/05/2026 17:44",
  },
];

export const initialSecurityPolicies: SecurityPolicy[] = [
  {
    id: "policy-mfa-admin",
    title: "MFA para cargos sensiveis",
    description: "Exige segundo fator para Admin, Financeiro e Suporte.",
    enabled: true,
    impact: "high",
  },
  {
    id: "policy-lockout",
    title: "Bloqueio por tentativas",
    description: "Bloqueia usuario apos tres falhas consecutivas de login.",
    enabled: true,
    impact: "high",
  },
  {
    id: "policy-session-timeout",
    title: "Expiracao de sessao",
    description: "Encerra sessoes administrativas sem atividade por 30 minutos.",
    enabled: true,
    impact: "medium",
  },
  {
    id: "policy-critical-confirm",
    title: "Confirmacao em acoes criticas",
    description: "Pede confirmacao para excluir, cancelar, estornar e fechar caixa.",
    enabled: true,
    impact: "medium",
  },
  {
    id: "policy-ip-allowlist",
    title: "Restricao por rede",
    description: "Permite acesso administrativo somente pelas redes autorizadas.",
    enabled: false,
    impact: "high",
  },
];

export const rolePermissions: RolePermission[] = [
  {
    role: "ADMIN",
    permissions: {
      dashboard: "admin",
      catalog: "admin",
      stock: "admin",
      purchases: "admin",
      sales: "admin",
      pos: "admin",
      cash: "admin",
      payments: "admin",
      finance: "admin",
      reports: "admin",
      audit: "admin",
      security: "admin",
    },
  },
  {
    role: "GERENTE",
    permissions: {
      dashboard: "read",
      catalog: "write",
      stock: "approve",
      purchases: "approve",
      sales: "approve",
      pos: "read",
      cash: "approve",
      payments: "read",
      finance: "read",
      reports: "read",
      audit: "read",
      security: "none",
    },
  },
  {
    role: "CAIXA",
    permissions: {
      dashboard: "none",
      catalog: "read",
      stock: "read",
      purchases: "none",
      sales: "write",
      pos: "write",
      cash: "write",
      payments: "write",
      finance: "none",
      reports: "none",
      audit: "none",
      security: "none",
    },
  },
  {
    role: "ESTOQUE",
    permissions: {
      dashboard: "none",
      catalog: "read",
      stock: "write",
      purchases: "read",
      sales: "none",
      pos: "none",
      cash: "none",
      payments: "none",
      finance: "none",
      reports: "read",
      audit: "none",
      security: "none",
    },
  },
  {
    role: "FINANCEIRO",
    permissions: {
      dashboard: "read",
      catalog: "read",
      stock: "none",
      purchases: "read",
      sales: "read",
      pos: "none",
      cash: "read",
      payments: "approve",
      finance: "write",
      reports: "read",
      audit: "read",
      security: "none",
    },
  },
  {
    role: "SUPORTE",
    permissions: {
      dashboard: "read",
      catalog: "read",
      stock: "read",
      purchases: "read",
      sales: "read",
      pos: "none",
      cash: "read",
      payments: "read",
      finance: "read",
      reports: "read",
      audit: "read",
      security: "read",
    },
  },
];
