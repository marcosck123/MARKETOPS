"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/actions/audit-log";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type CashRegisterData = {
  id: string;
  name: string;
  status: "open" | "closed";
  openedAt: string | null;
  closedAt: string | null;
  openingBalance: number;
  closingBalance: number | null;
};

function formatDate(date: Date | null): string | null {
  if (!date) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export async function getCashRegisters(): Promise<
  ActionResult<CashRegisterData[]>
> {
  const registers = await db.cashRegister.findMany({
    orderBy: { name: "asc" },
  });

  return {
    success: true,
    data: registers.map((r: (typeof registers)[number]) => ({
      id: r.id,
      name: r.name,
      status: r.status as "open" | "closed",
      openedAt: formatDate(r.openedAt),
      closedAt: formatDate(r.closedAt),
      openingBalance: r.openingBalance,
      closingBalance: r.closingBalance,
    })),
  };
}

export async function openCashRegister(
  id: string,
  openingBalance: number,
): Promise<ActionResult> {
  if (!id) return { success: false, error: "ID inválido." };
  if (openingBalance < 0)
    return { success: false, error: "Saldo inicial inválido." };

  const register = await db.cashRegister.findUnique({ where: { id } });
  if (!register) return { success: false, error: "Caixa não encontrado." };
  if (register.status === "open")
    return { success: false, error: "Caixa já está aberto." };

  try {
    await db.cashRegister.update({
      where: { id },
      data: {
        status: "open",
        openedAt: new Date(),
        closedAt: null,
        openingBalance,
        closingBalance: null,
      },
    });
    await createAuditLog({
      module: "cash",
      action: "opened",
      actorName: "Sistema",
      target: "Caixa",
      targetId: id,
      description: `Caixa "${register.name}" aberto com saldo inicial de R$ ${openingBalance.toFixed(2)}`,
    });
    revalidatePath("/caixas");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao abrir caixa." };
  }
}

export async function closeCashRegister(
  id: string,
  closingBalance: number,
): Promise<ActionResult> {
  if (!id) return { success: false, error: "ID inválido." };
  if (closingBalance < 0)
    return { success: false, error: "Saldo de fechamento inválido." };

  const register = await db.cashRegister.findUnique({ where: { id } });
  if (!register) return { success: false, error: "Caixa não encontrado." };
  if (register.status === "closed")
    return { success: false, error: "Caixa já está fechado." };

  try {
    await db.cashRegister.update({
      where: { id },
      data: {
        status: "closed",
        closedAt: new Date(),
        closingBalance,
      },
    });
    await createAuditLog({
      module: "cash",
      action: "closed",
      actorName: "Sistema",
      target: "Caixa",
      targetId: id,
      description: `Caixa "${register.name}" fechado com saldo de R$ ${closingBalance.toFixed(2)}`,
    });
    revalidatePath("/caixas");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao fechar caixa." };
  }
}
