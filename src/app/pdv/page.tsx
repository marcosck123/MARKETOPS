import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOperatorActiveSession } from "@/lib/actions/cash-sessions";
import { SessionGate } from "@/components/pos/session-gate";
import { PdvClient } from "./components/PdvClient";
import type { Product } from "@/lib/product-data";
import type { PromoItem } from "./components/PromoCarousel";

export default async function PosPage() {
  const session = await auth();
  const operatorId = session?.user?.id ?? "";
  const operatorName = session?.user?.name ?? "Operador";

  const activeSession = await getOperatorActiveSession(operatorId);

  if (!activeSession) {
    const registers = await db.cashRegister.findMany({
      where: { status: "open" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return (
      <SessionGate
        registers={registers}
        operatorId={operatorId}
        operatorName={operatorName}
      />
    );
  }

  const [dbProducts, company, promotions] = await Promise.all([
    db.product.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
      select: {
        id: true, name: true, barcode: true, sku: true,
        sectionId: true, categoryId: true, unit: true,
        costPrice: true, salePrice: true, wholesalePrice: true,
        currentStock: true, minimumStock: true, status: true,
      },
    }),
    db.companySettings.findUnique({ where: { id: "default" } }),
    // Promotion table may not exist yet (migration pending) — degrade gracefully
    (async (): Promise<PromoItem[]> => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await (db as any).promotion.findMany({
          where: { active: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true, title: true, description: true, badge: true },
        }) as PromoItem[];
      } catch {
        return [];
      }
    })(),
  ]);

  return (
    <PdvClient
      products={dbProducts as unknown as Product[]}
      cashSession={activeSession}
      promotions={promotions}
      companyName={company?.razaoSocial ?? "MARKETOPS"}
      slogan="Otimizando sua operação"
    />
  );
}
