/**
 * Script isolado para criar o usuário de caixa.
 * Uso: DATABASE_URL="..." npx tsx prisma/create-cashier.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "caixa@marketops.local";
  const name = "Funcionario Caixa";
  const password = "caixa123";
  const role = "operator" as const;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Usuário ${email} já existe (id: ${existing.id}). Nada alterado.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role, active: true },
  });

  console.log("Usuário criado com sucesso:");
  console.log(`  Email : ${email}`);
  console.log(`  Senha : ${password}`);
  console.log(`  Cargo : ${role} (apenas caixa)`);
  console.log(`  ID    : ${user.id}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => void prisma.$disconnect());
