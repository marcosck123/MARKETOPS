export type CashRegisterStatus = "active" | "inactive";

export type CashSessionStatus = "open" | "closed";

export type CashMovementType =
  | "opening"
  | "supply"
  | "withdrawal"
  | "sale"
  | "closing";

export type CashRegister = {
  id: string;
  code: string;
  name: string;
  store: string;
  status: CashRegisterStatus;
  currentSessionId: string;
  lastClosedAt: string;
};

export type CashSession = {
  id: string;
  registerId: string;
  operator: string;
  openedAt: string;
  closedAt: string;
  openingAmount: number;
  countedAmount: number;
  expectedAmount: number;
  difference: number;
  status: CashSessionStatus;
  notes: string;
};

export type CashMovement = {
  id: string;
  sessionId: string;
  type: CashMovementType;
  amount: number;
  reason: string;
  responsible: string;
  createdAt: string;
};

export const cashRegisterStatusLabels: Record<CashRegisterStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
};

export const cashSessionStatusLabels: Record<CashSessionStatus, string> = {
  open: "Aberto",
  closed: "Fechado",
};

export const cashMovementTypeLabels: Record<CashMovementType, string> = {
  opening: "Abertura",
  supply: "Suprimento",
  withdrawal: "Sangria",
  sale: "Venda",
  closing: "Fechamento",
};

export const initialCashRegisters: CashRegister[] = [
  {
    id: "caixa-01",
    code: "CX-01",
    name: "Caixa frente 1",
    store: "Loja matriz",
    status: "active",
    currentSessionId: "sessao-2001",
    lastClosedAt: "19/05/2026 18:10",
  },
  {
    id: "caixa-02",
    code: "CX-02",
    name: "Caixa frente 2",
    store: "Loja matriz",
    status: "active",
    currentSessionId: "",
    lastClosedAt: "19/05/2026 18:05",
  },
  {
    id: "caixa-atacado",
    code: "CX-AT",
    name: "Caixa atacado",
    store: "Loja matriz",
    status: "active",
    currentSessionId: "sessao-2002",
    lastClosedAt: "19/05/2026 17:45",
  },
  {
    id: "caixa-reserva",
    code: "CX-RS",
    name: "Caixa reserva",
    store: "Loja matriz",
    status: "inactive",
    currentSessionId: "",
    lastClosedAt: "12/05/2026 16:30",
  },
];

export const initialCashSessions: CashSession[] = [
  {
    id: "sessao-2001",
    registerId: "caixa-01",
    operator: "Ana Paula",
    openedAt: "20/05/2026 07:40",
    closedAt: "",
    openingAmount: 200,
    countedAmount: 0,
    expectedAmount: 1380,
    difference: 0,
    status: "open",
    notes: "Operacao da manha.",
  },
  {
    id: "sessao-2002",
    registerId: "caixa-atacado",
    operator: "Carlos Mendes",
    openedAt: "20/05/2026 08:00",
    closedAt: "",
    openingAmount: 500,
    countedAmount: 0,
    expectedAmount: 3120,
    difference: 0,
    status: "open",
    notes: "Atendimento de clientes PJ.",
  },
  {
    id: "sessao-1999",
    registerId: "caixa-02",
    operator: "Livia Santos",
    openedAt: "19/05/2026 07:50",
    closedAt: "19/05/2026 18:05",
    openingAmount: 200,
    countedAmount: 2468.5,
    expectedAmount: 2470,
    difference: -1.5,
    status: "closed",
    notes: "Diferenca pequena conferida no fechamento.",
  },
];

export const initialCashMovements: CashMovement[] = [
  {
    id: "cash-mov-1001",
    sessionId: "sessao-2001",
    type: "opening",
    amount: 200,
    reason: "Valor inicial para troco.",
    responsible: "Ana Paula",
    createdAt: "20/05/2026 07:40",
  },
  {
    id: "cash-mov-1002",
    sessionId: "sessao-2001",
    type: "sale",
    amount: 980,
    reason: "Vendas registradas no periodo.",
    responsible: "Sistema MARKETOPS",
    createdAt: "20/05/2026 10:20",
  },
  {
    id: "cash-mov-1003",
    sessionId: "sessao-2001",
    type: "supply",
    amount: 200,
    reason: "Reforco de troco.",
    responsible: "Gerente",
    createdAt: "20/05/2026 11:05",
  },
  {
    id: "cash-mov-1004",
    sessionId: "sessao-2002",
    type: "opening",
    amount: 500,
    reason: "Valor inicial para atacado.",
    responsible: "Carlos Mendes",
    createdAt: "20/05/2026 08:00",
  },
  {
    id: "cash-mov-1005",
    sessionId: "sessao-2002",
    type: "sale",
    amount: 2920,
    reason: "Vendas de clientes PJ.",
    responsible: "Sistema MARKETOPS",
    createdAt: "20/05/2026 11:40",
  },
  {
    id: "cash-mov-1006",
    sessionId: "sessao-2002",
    type: "withdrawal",
    amount: 300,
    reason: "Sangria parcial para cofre.",
    responsible: "Gerente",
    createdAt: "20/05/2026 12:15",
  },
  {
    id: "cash-mov-1007",
    sessionId: "sessao-1999",
    type: "closing",
    amount: 2468.5,
    reason: "Fechamento do dia anterior.",
    responsible: "Livia Santos",
    createdAt: "19/05/2026 18:05",
  },
];
