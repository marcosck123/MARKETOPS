import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.section.createMany({
    data: [
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
    ],
    skipDuplicates: true,
  });

  await prisma.category.createMany({
    data: [
      { id: "arroz-feijao", sectionId: "alimentos", name: "Arroz e feijao", status: "active" },
      { id: "massas", sectionId: "alimentos", name: "Massas", status: "active" },
      { id: "refrigerantes", sectionId: "bebidas", name: "Refrigerantes", status: "active" },
      { id: "aguas", sectionId: "bebidas", name: "Aguas", status: "active" },
      { id: "detergentes", sectionId: "limpeza", name: "Detergentes", status: "active" },
      { id: "papeis", sectionId: "higiene", name: "Papeis", status: "inactive" },
    ],
    skipDuplicates: true,
  });

  await prisma.product.createMany({
    data: [
      {
        id: "arroz-tipo-1-5kg",
        name: "Arroz tipo 1 5kg",
        barcode: "7891000100011",
        sku: "ARR-5KG-001",
        sectionId: "alimentos",
        categoryId: "arroz-feijao",
        unit: "pacote",
        costPrice: 18.7,
        salePrice: 24.9,
        wholesalePrice: 22.8,
        currentStock: 4,
        minimumStock: 24,
        status: "active",
      },
      {
        id: "feijao-carioca-1kg",
        name: "Feijao carioca 1kg",
        barcode: "7891000100028",
        sku: "FEI-1KG-010",
        sectionId: "alimentos",
        categoryId: "arroz-feijao",
        unit: "pacote",
        costPrice: 5.2,
        salePrice: 7.49,
        wholesalePrice: 6.89,
        currentStock: 86,
        minimumStock: 32,
        status: "active",
      },
      {
        id: "macarrao-espaguete-500g",
        name: "Macarrao espaguete 500g",
        barcode: "7891000100035",
        sku: "MAC-500-021",
        sectionId: "alimentos",
        categoryId: "massas",
        unit: "pacote",
        costPrice: 2.55,
        salePrice: 4.19,
        wholesalePrice: 3.89,
        currentStock: 118,
        minimumStock: 40,
        status: "active",
      },
      {
        id: "refrigerante-cola-2l",
        name: "Refrigerante cola 2L",
        barcode: "7891000100042",
        sku: "REF-2L-014",
        sectionId: "bebidas",
        categoryId: "refrigerantes",
        unit: "unidade",
        costPrice: 5.9,
        salePrice: 8.99,
        wholesalePrice: 8.29,
        currentStock: 72,
        minimumStock: 30,
        status: "active",
      },
      {
        id: "agua-mineral-500ml",
        name: "Agua mineral 500ml",
        barcode: "7891000100059",
        sku: "AGU-500-033",
        sectionId: "bebidas",
        categoryId: "aguas",
        unit: "unidade",
        costPrice: 0.72,
        salePrice: 1.49,
        wholesalePrice: 1.29,
        currentStock: 145,
        minimumStock: 60,
        status: "active",
      },
      {
        id: "detergente-neutro-500ml",
        name: "Detergente neutro 500ml",
        barcode: "7891000100066",
        sku: "DET-500-102",
        sectionId: "limpeza",
        categoryId: "detergentes",
        unit: "unidade",
        costPrice: 1.35,
        salePrice: 2.49,
        wholesalePrice: 2.19,
        currentStock: 5,
        minimumStock: 48,
        status: "active",
      },
      {
        id: "papel-toalha-fardo",
        name: "Papel toalha fardo",
        barcode: "7891000100073",
        sku: "PPT-FRD-021",
        sectionId: "higiene",
        categoryId: "papeis",
        unit: "fardo",
        costPrice: 34.5,
        salePrice: 49.9,
        wholesalePrice: 46.9,
        currentStock: 11,
        minimumStock: 30,
        status: "inactive",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.cashRegister.createMany({
    data: [
      { name: "Caixa frente 1", status: "closed", openingBalance: 0 },
      { name: "Caixa frente 2", status: "closed", openingBalance: 0 },
      { name: "Caixa atacado", status: "closed", openingBalance: 0 },
      { name: "Caixa reserva", status: "closed", openingBalance: 0 },
    ],
    skipDuplicates: false,
  });

  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@marketops.local" },
    update: { active: true },
    create: {
      email: "admin@marketops.local",
      name: "Admin MARKETOPS",
      passwordHash: adminPasswordHash,
      role: "admin",
      active: true,
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
