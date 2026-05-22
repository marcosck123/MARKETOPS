export type StockMovementType =
  | "entry"
  | "adjustment_plus"
  | "adjustment_minus"
  | "loss"
  | "return"
  | "transfer"
  | "inventory_correction";

export type StockMovement = {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  delta: number;
  reason: string;
  responsible: string;
  createdAt: string;
  stockAfter: number;
};

export const movementTypeLabels: Record<StockMovementType, string> = {
  entry: "Entrada",
  adjustment_plus: "Ajuste positivo",
  adjustment_minus: "Ajuste negativo",
  loss: "Perda",
  return: "Devolucao",
  transfer: "Transferencia",
  inventory_correction: "Correcao de inventario",
};

export const initialStockMovements: StockMovement[] = [
  {
    id: "mov-1001",
    productId: "arroz-tipo-1-5kg",
    type: "inventory_correction",
    quantity: 4,
    delta: -8,
    reason: "Contagem fisica apontou divergencia no saldo.",
    responsible: "Admin MARKETOPS",
    createdAt: "19/05/2026 08:40",
    stockAfter: 4,
  },
  {
    id: "mov-1002",
    productId: "detergente-neutro-500ml",
    type: "loss",
    quantity: 3,
    delta: -3,
    reason: "Avaria identificada no recebimento.",
    responsible: "Operador Estoque",
    createdAt: "19/05/2026 09:15",
    stockAfter: 5,
  },
  {
    id: "mov-1003",
    productId: "feijao-carioca-1kg",
    type: "entry",
    quantity: 40,
    delta: 40,
    reason: "Compra recebida do fornecedor principal.",
    responsible: "Operador Estoque",
    createdAt: "19/05/2026 10:05",
    stockAfter: 86,
  },
  {
    id: "mov-1004",
    productId: "refrigerante-cola-2l",
    type: "return",
    quantity: 6,
    delta: 6,
    reason: "Devolucao comercial conferida.",
    responsible: "Gerente",
    createdAt: "19/05/2026 11:30",
    stockAfter: 72,
  },
];
