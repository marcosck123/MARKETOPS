"use server";

import { revalidatePath } from "next/cache";
import { type Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type FiscalRequestRow = {
  id: string;
  saleId: string;
  saleCode: string;
  document: string;
  customerName: string | null;
  status: "pending" | "processing" | "completed" | "cancelled";
  nfeKey: string | null;
  nfeNumber: string | null;
  operatorId: string;
  createdAt: Date;
};

function generateNfeKey(): string {
  let key = "";
  for (let i = 0; i < 44; i++) {
    key += Math.floor(Math.random() * 10).toString();
  }
  return key;
}

export async function createFiscalRequest(params: {
  saleId: string;
  saleCode: string;
  document: string;
  customerId?: string;
  customerName?: string;
  operatorId: string;
}): Promise<ActionResult<{ id: string }>> {
  const existing = await db.fiscalRequest.findFirst({
    where: { saleId: params.saleId, status: { in: ["pending", "processing", "completed"] } },
  });
  if (existing) {
    return { success: false, error: "Esta venda já possui uma solicitação de NF." };
  }

  const doc = params.document.replace(/\D/g, "");
  if (!doc) return { success: false, error: "Documento inválido." };

  const request = await db.fiscalRequest.create({
    data: {
      saleId: params.saleId,
      saleCode: params.saleCode,
      customerId: params.customerId || null,
      document: doc,
      customerName: params.customerName || null,
      operatorId: params.operatorId,
    },
  });

  revalidatePath("/supervisor");
  revalidatePath("/pdv");

  return { success: true, data: { id: request.id } };
}

export async function completeFiscalRequest(
  id: string,
  supervisorId: string,
): Promise<ActionResult<{ nfeKey: string; nfeNumber: string }>> {
  const request = await db.fiscalRequest.findUnique({ where: { id } });
  if (!request) return { success: false, error: "Solicitação não encontrada." };
  if (request.status !== "pending") {
    return { success: false, error: "Solicitação não está pendente." };
  }

  const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const settings = await tx.companySettings.upsert({
      where: { id: "default" },
      update: { nfeSequence: { increment: 1 } },
      create: { id: "default", nfeSequence: 2 },
    });

    const nfeKey = generateNfeKey();
    const nfeNumber = `${settings.nfeSerie}-${settings.nfeSequence.toString().padStart(6, "0")}`;

    const updated = await tx.fiscalRequest.update({
      where: { id },
      data: {
        status: "completed",
        nfeKey,
        nfeNumber,
        supervisorId,
      },
    });

    return { nfeKey: updated.nfeKey!, nfeNumber: updated.nfeNumber! };
  });

  revalidatePath("/supervisor");
  revalidatePath("/pdv");

  return { success: true, data: result };
}

export async function cancelFiscalRequest(id: string): Promise<ActionResult> {
  const request = await db.fiscalRequest.findUnique({ where: { id } });
  if (!request) return { success: false, error: "Solicitação não encontrada." };
  if (request.status === "completed") {
    return { success: false, error: "NF já emitida, não pode ser cancelada." };
  }

  await db.fiscalRequest.update({
    where: { id },
    data: { status: "cancelled" },
  });

  revalidatePath("/supervisor");

  return { success: true, data: undefined };
}

export async function getPendingFiscalRequests(): Promise<FiscalRequestRow[]> {
  const rows = await db.fiscalRequest.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      saleId: true,
      saleCode: true,
      document: true,
      customerName: true,
      status: true,
      nfeKey: true,
      nfeNumber: true,
      operatorId: true,
      createdAt: true,
    },
  });

  return rows as FiscalRequestRow[];
}

export async function getAllFiscalRequests(): Promise<FiscalRequestRow[]> {
  const rows = await db.fiscalRequest.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      saleId: true,
      saleCode: true,
      document: true,
      customerName: true,
      status: true,
      nfeKey: true,
      nfeNumber: true,
      operatorId: true,
      createdAt: true,
    },
  });

  return rows as FiscalRequestRow[];
}
