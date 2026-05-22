import type { PaymentMethod } from "@/lib/sale-data";

export type SelfCheckoutStationStatus =
  | "available"
  | "in_use"
  | "assistance"
  | "offline";

export type SelfCheckoutAssistanceReason =
  | "age_check"
  | "payment_help"
  | "product_without_barcode"
  | "weight_check"
  | "cancel_request";

export type SelfCheckoutStation = {
  id: string;
  code: string;
  name: string;
  storeName: string;
  status: SelfCheckoutStationStatus;
  currentSaleCode: string;
  attendantName: string;
};

export type SelfCheckoutAssistanceRequest = {
  id: string;
  stationCode: string;
  reason: SelfCheckoutAssistanceReason;
  status: "open" | "resolved";
  requestedAt: string;
  resolvedAt: string;
};

export const selfCheckoutStatusLabels: Record<
  SelfCheckoutStationStatus,
  string
> = {
  available: "Disponivel",
  in_use: "Em uso",
  assistance: "Assistencia",
  offline: "Offline",
};

export const selfCheckoutAssistanceReasonLabels: Record<
  SelfCheckoutAssistanceReason,
  string
> = {
  age_check: "Conferencia de idade",
  payment_help: "Ajuda no pagamento",
  product_without_barcode: "Produto sem codigo",
  weight_check: "Conferencia de peso",
  cancel_request: "Cancelar compra",
};

export const selfCheckoutPaymentMethods: PaymentMethod[] = [
  "pix",
  "debit",
  "credit",
];

export const initialSelfCheckoutStations: SelfCheckoutStation[] = [
  {
    id: "self-station-01",
    code: "AUTO-01",
    name: "Caixa automatico 01",
    storeName: "Loja Matriz",
    status: "available",
    currentSaleCode: "",
    attendantName: "Ana Silva",
  },
  {
    id: "self-station-02",
    code: "AUTO-02",
    name: "Caixa automatico 02",
    storeName: "Loja Matriz",
    status: "in_use",
    currentSaleCode: "VEN-4018",
    attendantName: "Ana Silva",
  },
  {
    id: "self-station-03",
    code: "AUTO-03",
    name: "Caixa automatico 03",
    storeName: "Loja Centro",
    status: "assistance",
    currentSaleCode: "VEN-4021",
    attendantName: "Beatriz Nunes",
  },
];

export const initialSelfCheckoutRequests: SelfCheckoutAssistanceRequest[] = [
  {
    id: "assist-1001",
    stationCode: "AUTO-03",
    reason: "weight_check",
    status: "open",
    requestedAt: "20/05/2026 15:42",
    resolvedAt: "",
  },
  {
    id: "assist-1002",
    stationCode: "AUTO-02",
    reason: "payment_help",
    status: "resolved",
    requestedAt: "20/05/2026 14:18",
    resolvedAt: "20/05/2026 14:20",
  },
];
