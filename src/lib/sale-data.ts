export type SaleStatus = "open" | "finished" | "canceled";

export type SalePriceMode = "retail" | "wholesale";

export type PaymentMethod =
  | "cash"
  | "pix"
  | "debit"
  | "credit"
  | "store_credit";

export type SaleItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
};

export type SalePayment = {
  id: string;
  method: PaymentMethod;
  amount: number;
};

export type Sale = {
  id: string;
  code: string;
  customerId: string;
  cashSessionId: string;
  operator: string;
  status: SaleStatus;
  createdAt: string;
  finishedAt: string;
  canceledAt: string;
  subtotal: number;
  discount: number;
  total: number;
  payments: SalePayment[];
  items: SaleItem[];
  notes: string;
};

export const saleStatusLabels: Record<SaleStatus, string> = {
  open: "Aberta",
  finished: "Finalizada",
  canceled: "Cancelada",
};

export const salePriceModeLabels: Record<SalePriceMode, string> = {
  retail: "Varejo",
  wholesale: "Atacado",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Dinheiro",
  pix: "PIX",
  debit: "Debito",
  credit: "Credito",
  store_credit: "Fiado",
};

export const initialSales: Sale[] = [
  {
    id: "sale-1001",
    code: "VEN-1001",
    customerId: "mariana-alves",
    cashSessionId: "sessao-2001",
    operator: "Ana Paula",
    status: "finished",
    createdAt: "20/05/2026 09:12",
    finishedAt: "20/05/2026 09:18",
    canceledAt: "",
    subtotal: 130.7,
    discount: 5.7,
    total: 125,
    payments: [
      {
        id: "pay-1001",
        method: "pix",
        amount: 125,
      },
    ],
    items: [
      {
        id: "sale-1001-item-1",
        productId: "arroz-tipo-1-5kg",
        quantity: 2,
        unitPrice: 24.9,
        discount: 0,
        total: 49.8,
      },
      {
        id: "sale-1001-item-2",
        productId: "feijao-carioca-1kg",
        quantity: 6,
        unitPrice: 7.49,
        discount: 0,
        total: 44.94,
      },
      {
        id: "sale-1001-item-3",
        productId: "refrigerante-cola-2l",
        quantity: 4,
        unitPrice: 8.99,
        discount: 0,
        total: 35.96,
      },
    ],
    notes: "Venda simulada para validar totalizacao.",
  },
  {
    id: "sale-1002",
    code: "VEN-1002",
    customerId: "mercado-sao-lucas",
    cashSessionId: "sessao-2002",
    operator: "Carlos Mendes",
    status: "open",
    createdAt: "20/05/2026 11:55",
    finishedAt: "",
    canceledAt: "",
    subtotal: 341.4,
    discount: 0,
    total: 341.4,
    payments: [],
    items: [
      {
        id: "sale-1002-item-1",
        productId: "agua-mineral-500ml",
        quantity: 120,
        unitPrice: 1.29,
        discount: 0,
        total: 154.8,
      },
      {
        id: "sale-1002-item-2",
        productId: "detergente-neutro-500ml",
        quantity: 60,
        unitPrice: 2.19,
        discount: 0,
        total: 131.4,
      },
      {
        id: "sale-1002-item-3",
        productId: "feijao-carioca-1kg",
        quantity: 8,
        unitPrice: 6.9,
        discount: 0,
        total: 55.2,
      },
    ],
    notes: "Venda em montagem para cliente PJ.",
  },
];
