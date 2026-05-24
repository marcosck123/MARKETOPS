"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/actions/audit-log";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type StockSummaryItem = {
  productId: string;
  productName: string;
  productSku: string;
  sectionId: string;
  categoryId: string;
  costPrice: number;
  currentStock: number;
  minimumStock: number;
  status: "active" | "inactive";
};

export async function getStockSummary(): Promise<
  ActionResult<StockSummaryItem[]>
> {
  const [products, grouped] = await Promise.all([
    db.product.findMany({ orderBy: { name: "asc" } }),
    db.stockEntry.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
    }),
  ]);

  const stockMap = new Map(
    grouped.map((g: (typeof grouped)[number]) => [g.productId, g._sum.quantity ?? 0]),
  );

  return {
    success: true,
    data: products.map((p: (typeof products)[number]) => ({
      productId: p.id,
      productName: p.name,
      productSku: p.sku,
      sectionId: p.sectionId,
      categoryId: p.categoryId,
      costPrice: p.costPrice,
      currentStock: stockMap.get(p.id) ?? p.currentStock,
      minimumStock: p.minimumStock,
      status: p.status as "active" | "inactive",
    })),
  };
}

export async function adjustStock(data: {
  productId: string;
  quantity: number;
  type: "entrada" | "saida" | "ajuste";
  reason?: string;
  responsible?: string;
}): Promise<ActionResult> {
  if (!data.productId) return { success: false, error: "Produto obrigatório." };
  if (data.quantity === 0)
    return { success: false, error: "Quantidade não pode ser zero." };

  const product = await db.product.findUnique({
    where: { id: data.productId },
  });
  if (!product) return { success: false, error: "Produto não encontrado." };

  // saida reduces stock — store as negative
  const storedQuantity =
    data.type === "saida" ? -Math.abs(data.quantity) : data.quantity;

  try {
    await db.stockEntry.create({
      data: {
        productId: data.productId,
        quantity: storedQuantity,
        type: data.type,
        reason: data.reason?.trim() || null,
        responsible: data.responsible?.trim() || null,
      },
    });
    await createAuditLog({
      module: "stock",
      action: data.type === "entrada" ? "created" : "updated",
      severity: data.type === "saida" ? "warning" : "info",
      actorName: data.responsible ?? "Sistema",
      target: "Estoque",
      targetId: data.productId,
      description: `${data.type === "entrada" ? "Entrada" : data.type === "saida" ? "Saída" : "Ajuste"} de ${Math.abs(data.quantity)} unidades — ${data.reason ?? "sem motivo"}`,
    });
    revalidatePath("/estoque");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao registrar movimentação." };
  }
}
