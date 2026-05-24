"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";

type CreateAuditLogData = {
  module: string;
  action: string;
  severity?: "info" | "warning" | "critical";
  actorId?: string;
  actorName: string;
  actorRole?: string;
  target: string;
  targetId: string;
  description: string;
};

export async function createAuditLog(data: CreateAuditLogData): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        module: data.module,
        action: data.action,
        severity: data.severity ?? "info",
        reviewStatus: "pending",
        actorId: data.actorId,
        actorName: data.actorName,
        actorRole: data.actorRole ?? "system",
        target: data.target,
        targetId: data.targetId,
        description: data.description,
      },
    });
  } catch {
    // Audit failures must not block the main operation
  }
}

export async function updateAuditLogReview(
  id: string,
  status: "reviewed" | "ignored" | "pending",
): Promise<void> {
  await db.auditLog.update({ where: { id }, data: { reviewStatus: status } });
  revalidatePath("/admin/auditoria");
}
