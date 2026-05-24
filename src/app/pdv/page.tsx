import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOperatorActiveSession } from "@/lib/actions/cash-sessions";
import { SessionGate } from "@/components/pos/session-gate";
import { PosContent } from "@/components/pos/pos-content";
import type { Product } from "@/lib/product-data";

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

  const dbProducts = await db.product.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      barcode: true,
      sku: true,
      sectionId: true,
      categoryId: true,
      unit: true,
      costPrice: true,
      salePrice: true,
      wholesalePrice: true,
      currentStock: true,
      minimumStock: true,
      status: true,
    },
  });

  return (
    <PosContent
      products={dbProducts as unknown as Product[]}
      cashSession={activeSession}
    />
  );
}
