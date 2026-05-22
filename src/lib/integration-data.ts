export type IntegrationKind =
  | "pix"
  | "tef"
  | "fiscal"
  | "scale"
  | "thermal_printer"
  | "webhook";

export type IntegrationStatus =
  | "configured"
  | "test_mode"
  | "pending"
  | "offline"
  | "error";

export type IntegrationHealth = "healthy" | "warning" | "critical";

export type IntegrationConnection = {
  id: string;
  name: string;
  kind: IntegrationKind;
  provider: string;
  status: IntegrationStatus;
  health: IntegrationHealth;
  storeName: string;
  lastSync: string;
  nextStep: string;
  enabled: boolean;
};

export type IntegrationEvent = {
  id: string;
  integrationId: string;
  integrationName: string;
  status: "success" | "warning" | "failed";
  message: string;
  occurredAt: string;
};

export type IntegrationRequirement = {
  id: string;
  title: string;
  area: IntegrationKind;
  done: boolean;
};

export const integrationKindLabels: Record<IntegrationKind, string> = {
  pix: "PIX automatico",
  tef: "TEF",
  fiscal: "Fiscal",
  scale: "Balanca",
  thermal_printer: "Impressora termica",
  webhook: "Webhook",
};

export const integrationStatusLabels: Record<IntegrationStatus, string> = {
  configured: "Configurado",
  test_mode: "Modo teste",
  pending: "Pendente",
  offline: "Offline",
  error: "Erro",
};

export const integrationHealthLabels: Record<IntegrationHealth, string> = {
  healthy: "Saudavel",
  warning: "Atencao",
  critical: "Critico",
};

export const initialIntegrationConnections: IntegrationConnection[] = [
  {
    id: "integration-pix",
    name: "PIX banco parceiro",
    kind: "pix",
    provider: "Banco parceiro",
    status: "test_mode",
    health: "healthy",
    storeName: "Loja Matriz",
    lastSync: "22/05/2026 09:08",
    nextStep: "Validar webhook de confirmacao",
    enabled: true,
  },
  {
    id: "integration-tef",
    name: "TEF adquirente A",
    kind: "tef",
    provider: "Adquirente A",
    status: "pending",
    health: "warning",
    storeName: "Todas as lojas",
    lastSync: "Nao sincronizado",
    nextStep: "Cadastrar terminal e credenciais",
    enabled: false,
  },
  {
    id: "integration-fiscal",
    name: "NFC-e homologacao",
    kind: "fiscal",
    provider: "SEFAZ",
    status: "pending",
    health: "warning",
    storeName: "Loja Matriz",
    lastSync: "Nao sincronizado",
    nextStep: "Enviar certificado digital",
    enabled: false,
  },
  {
    id: "integration-scale",
    name: "Balanca checkout",
    kind: "scale",
    provider: "Serial/USB",
    status: "offline",
    health: "critical",
    storeName: "Loja Matriz",
    lastSync: "22/05/2026 08:41",
    nextStep: "Conferir porta local",
    enabled: false,
  },
  {
    id: "integration-printer",
    name: "Termica ESC/POS",
    kind: "thermal_printer",
    provider: "Driver local",
    status: "configured",
    health: "healthy",
    storeName: "Loja Matriz",
    lastSync: "22/05/2026 09:17",
    nextStep: "Teste de corte de papel",
    enabled: true,
  },
  {
    id: "integration-webhook",
    name: "Eventos externos",
    kind: "webhook",
    provider: "MARKETOPS API",
    status: "test_mode",
    health: "healthy",
    storeName: "Todas as lojas",
    lastSync: "22/05/2026 09:02",
    nextStep: "Definir assinatura HMAC",
    enabled: true,
  },
];

export const initialIntegrationEvents: IntegrationEvent[] = [
  {
    id: "integration-event-1001",
    integrationId: "integration-pix",
    integrationName: "PIX banco parceiro",
    status: "success",
    message: "Webhook de pagamento recebido em ambiente de teste.",
    occurredAt: "22/05/2026 09:08",
  },
  {
    id: "integration-event-1002",
    integrationId: "integration-scale",
    integrationName: "Balanca checkout",
    status: "failed",
    message: "Terminal nao encontrou porta serial configurada.",
    occurredAt: "22/05/2026 08:41",
  },
  {
    id: "integration-event-1003",
    integrationId: "integration-printer",
    integrationName: "Termica ESC/POS",
    status: "success",
    message: "Impressao de teste enviada para o spool local.",
    occurredAt: "22/05/2026 09:17",
  },
  {
    id: "integration-event-1004",
    integrationId: "integration-fiscal",
    integrationName: "NFC-e homologacao",
    status: "warning",
    message: "Certificado digital pendente para ambiente fiscal.",
    occurredAt: "22/05/2026 08:22",
  },
];

export const initialIntegrationRequirements: IntegrationRequirement[] = [
  {
    id: "requirement-pix-webhook",
    title: "Definir URL publica para retorno PIX",
    area: "pix",
    done: true,
  },
  {
    id: "requirement-pix-secret",
    title: "Configurar segredo de validacao PIX",
    area: "pix",
    done: false,
  },
  {
    id: "requirement-tef-terminal",
    title: "Vincular terminais TEF por caixa",
    area: "tef",
    done: false,
  },
  {
    id: "requirement-fiscal-cert",
    title: "Enviar certificado digital fiscal",
    area: "fiscal",
    done: false,
  },
  {
    id: "requirement-scale-port",
    title: "Mapear porta local da balanca",
    area: "scale",
    done: false,
  },
  {
    id: "requirement-printer-driver",
    title: "Validar driver ESC/POS",
    area: "thermal_printer",
    done: true,
  },
];
