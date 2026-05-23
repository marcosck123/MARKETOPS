"use server";

import { revalidatePath } from "next/cache";
import { type Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type StockReceiptStatus = "draft" | "confirmed" | "cancelled";

export type StockReceiptRow = {
  id: string;
  code: string;
  supplierId: string | null;
  supplierName: string | null;
  invoiceNumber: string | null;
  status: StockReceiptStatus;
  notes: string | null;
  totalCost: number;
  confirmedAt: Date | null;
  createdAt: Date;
  _count: { items: number };
};

export type StockReceiptItemRow = {
  id: string;
  stockReceiptId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
};

export async function listStockReceipts(
  status?: StockReceiptStatus,
): Promise<StockReceiptRow[]> {
  return db.stockReceipt.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  }) as Promise<StockReceiptRow[]>;
}

export async function createStockReceipt(params: {
  supplierId?: string;
  supplierName?: string;
  invoiceNumber?: string;
  notes?: string;
}): Promise<ActionResult<StockReceiptRow>> {
  const receipt = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const newReceipt = await tx.stockReceipt.create({
      data: {
        supplierId: params.supplierId || null,
        supplierName: params.supplierName?.trim() || null,
        invoiceNumber: params.invoiceNumber?.trim() || null,
        notes: params.notes?.trim() || null,
      },
    });
    const code = "NE-" + newReceipt.sequence.toString().padStart(6, "0");
    const updated = await tx.stockReceipt.update({
      where: { id: newReceipt.id },
      data: { code },
      include: { _count: { select: { items: true } } },
    });
    return updated;
  });
  revalidatePath("/admin/compras");
  return { success: true, data: receipt as StockReceiptRow };
}

export async function addReceiptItem(params: {
  stockReceiptId: string;
  productId: string;
  quantity: number;
  unitCost: number;
}): Promise<ActionResult<StockReceiptItemRow>> {
  const receipt = await db.stockReceipt.findUnique({
    where: { id: params.stockReceiptId },
  });
  if (!receipt) return { success: false, error: "Recebimento não encontrado." };
  if (receipt.status !== "draft")
    return { success: false, error: "Apenas recebimentos em rascunho podem receber itens." };

  const product = await db.product.findUnique({ where: { id: params.productId } });
  if (!product) return { success: false, error: "Produto não encontrado." };

  const total = params.quantity * params.unitCost;
  const item = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const newItem = await tx.stockReceiptItem.create({
      data: {
        stockReceiptId: params.stockReceiptId,
        productId: params.productId,
        productName: product.name,
        quantity: params.quantity,
        unitCost: params.unitCost,
        total,
      },
    });
    const allItems = await tx.stockReceiptItem.findMany({
      where: { stockReceiptId: params.stockReceiptId },
    });
    const newTotal = allItems.reduce((sum: number, i: { total: number }) => sum + i.total, 0);
    await tx.stockReceipt.update({
      where: { id: params.stockReceiptId },
      data: { totalCost: newTotal },
    });
    return newItem;
  });
  revalidatePath("/admin/compras");
  return { success: true, data: item };
}

export async function removeReceiptItem(
  itemId: string,
): Promise<ActionResult> {
  const item = await db.stockReceiptItem.findUnique({ where: { id: itemId } });
  if (!item) return { success: false, error: "Item não encontrado." };

  const receipt = await db.stockReceipt.findUnique({
    where: { id: item.stockReceiptId },
  });
  if (!receipt || receipt.status !== "draft")
    return { success: false, error: "Apenas recebimentos em rascunho podem ter itens removidos." };

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.stockReceiptItem.delete({ where: { id: itemId } });
    const remaining = await tx.stockReceiptItem.findMany({
      where: { stockReceiptId: item.stockReceiptId },
    });
    const newTotal = remaining.reduce((sum: number, i: { total: number }) => sum + i.total, 0);
    await tx.stockReceipt.update({
      where: { id: item.stockReceiptId },
      data: { totalCost: newTotal },
    });
  });
  revalidatePath("/admin/compras");
  return { success: true, data: undefined };
}

export async function confirmStockReceipt(
  id: string,
): Promise<ActionResult> {
  const receipt = await db.stockReceipt.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!receipt) return { success: false, error: "Recebimento não encontrado." };
  if (receipt.status !== "draft")
    return { success: false, error: "Apenas rascunhos podem ser confirmados." };
  if (receipt.items.length === 0)
    return { success: false, error: "Adicione ao menos um item antes de confirmar." };

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    for (const item of receipt.items) {
      await tx.stockEntry.create({
        data: {
          productId: item.productId,
          quantity: Math.round(item.quantity),
          type: "entrada",
          reason: `Recebimento ${receipt.code}`,
          responsible: receipt.supplierName ?? "Fornecedor",
        },
      });
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { increment: Math.round(item.quantity) } },
      });
    }
    await tx.stockReceipt.update({
      where: { id },
      data: { status: "confirmed", confirmedAt: new Date() },
    });
  });
  revalidatePath("/admin/compras");
  revalidatePath("/admin/estoque");
  return { success: true, data: undefined };
}

export async function cancelStockReceipt(
  id: string,
): Promise<ActionResult> {
  const receipt = await db.stockReceipt.findUnique({ where: { id } });
  if (!receipt) return { success: false, error: "Recebimento não encontrado." };
  if (receipt.status !== "draft")
    return { success: false, error: "Apenas rascunhos podem ser cancelados." };
  await db.stockReceipt.update({
    where: { id },
    data: { status: "cancelled" },
  });
  revalidatePath("/admin/compras");
  return { success: true, data: undefined };
}

export async function getReceiptItems(
  stockReceiptId: string,
): Promise<StockReceiptItemRow[]> {
  return db.stockReceiptItem.findMany({
    where: { stockReceiptId },
    orderBy: { id: "asc" },
  });
}
