export type TestArea =
  | "build"
  | "sales"
  | "stock"
  | "pos"
  | "self_checkout"
  | "finance"
  | "security"
  | "integrations";

export type TestCaseStatus = "passed" | "pending" | "blocked" | "failed";

export type TestCasePriority = "low" | "medium" | "high";

export type TestCase = {
  id: string;
  code: string;
  title: string;
  area: TestArea;
  status: TestCaseStatus;
  priority: TestCasePriority;
  owner: string;
  command: string;
  evidence: string;
};

export type TestRun = {
  id: string;
  title: string;
  status: TestCaseStatus;
  startedAt: string;
  finishedAt: string;
  summary: string;
};

export const testAreaLabels: Record<TestArea, string> = {
  build: "Build e lint",
  sales: "Motor de venda",
  stock: "Estoque",
  pos: "PDV",
  self_checkout: "Self-checkout",
  finance: "Financeiro",
  security: "Seguranca",
  integrations: "Integracoes",
};

export const testCaseStatusLabels: Record<TestCaseStatus, string> = {
  passed: "Passou",
  pending: "Pendente",
  blocked: "Bloqueado",
  failed: "Falhou",
};

export const testCasePriorityLabels: Record<TestCasePriority, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
};

export const initialTestCases: TestCase[] = [
  {
    id: "test-build",
    code: "TST-001",
    title: "Executar build de producao",
    area: "build",
    status: "blocked",
    priority: "high",
    owner: "Dev",
    command: "npm run build",
    evidence: "Aguardando node/npm ou Docker disponivel.",
  },
  {
    id: "test-lint",
    code: "TST-002",
    title: "Executar lint",
    area: "build",
    status: "blocked",
    priority: "high",
    owner: "Dev",
    command: "npm run lint",
    evidence: "Aguardando node/npm ou Docker disponivel.",
  },
  {
    id: "test-sale-engine-finish",
    code: "TST-003",
    title: "Finalizar venda com pagamento aprovado",
    area: "sales",
    status: "pending",
    priority: "high",
    owner: "Produto",
    command: "Fluxo manual no PDV",
    evidence: "Validar total, pagamento e status finalizado.",
  },
  {
    id: "test-stock-decrease",
    code: "TST-004",
    title: "Baixar estoque apos venda finalizada",
    area: "stock",
    status: "pending",
    priority: "high",
    owner: "Estoque",
    command: "Fluxo manual no PDV",
    evidence: "Conferir saldo antes e depois da venda.",
  },
  {
    id: "test-pos-empty-sale",
    code: "TST-005",
    title: "Bloquear finalizacao sem itens",
    area: "pos",
    status: "pending",
    priority: "medium",
    owner: "Caixa",
    command: "Fluxo manual no PDV",
    evidence: "Mensagem de erro deve aparecer.",
  },
  {
    id: "test-self-payment",
    code: "TST-006",
    title: "Finalizar compra no self-checkout",
    area: "self_checkout",
    status: "pending",
    priority: "high",
    owner: "Operacao",
    command: "Fluxo manual no self-checkout",
    evidence: "Carrinho, pagamento e nova compra.",
  },
  {
    id: "test-finance-entry",
    code: "TST-007",
    title: "Criar lancamento financeiro manual",
    area: "finance",
    status: "pending",
    priority: "medium",
    owner: "Financeiro",
    command: "Fluxo manual em /financeiro",
    evidence: "Lancamento deve aparecer no fluxo.",
  },
  {
    id: "test-security-block",
    code: "TST-008",
    title: "Bloquear e desbloquear usuario",
    area: "security",
    status: "pending",
    priority: "medium",
    owner: "Admin",
    command: "Fluxo manual em /seguranca",
    evidence: "Status deve alternar sem remover usuario.",
  },
  {
    id: "test-integration-pix",
    code: "TST-009",
    title: "Simular teste de integracao PIX",
    area: "integrations",
    status: "pending",
    priority: "medium",
    owner: "Dev",
    command: "Botao Testar em /integracoes",
    evidence: "Evento de sucesso deve ser registrado.",
  },
];

export const initialTestRuns: TestRun[] = [
  {
    id: "run-static-review",
    title: "Revisao estatica sem Docker",
    status: "passed",
    startedAt: "22/05/2026 09:00",
    finishedAt: "22/05/2026 09:12",
    summary: "Arquivos novos revisados por busca estatica.",
  },
  {
    id: "run-build-local",
    title: "Build local",
    status: "blocked",
    startedAt: "22/05/2026 09:13",
    finishedAt: "",
    summary: "node e npm nao encontrados no PATH.",
  },
];
