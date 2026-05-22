export type FinanceEntryType = "income" | "expense" | "transfer";

export type FinanceEntryStatus =
  | "scheduled"
  | "paid"
  | "overdue"
  | "canceled";

export type FinanceAccountKind = "cash" | "bank" | "card" | "credit";

export type FinanceAccount = {
  id: string;
  name: string;
  kind: FinanceAccountKind;
  balance: number;
  status: "active" | "inactive";
};

export type FinanceCategory = {
  id: string;
  name: string;
  type: FinanceEntryType;
};

export type FinanceEntry = {
  id: string;
  code: string;
  type: FinanceEntryType;
  description: string;
  categoryId: string;
  accountId: string;
  party: string;
  amount: number;
  dueAt: string;
  paidAt: string;
  status: FinanceEntryStatus;
  source: string;
  notes: string;
};

export const financeEntryTypeLabels: Record<FinanceEntryType, string> = {
  income: "Receita",
  expense: "Despesa",
  transfer: "Transferencia",
};

export const financeStatusLabels: Record<FinanceEntryStatus, string> = {
  scheduled: "Agendado",
  paid: "Pago",
  overdue: "Vencido",
  canceled: "Cancelado",
};

export const financeAccountKindLabels: Record<FinanceAccountKind, string> = {
  cash: "Caixa",
  bank: "Banco",
  card: "Cartao",
  credit: "Credito cliente",
};

export const initialFinanceAccounts: FinanceAccount[] = [
  {
    id: "conta-caixa-matriz",
    name: "Caixa loja matriz",
    kind: "cash",
    balance: 4380.5,
    status: "active",
  },
  {
    id: "conta-banco-principal",
    name: "Banco principal",
    kind: "bank",
    balance: 18540.2,
    status: "active",
  },
  {
    id: "conta-adquirente",
    name: "Adquirente cartoes",
    kind: "card",
    balance: 817.54,
    status: "active",
  },
  {
    id: "conta-clientes",
    name: "Credito de clientes",
    kind: "credit",
    balance: 6341.25,
    status: "active",
  },
];

export const initialFinanceCategories: FinanceCategory[] = [
  {
    id: "vendas-pdv",
    name: "Vendas PDV",
    type: "income",
  },
  {
    id: "recebimento-cliente",
    name: "Recebimento cliente",
    type: "income",
  },
  {
    id: "compras-mercadorias",
    name: "Compras de mercadorias",
    type: "expense",
  },
  {
    id: "despesas-operacionais",
    name: "Despesas operacionais",
    type: "expense",
  },
  {
    id: "taxas-pagamento",
    name: "Taxas de pagamento",
    type: "expense",
  },
  {
    id: "transferencia-contas",
    name: "Transferencia entre contas",
    type: "transfer",
  },
];

export const initialFinanceEntries: FinanceEntry[] = [
  {
    id: "fin-1001",
    code: "FIN-1001",
    type: "income",
    description: "Recebimento PIX venda VEN-1001",
    categoryId: "vendas-pdv",
    accountId: "conta-banco-principal",
    party: "Mariana Alves",
    amount: 125,
    dueAt: "20/05/2026",
    paidAt: "20/05/2026",
    status: "paid",
    source: "Pagamentos",
    notes: "Pagamento PIX conciliado.",
  },
  {
    id: "fin-1002",
    code: "FIN-1002",
    type: "income",
    description: "Credito aprovado VEN-1003",
    categoryId: "vendas-pdv",
    accountId: "conta-adquirente",
    party: "Mercado Sao Lucas",
    amount: 817.54,
    dueAt: "19/06/2026",
    paidAt: "",
    status: "scheduled",
    source: "Pagamentos",
    notes: "Valor liquido aguardando repasse.",
  },
  {
    id: "fin-1003",
    code: "FIN-1003",
    type: "expense",
    description: "Compra COMP-1002",
    categoryId: "compras-mercadorias",
    accountId: "conta-banco-principal",
    party: "Bebidas Pantanal",
    amount: 511.2,
    dueAt: "21/05/2026",
    paidAt: "",
    status: "scheduled",
    source: "Compras",
    notes: "Pedido aguardando recebimento.",
  },
  {
    id: "fin-1004",
    code: "FIN-1004",
    type: "expense",
    description: "Compra COMP-1003",
    categoryId: "compras-mercadorias",
    accountId: "conta-banco-principal",
    party: "Limpa Mais Atacado",
    amount: 81,
    dueAt: "20/05/2026",
    paidAt: "",
    status: "overdue",
    source: "Compras",
    notes: "Parte do pedido ainda pendente.",
  },
  {
    id: "fin-1005",
    code: "FIN-1005",
    type: "expense",
    description: "Taxas de cartao",
    categoryId: "taxas-pagamento",
    accountId: "conta-adquirente",
    party: "Adquirente A",
    amount: 29.59,
    dueAt: "20/05/2026",
    paidAt: "20/05/2026",
    status: "paid",
    source: "Pagamentos",
    notes: "Taxas estimadas das transacoes do dia.",
  },
  {
    id: "fin-1006",
    code: "FIN-1006",
    type: "expense",
    description: "Energia eletrica loja matriz",
    categoryId: "despesas-operacionais",
    accountId: "conta-banco-principal",
    party: "Concessionaria",
    amount: 1380,
    dueAt: "18/05/2026",
    paidAt: "",
    status: "overdue",
    source: "Manual",
    notes: "Conta operacional vencida.",
  },
  {
    id: "fin-1007",
    code: "FIN-1007",
    type: "income",
    description: "Recebimento cliente fiado",
    categoryId: "recebimento-cliente",
    accountId: "conta-caixa-matriz",
    party: "Panificadora Pantanal",
    amount: 620,
    dueAt: "22/05/2026",
    paidAt: "",
    status: "scheduled",
    source: "Clientes",
    notes: "Parcela combinada com cliente.",
  },
];
