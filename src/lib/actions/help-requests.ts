"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type HelpRequestRow = {
  id: string;
  cashRegisterId: string;
  cashRegisterName: string;
  operatorId: string;
  operatorName: string;
  createdAt: Date;
  expiresAt: Date;
};

async function expireOldRequests(): Promise<void> {
  await db.helpRequest.updateMany({
    where: { status: "active", expiresAt: { lte: new Date() } },
    data: { status: "expired" },
  });
}

export async function createHelpRequest(params: {
  cashRegisterId: string;
  operatorId: string;
  operatorName: string;
  cashRegisterName: string;
}): Promise<ActionResult<{ id: string }>> {
  const { cashRegisterId, operatorId, operatorName, cashRegisterName } = params;

  await expireOldRequests();

  const existing = await db.helpRequest.findFirst({
    where: { cashRegisterId, status: "active" },
  });
  if (existing) {
    return { success: false, error: "Já existe um chamado ativo para este caixa." };
  }

  const request = await db.helpRequest.create({
    data: {
      cashRegisterId,
      operatorId,
      operatorName,
      cashRegisterName,
      expiresAt: new Date(Date.now() + 60_000),
    },
  });

  revalidatePath("/supervisor");
  revalidatePath("/pdv");

  return { success: true, data: { id: request.id } };
}

export async function attendHelpRequest(
  id: string,
  attendedBy: string,
): Promise<ActionResult> {
  const request = await db.helpRequest.findUnique({ where: { id } });
  if (!request) return { success: false, error: "Chamado não encontrado." };
  if (request.status !== "active") {
    return { success: false, error: "Chamado não está ativo." };
  }

  await db.helpRequest.update({
    where: { id },
    data: { status: "attended", attendedBy, attendedAt: new Date() },
  });

  revalidatePath("/supervisor");
  revalidatePath("/pdv");

  return { success: true, data: undefined };
}

export async function getActiveHelpRequests(): Promise<HelpRequestRow[]> {
  await expireOldRequests();

  const rows = await db.helpRequest.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      cashRegisterId: true,
      cashRegisterName: true,
      operatorId: true,
      operatorName: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  return rows;
}
