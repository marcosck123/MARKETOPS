export type PurchaseStatus =
  | "draft"
  | "sent"
  | "partial_received"
  | "received"
  | "canceled";

export type PurchaseItem = {
  id: string;
  productId: string;
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
};

export type PurchaseOrder = {
  id: string;
  code: string;
  supplierId: string;
  status: PurchaseStatus;
  createdAt: string;
  expectedAt: string;
  receivedAt: string;
  notes: string;
  items: PurchaseItem[];
};

export const purchaseStatusLabels: Record<PurchaseStatus, string> = {
  draft: "Rascunho",
  sent: "Pedido enviado",
  partial_received: "Recebido parcial",
  received: "Recebido total",
  canceled: "Cancelado",
};

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po-1001",
    code: "COMP-1001",
    supplierId: "distribuidora-norte",
    status: "received",
    createdAt: "18/05/2026",
    expectedAt: "19/05/2026",
    receivedAt: "19/05/2026",
    notes: "Reposicao de mercearia seca.",
    items: [
      {
        id: "po-1001-item-1",
        productId: "arroz-tipo-1-5kg",
        quantity: 40,
        receivedQuantity: 40,
        unitCost: 18.7,
      },
      {
        id: "po-1001-item-2",
        productId: "feijao-carioca-1kg",
        quantity: 50,
        receivedQuantity: 50,
        unitCost: 5.2,
      },
    ],
  },
  {
    id: "po-1002",
    code: "COMP-1002",
    supplierId: "bebidas-pantanal",
    status: "sent",
    createdAt: "19/05/2026",
    expectedAt: "21/05/2026",
    receivedAt: "",
    notes: "Pedido para reforcar bebidas do fim de semana.",
    items: [
      {
        id: "po-1002-item-1",
        productId: "refrigerante-cola-2l",
        quantity: 72,
        receivedQuantity: 0,
        unitCost: 5.9,
      },
      {
        id: "po-1002-item-2",
        productId: "agua-mineral-500ml",
        quantity: 120,
        receivedQuantity: 0,
        unitCost: 0.72,
      },
    ],
  },
  {
    id: "po-1003",
    code: "COMP-1003",
    supplierId: "limpa-mais-atacado",
    status: "partial_received",
    createdAt: "19/05/2026",
    expectedAt: "20/05/2026",
    receivedAt: "",
    notes: "Parte dos detergentes ficou pendente.",
    items: [
      {
        id: "po-1003-item-1",
        productId: "detergente-neutro-500ml",
        quantity: 60,
        receivedQuantity: 30,
        unitCost: 1.35,
      },
    ],
  },
];
