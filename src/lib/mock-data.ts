export const metricCards = [
  {
    label: "Faturamento hoje",
    value: "R$ 48.920,00",
    helper: "Vendas consolidadas ate agora",
    trend: "+12%",
    tone: "emerald" as const,
  },
  {
    label: "Pedidos hoje",
    value: "186",
    helper: "Operacoes finalizadas no PDV",
    trend: "+8%",
    tone: "blue" as const,
  },
  {
    label: "Ticket medio",
    value: "R$ 263,01",
    helper: "Media por venda finalizada",
    trend: "Estavel",
    tone: "slate" as const,
  },
  {
    label: "Lucro bruto",
    value: "R$ 13.420,00",
    helper: "Estimativa com base no custo",
    trend: "+6%",
    tone: "amber" as const,
  },
];

export const salesByDay = [
  { label: "Seg", value: 32800 },
  { label: "Ter", value: 42100 },
  { label: "Qua", value: 48920 },
  { label: "Qui", value: 37600 },
  { label: "Sex", value: 53800 },
  { label: "Sab", value: 46250 },
  { label: "Dom", value: 29800 },
];

export const recentSales = [
  {
    id: "#10294",
    customer: "Mercado Avenida",
    cashier: "Caixa 01",
    total: "R$ 1.284,90",
    status: "Finalizada",
  },
  {
    id: "#10293",
    customer: "Padaria Santa Luzia",
    cashier: "Caixa 02",
    total: "R$ 742,40",
    status: "Finalizada",
  },
  {
    id: "#10292",
    customer: "Consumidor final",
    cashier: "Caixa 04",
    total: "R$ 98,70",
    status: "Pendente",
  },
  {
    id: "#10291",
    customer: "Distribuidora Norte",
    cashier: "Caixa 01",
    total: "R$ 3.908,10",
    status: "Finalizada",
  },
];

export const lowStockProducts = [
  {
    name: "Arroz tipo 1 5kg",
    sku: "ARR-5KG-001",
    current: 4,
    minimum: 24,
  },
  {
    name: "Cafe tradicional 500g",
    sku: "CAF-500-014",
    current: 9,
    minimum: 36,
  },
  {
    name: "Detergente neutro 500ml",
    sku: "DET-500-102",
    current: 5,
    minimum: 48,
  },
  {
    name: "Papel toalha fardo",
    sku: "PPT-FRD-021",
    current: 11,
    minimum: 30,
  },
];
