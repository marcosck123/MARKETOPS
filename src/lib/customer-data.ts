export type CustomerStatus = "active" | "inactive";

export type CustomerKind = "pf" | "pj";

export type Customer = {
  id: string;
  name: string;
  document: string;
  kind: CustomerKind;
  email: string;
  phone: string;
  city: string;
  address: string;
  creditLimit: number;
  currentBalance: number;
  purchasesCount: number;
  lastPurchase: string;
  observations: string;
  status: CustomerStatus;
};

export const customerKindLabels: Record<CustomerKind, string> = {
  pf: "Pessoa fisica",
  pj: "Pessoa juridica",
};

export const initialCustomers: Customer[] = [
  {
    id: "mercado-sao-lucas",
    name: "Mercado Sao Lucas",
    document: "11.234.567/0001-80",
    kind: "pj",
    email: "compras@mercadosaolucas.com",
    phone: "(65) 3321-4400",
    city: "Cuiaba",
    address: "Av. Fernando Correa, 1240",
    creditLimit: 12000,
    currentBalance: 4280.5,
    purchasesCount: 18,
    lastPurchase: "19/05/2026",
    observations: "Cliente recorrente de atacado para mercearia seca.",
    status: "active",
  },
  {
    id: "panificadora-pantanal",
    name: "Panificadora Pantanal",
    document: "22.456.901/0001-33",
    kind: "pj",
    email: "financeiro@panpantanal.com",
    phone: "(65) 3344-7810",
    city: "Varzea Grande",
    address: "Rua Couto Magalhaes, 892",
    creditLimit: 8500,
    currentBalance: 1720,
    purchasesCount: 11,
    lastPurchase: "18/05/2026",
    observations: "Compra bebidas, frios e descartaveis para producao diaria.",
    status: "active",
  },
  {
    id: "mariana-alves",
    name: "Mariana Alves",
    document: "123.456.789-00",
    kind: "pf",
    email: "mariana.alves@email.com",
    phone: "(65) 99988-1200",
    city: "Cuiaba",
    address: "Bairro Jardim das Americas",
    creditLimit: 1500,
    currentBalance: 340.75,
    purchasesCount: 7,
    lastPurchase: "17/05/2026",
    observations: "Cliente final com compras mensais para residencia.",
    status: "active",
  },
  {
    id: "mercearia-rio-verde",
    name: "Mercearia Rio Verde",
    document: "44.888.321/0001-90",
    kind: "pj",
    email: "contato@merceariarioverde.com",
    phone: "(65) 3330-2200",
    city: "Rondonopolis",
    address: "Rua das Acacias, 315",
    creditLimit: 6000,
    currentBalance: 0,
    purchasesCount: 4,
    lastPurchase: "02/05/2026",
    observations: "Cadastro inativo ate revisao comercial.",
    status: "inactive",
  },
];
