import type { PaymentMethod } from "@/lib/sale-data";

export type PaymentTransactionStatus =
  | "pending"
  | "approved"
  | "reconciled"
  | "refunded"
  | "failed";

export type PaymentMethodConfig = {
  id: string;
  method: PaymentMethod;
  label: string;
  provider: string;
  settlementDays: number;
  feePercent: number;
  enabled: boolean;
};

export type PaymentTransaction = {
  id: string;
  saleId: string;
  saleCode: string;
  customerName: string;
  cashSessionId: string;
  method: PaymentMethod;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  status: PaymentTransactionStatus;
  capturedAt: string;
  reconciledAt: string;
  authorizationCode: string;
  notes: string;
};

export const paymentStatusLabels: Record<PaymentTransactionStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  reconciled: "Conciliado",
  refunded: "Estornado",
  failed: "Falhou",
};

export const initialPaymentMethods: PaymentMethodConfig[] = [
  {
    id: "method-cash",
    method: "cash",
    label: "Dinheiro",
    provider: "Caixa interno",
    settlementDays: 0,
    feePercent: 0,
    enabled: true,
  },
  {
    id: "method-pix",
    method: "pix",
    label: "PIX",
    provider: "Banco parceiro",
    settlementDays: 0,
    feePercent: 0,
    enabled: true,
  },
  {
    id: "method-debit",
    method: "debit",
    label: "Debito",
    provider: "Adquirente A",
    settlementDays: 1,
    feePercent: 1.49,
    enabled: true,
  },
  {
    id: "method-credit",
    method: "credit",
    label: "Credito",
    provider: "Adquirente A",
    settlementDays: 30,
    feePercent: 2.99,
    enabled: true,
  },
  {
    id: "method-store-credit",
    method: "store_credit",
    label: "Fiado",
    provider: "Conta cliente",
    settlementDays: 7,
    feePercent: 0,
    enabled: false,
  },
];

export const initialPaymentTransactions: PaymentTransaction[] = [
  {
    id: "paytx-1001",
    saleId: "sale-1001",
    saleCode: "VEN-1001",
    customerName: "Mariana Alves",
    cashSessionId: "sessao-2001",
    method: "pix",
    grossAmount: 125,
    feeAmount: 0,
    netAmount: 125,
    status: "reconciled",
    capturedAt: "20/05/2026 09:18",
    reconciledAt: "20/05/2026 09:19",
    authorizationCode: "PIX-900145",
    notes: "Pagamento instantaneo conciliado.",
  },
  {
    id: "paytx-1002",
    saleId: "sale-1003",
    saleCode: "VEN-1003",
    customerName: "Mercado Sao Lucas",
    cashSessionId: "sessao-2002",
    method: "credit",
    grossAmount: 842.75,
    feeAmount: 25.21,
    netAmount: 817.54,
    status: "approved",
    capturedAt: "20/05/2026 10:42",
    reconciledAt: "",
    authorizationCode: "CRD-348912",
    notes: "Credito aprovado, aguardando conciliacao.",
  },
  {
    id: "paytx-1003",
    saleId: "sale-1004",
    saleCode: "VEN-1004",
    customerName: "Panificadora Pantanal",
    cashSessionId: "sessao-2002",
    method: "debit",
    grossAmount: 294.3,
    feeAmount: 4.38,
    netAmount: 289.92,
    status: "pending",
    capturedAt: "20/05/2026 11:05",
    reconciledAt: "",
    authorizationCode: "DEB-781044",
    notes: "Aguardando retorno da adquirente.",
  },
  {
    id: "paytx-1004",
    saleId: "sale-1005",
    saleCode: "VEN-1005",
    customerName: "Cliente balcao",
    cashSessionId: "sessao-2001",
    method: "cash",
    grossAmount: 86.9,
    feeAmount: 0,
    netAmount: 86.9,
    status: "approved",
    capturedAt: "20/05/2026 11:27",
    reconciledAt: "",
    authorizationCode: "DIN-000086",
    notes: "Recebimento em dinheiro no caixa.",
  },
  {
    id: "paytx-1005",
    saleId: "sale-1006",
    saleCode: "VEN-1006",
    customerName: "Mercearia Rio Verde",
    cashSessionId: "sessao-2002",
    method: "pix",
    grossAmount: 438.1,
    feeAmount: 0,
    netAmount: 438.1,
    status: "failed",
    capturedAt: "20/05/2026 12:08",
    reconciledAt: "",
    authorizationCode: "PIX-ERRO",
    notes: "Pagamento recusado pelo provedor.",
  },
];
