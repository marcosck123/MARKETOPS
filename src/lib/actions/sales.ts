"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Sale } from "@/lib/sale-data";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function persistFinishedSale(
  sale: Sale,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  const operatorId = session?.user?.id;
  if (!operatorId) return { success: false, error: "Não autenticado." };

  if (sale.status !== "finished") {
    return { success: false, error: "Venda não está finalizada." };
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          cashSessionId: sale.cashSessionId,
          operatorId,
          operatorName: sale.operator,
          status: "finished",
          subtotal: sale.subtotal,
          discount: sale.discount,
          total: sale.total,
          notes: sale.notes || null,
          finishedAt: new Date(),
        },
      });

      const code = "VEN-" + newSale.sequence.toString().padStart(6, "0");
      await tx.sale.update({ where: { id: newSale.id }, data: { code } });

      for (const item of sale.items) {
        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          },
        });

        await tx.stockEntry.create({
          data: {
            productId: item.productId,
            quantity: Math.round(item.quantity),
            type: "saida",
            reason: `Venda ${code}`,
            responsible: sale.operator,
          },
        });
      }

      for (const payment of sale.payments) {
        await tx.salePayment.create({
          data: {
            saleId: newSale.id,
            method: payment.method,
            amount: payment.amount,
          },
        });
      }

      return newSale;
    });

    return { success: true, data: { id: result.id } };
  } catch {
    return { success: false, error: "Erro ao persistir venda." };
  }
}
