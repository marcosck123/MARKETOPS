import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOperatorActiveSession } from "@/lib/actions/cash-sessions";
import { SessionGate } from "@/components/pos/session-gate";
import { PosContent } from "@/components/pos/pos-content";

export default async function PosPage() {
  const session = await auth();
  const operatorId = session?.user?.id ?? "";
  const operatorName = session?.user?.name ?? "Operador";

  const activeSession = await getOperatorActiveSession(operatorId);

  if (!activeSession) {
    const registers = await db.cashRegister.findMany({
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

  return <PosContent cashSession={activeSession} />;
}
