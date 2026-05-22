export type SupplierStatus = "active" | "inactive";

export type Supplier = {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  city: string;
  representative: string;
  observations: string;
  linkedProducts: number;
  lastPurchase: string;
  status: SupplierStatus;
};

export const initialSuppliers: Supplier[] = [
  {
    id: "distribuidora-norte",
    name: "Distribuidora Norte",
    document: "12.345.678/0001-90",
    email: "comercial@distnorte.com",
    phone: "(65) 3333-1000",
    city: "Cuiaba",
    representative: "Marcos Lima",
    observations: "Fornecedor principal de mercearia seca.",
    linkedProducts: 86,
    lastPurchase: "18/05/2026",
    status: "active",
  },
  {
    id: "bebidas-pantanal",
    name: "Bebidas Pantanal",
    document: "22.456.890/0001-12",
    email: "pedidos@bebidaspantanal.com",
    phone: "(65) 3444-2200",
    city: "Varzea Grande",
    representative: "Aline Costa",
    observations: "Refrigerantes, aguas e sucos em volume.",
    linkedProducts: 54,
    lastPurchase: "17/05/2026",
    status: "active",
  },
  {
    id: "limpa-mais-atacado",
    name: "Limpa Mais Atacado",
    document: "33.777.123/0001-45",
    email: "vendas@limpamais.com",
    phone: "(65) 3555-4400",
    city: "Cuiaba",
    representative: "Renata Souza",
    observations: "Produtos de limpeza domestica e profissional.",
    linkedProducts: 39,
    lastPurchase: "15/05/2026",
    status: "active",
  },
  {
    id: "higiene-total",
    name: "Higiene Total",
    document: "44.987.654/0001-20",
    email: "contato@higienetotal.com",
    phone: "(65) 3222-8800",
    city: "Rondonopolis",
    representative: "Joao Martins",
    observations: "Fornecedor em revisao comercial.",
    linkedProducts: 18,
    lastPurchase: "02/05/2026",
    status: "inactive",
  },
];
