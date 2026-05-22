export type DeployEnvironment = "local" | "preview" | "production";

export type DeployItemStatus = "done" | "pending" | "blocked";

export type DeployServiceKind = "frontend" | "database" | "auth" | "storage" | "monitoring";

export type DeployChecklistItem = {
  id: string;
  title: string;
  environment: DeployEnvironment;
  status: DeployItemStatus;
  owner: string;
  notes: string;
};

export type DeployService = {
  id: string;
  name: string;
  kind: DeployServiceKind;
  provider: string;
  environment: DeployEnvironment;
  status: DeployItemStatus;
  url: string;
};

export type DeployVariable = {
  id: string;
  key: string;
  required: boolean;
  configured: boolean;
  environment: DeployEnvironment;
  description: string;
};

export const deployEnvironmentLabels: Record<DeployEnvironment, string> = {
  local: "Local",
  preview: "Preview",
  production: "Producao",
};

export const deployItemStatusLabels: Record<DeployItemStatus, string> = {
  done: "Concluido",
  pending: "Pendente",
  blocked: "Bloqueado",
};

export const deployServiceKindLabels: Record<DeployServiceKind, string> = {
  frontend: "Frontend",
  database: "Banco de dados",
  auth: "Autenticacao",
  storage: "Arquivos",
  monitoring: "Monitoramento",
};

export const initialDeployChecklist: DeployChecklistItem[] = [
  {
    id: "deploy-check-build",
    title: "Build de producao validado",
    environment: "preview",
    status: "blocked",
    owner: "Dev",
    notes: "Aguardando node/npm no PATH ou Docker liberado.",
  },
  {
    id: "deploy-check-env",
    title: "Variaveis obrigatorias configuradas",
    environment: "preview",
    status: "pending",
    owner: "Dev",
    notes: "Criar valores reais fora do repositorio.",
  },
  {
    id: "deploy-check-db",
    title: "Banco PostgreSQL provisionado",
    environment: "preview",
    status: "pending",
    owner: "Infra",
    notes: "Supabase ou Neon ainda nao conectado.",
  },
  {
    id: "deploy-check-auth",
    title: "Autenticacao real habilitada",
    environment: "preview",
    status: "pending",
    owner: "Dev",
    notes: "Supabase Auth planejado para MVP 2.",
  },
  {
    id: "deploy-check-domain",
    title: "Dominio e HTTPS",
    environment: "production",
    status: "pending",
    owner: "Infra",
    notes: "Definir dominio da operacao.",
  },
  {
    id: "deploy-check-observability",
    title: "Logs e monitoramento",
    environment: "production",
    status: "pending",
    owner: "Suporte",
    notes: "Adicionar rastreio de erros antes do uso real.",
  },
];

export const initialDeployServices: DeployService[] = [
  {
    id: "deploy-service-frontend",
    name: "MARKETOPS Web",
    kind: "frontend",
    provider: "Vercel",
    environment: "preview",
    status: "pending",
    url: "https://preview.marketops.app",
  },
  {
    id: "deploy-service-db",
    name: "PostgreSQL",
    kind: "database",
    provider: "Supabase ou Neon",
    environment: "preview",
    status: "pending",
    url: "A definir",
  },
  {
    id: "deploy-service-auth",
    name: "Auth",
    kind: "auth",
    provider: "Supabase Auth",
    environment: "preview",
    status: "pending",
    url: "A definir",
  },
  {
    id: "deploy-service-storage",
    name: "Storage",
    kind: "storage",
    provider: "Supabase Storage",
    environment: "production",
    status: "pending",
    url: "A definir",
  },
  {
    id: "deploy-service-monitoring",
    name: "Monitoramento",
    kind: "monitoring",
    provider: "Vercel Analytics",
    environment: "production",
    status: "pending",
    url: "A definir",
  },
];

export const initialDeployVariables: DeployVariable[] = [
  {
    id: "deploy-var-public-url",
    key: "NEXT_PUBLIC_APP_URL",
    required: true,
    configured: false,
    environment: "preview",
    description: "URL publica usada por comprovantes e callbacks.",
  },
  {
    id: "deploy-var-db-url",
    key: "DATABASE_URL",
    required: true,
    configured: false,
    environment: "preview",
    description: "Conexao PostgreSQL para persistencia real.",
  },
  {
    id: "deploy-var-supabase-url",
    key: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    configured: false,
    environment: "preview",
    description: "URL do projeto Supabase.",
  },
  {
    id: "deploy-var-supabase-key",
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: true,
    configured: false,
    environment: "preview",
    description: "Chave publica anonima do Supabase.",
  },
  {
    id: "deploy-var-fiscal-mode",
    key: "MARKETOPS_FISCAL_MODE",
    required: false,
    configured: false,
    environment: "production",
    description: "Modo futuro para fiscal homologacao/producao.",
  },
];
