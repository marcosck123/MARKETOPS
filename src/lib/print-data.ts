export type PrintDocumentKind =
  | "sale_receipt"
  | "cash_closure"
  | "self_checkout"
  | "stock_report";

export type PrintDeviceStatus = "online" | "offline" | "warning";

export type PrintJobStatus = "queued" | "printed" | "failed" | "canceled";

export type PrintDevice = {
  id: string;
  name: string;
  kind: "thermal" | "office" | "pdf";
  status: PrintDeviceStatus;
  storeName: string;
  location: string;
  paperWidth: string;
  lastHeartbeat: string;
};

export type PrintTemplate = {
  id: string;
  name: string;
  documentKind: PrintDocumentKind;
  enabled: boolean;
  copies: number;
  footer: string;
};

export type PrintJob = {
  id: string;
  code: string;
  documentKind: PrintDocumentKind;
  status: PrintJobStatus;
  deviceId: string;
  deviceName: string;
  origin: string;
  total: number;
  requestedBy: string;
  requestedAt: string;
  printedAt: string;
};

export const printDocumentKindLabels: Record<PrintDocumentKind, string> = {
  sale_receipt: "Comprovante de venda",
  cash_closure: "Fechamento de caixa",
  self_checkout: "Self-checkout",
  stock_report: "Relatorio de estoque",
};

export const printDeviceStatusLabels: Record<PrintDeviceStatus, string> = {
  online: "Online",
  offline: "Offline",
  warning: "Atencao",
};

export const printJobStatusLabels: Record<PrintJobStatus, string> = {
  queued: "Na fila",
  printed: "Impresso",
  failed: "Falhou",
  canceled: "Cancelado",
};

export const initialPrintDevices: PrintDevice[] = [
  {
    id: "printer-thermal-01",
    name: "Termica PDV-01",
    kind: "thermal",
    status: "online",
    storeName: "Loja Matriz",
    location: "Caixa principal",
    paperWidth: "80mm",
    lastHeartbeat: "22/05/2026 09:18",
  },
  {
    id: "printer-thermal-02",
    name: "Termica AUTO-01",
    kind: "thermal",
    status: "warning",
    storeName: "Loja Matriz",
    location: "Self-checkout",
    paperWidth: "80mm",
    lastHeartbeat: "22/05/2026 09:11",
  },
  {
    id: "printer-office-01",
    name: "Administrativo A4",
    kind: "office",
    status: "online",
    storeName: "Loja Matriz",
    location: "Retaguarda",
    paperWidth: "A4",
    lastHeartbeat: "22/05/2026 09:17",
  },
  {
    id: "printer-pdf",
    name: "Exportar PDF",
    kind: "pdf",
    status: "online",
    storeName: "Todas as lojas",
    location: "Virtual",
    paperWidth: "A4/PDF",
    lastHeartbeat: "Sempre disponivel",
  },
];

export const initialPrintTemplates: PrintTemplate[] = [
  {
    id: "template-sale-receipt",
    name: "Comprovante simples",
    documentKind: "sale_receipt",
    enabled: true,
    copies: 1,
    footer: "Obrigado pela preferencia.",
  },
  {
    id: "template-cash-closure",
    name: "Resumo de fechamento",
    documentKind: "cash_closure",
    enabled: true,
    copies: 2,
    footer: "Conferir valores antes de assinar.",
  },
  {
    id: "template-self-checkout",
    name: "Cupom self-checkout",
    documentKind: "self_checkout",
    enabled: true,
    copies: 1,
    footer: "Guarde este comprovante.",
  },
  {
    id: "template-stock-report",
    name: "Relatorio operacional",
    documentKind: "stock_report",
    enabled: false,
    copies: 1,
    footer: "Documento interno MARKETOPS.",
  },
];

export const initialPrintJobs: PrintJob[] = [
  {
    id: "print-job-1001",
    code: "IMP-1001",
    documentKind: "sale_receipt",
    status: "printed",
    deviceId: "printer-thermal-01",
    deviceName: "Termica PDV-01",
    origin: "VEN-1001",
    total: 125,
    requestedBy: "Ana Paula",
    requestedAt: "22/05/2026 08:42",
    printedAt: "22/05/2026 08:42",
  },
  {
    id: "print-job-1002",
    code: "IMP-1002",
    documentKind: "cash_closure",
    status: "queued",
    deviceId: "printer-office-01",
    deviceName: "Administrativo A4",
    origin: "Caixa PDV-01",
    total: 1842.7,
    requestedBy: "Ana Silva",
    requestedAt: "22/05/2026 09:02",
    printedAt: "",
  },
  {
    id: "print-job-1003",
    code: "IMP-1003",
    documentKind: "self_checkout",
    status: "failed",
    deviceId: "printer-thermal-02",
    deviceName: "Termica AUTO-01",
    origin: "VEN-4001",
    total: 72.86,
    requestedBy: "AUTO-01",
    requestedAt: "22/05/2026 09:09",
    printedAt: "",
  },
];
