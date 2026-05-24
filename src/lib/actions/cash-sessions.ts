"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/actions/audit-log";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ActiveSession = {
  id: string;
  cashRegisterId: string;
  cashRegisterName: string;
  operatorId: string;
  operatorName: string;
  openedAt: Date;
  openingBalance: number;
};

export type OpenSessionRow = {
  id: string;
  cashRegisterName: string;
  operatorName: string;
  openedAt: Date;
  openingBalance: number;
};

export async function openCashSession(params: {
  cashRegisterId: string;
  operatorId: string;
  operatorName: string;
  openingBalance: number;
}): Promise<ActionResult<{ id: string }>> {
  const { cashRegisterId, operatorId, operatorName, openingBalance } = params;

  const cashRegister = await db.cashRegister.findUnique({ where: { id: cashRegisterId } });
  if (!cashRegister) return { success: false, error: "Caixa não encontrado." };

  const existing = await db.cashSession.findFirst({
    where: { operatorId, status: "open" },
  });
  if (existing) return { success: false, error: "Operador já possui uma sessão aberta." };

  try {
    const session = await db.cashSession.create({
      data: { cashRegisterId, operatorId, operatorName, status: "open", openingBalance },
    });
    await createAuditLog({
      module: "cash",
      action: "opened",
      actorId: operatorId,
      actorName: operatorName,
      actorRole: "operator",
      target: "SessaoCaixa",
      targetId: session.id,
      description: `Sessão de caixa aberta por ${operatorName} — saldo inicial R$ ${openingBalance.toFixed(2)}`,
    });
    revalidatePath("/caixas");
    revalidatePath("/pdv");
    return { success: true, data: { id: session.id } };
  } catch {
    return { success: false, error: "Erro ao abrir sessão." };
  }
}

export async function closeCashSession(params: {
  sessionId: string;
  closingBalance: number;
}): Promise<ActionResult> {
  const { sessionId, closingBalance } = params;

  const session = await db.cashSession.findUnique({ where: { id: sessionId } });
  if (!session) return { success: false, error: "Sessão não encontrada." };
  if (session.status !== "open") return { success: false, error: "Sessão não está aberta." };

  try {
    await db.cashSession.update({
      where: { id: sessionId },
      data: { status: "closed", closedAt: new Date(), closingBalance },
    });
    await createAuditLog({
      module: "cash",
      action: "closed",
      actorId: session.operatorId,
      actorName: session.operatorName,
      actorRole: "operator",
      target: "SessaoCaixa",
      targetId: sessionId,
      description: `Sessão de caixa fechada por ${session.operatorName} — saldo final R$ ${closingBalance.toFixed(2)}`,
    });
    revalidatePath("/caixas");
    revalidatePath("/pdv");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao fechar sessão." };
  }
}

export async function getOperatorActiveSession(operatorId: string): Promise<ActiveSession | null> {
  const session = await db.cashSession.findFirst({
    where: { operatorId, status: "open" },
    include: { cashRegister: { select: { name: true } } },
  });
  if (!session) return null;
  return {
    id: session.id,
    cashRegisterId: session.cashRegisterId,
    cashRegisterName: session.cashRegister.name,
    operatorId: session.operatorId,
    operatorName: session.operatorName,
    openedAt: session.openedAt,
    openingBalance: session.openingBalance,
  };
}

export async function getOpenSessions(): Promise<OpenSessionRow[]> {
  const sessions = await db.cashSession.findMany({
    where: { status: "open" },
    include: { cashRegister: { select: { name: true } } },
    orderBy: { openedAt: "desc" },
  });
  return sessions.map((s: (typeof sessions)[number]) => ({
    id: s.id,
    cashRegisterName: s.cashRegister.name,
    operatorName: s.operatorName,
    openedAt: s.openedAt,
    openingBalance: s.openingBalance,
  }));
}
