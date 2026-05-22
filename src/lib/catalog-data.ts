export type CatalogStatus = "active" | "inactive";

export type CatalogSection = {
  id: string;
  name: string;
  description: string;
  status: CatalogStatus;
};

export type ProductCategory = {
  id: string;
  sectionId: string;
  name: string;
  products: number;
  status: CatalogStatus;
};

export const initialSections: CatalogSection[] = [
  {
    id: "alimentos",
    name: "Alimentos",
    description: "Mercearia seca, basicos e produtos de alto giro.",
    status: "active",
  },
  {
    id: "bebidas",
    name: "Bebidas",
    description: "Refrigerantes, aguas, sucos e bebidas em volume.",
    status: "active",
  },
  {
    id: "limpeza",
    name: "Limpeza",
    description: "Produtos de limpeza domestica e profissional.",
    status: "active",
  },
  {
    id: "higiene",
    name: "Higiene",
    description: "Higiene pessoal, papelaria sanitaria e perfumaria.",
    status: "inactive",
  },
];

export const initialCategories: ProductCategory[] = [
  {
    id: "arroz-feijao",
    sectionId: "alimentos",
    name: "Arroz e feijao",
    products: 42,
    status: "active",
  },
  {
    id: "massas",
    sectionId: "alimentos",
    name: "Massas",
    products: 28,
    status: "active",
  },
  {
    id: "refrigerantes",
    sectionId: "bebidas",
    name: "Refrigerantes",
    products: 36,
    status: "active",
  },
  {
    id: "aguas",
    sectionId: "bebidas",
    name: "Aguas",
    products: 14,
    status: "active",
  },
  {
    id: "detergentes",
    sectionId: "limpeza",
    name: "Detergentes",
    products: 19,
    status: "active",
  },
  {
    id: "papeis",
    sectionId: "higiene",
    name: "Papeis",
    products: 11,
    status: "inactive",
  },
];
