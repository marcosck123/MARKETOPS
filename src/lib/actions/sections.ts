"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/actions/audit-log";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createSection(formData: {
  name: string;
  description: string;
}): Promise<ActionResult<{ id: string }>> {
  const name = formData.name.trim();
  if (!name) return { success: false, error: "Nome é obrigatório." };

  const id = toSlug(name);
  if (!id) return { success: false, error: "Nome inválido para gerar ID." };

  try {
    await db.section.create({
      data: { id, name, description: formData.description.trim() },
    });
    await createAuditLog({
      module: "catalog",
      action: "created",
      actorName: "Sistema",
      target: "Secao",
      targetId: id,
      description: `Seção "${name}" criada`,
    });
    revalidatePath("/secoes-categorias");
    return { success: true, data: { id } };
  } catch {
    return { success: false, error: "Erro ao criar seção. Verifique se já existe uma seção com esse nome." };
  }
}

export async function updateSection(
  id: string,
  formData: { name: string; description: string },
): Promise<ActionResult> {
  const name = formData.name.trim();
  if (!id) return { success: false, error: "ID inválido." };
  if (!name) return { success: false, error: "Nome é obrigatório." };

  try {
    await db.section.update({
      where: { id },
      data: { name, description: formData.description.trim() },
    });
    await createAuditLog({
      module: "catalog",
      action: "updated",
      actorName: "Sistema",
      target: "Secao",
      targetId: id,
      description: `Seção "${name}" atualizada`,
    });
    revalidatePath("/secoes-categorias");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao atualizar seção." };
  }
}

export async function toggleSectionStatus(id: string): Promise<ActionResult> {
  if (!id) return { success: false, error: "ID inválido." };

  try {
    const section = await db.section.findUnique({ where: { id } });
    if (!section) return { success: false, error: "Seção não encontrada." };

    const newStatus = section.status === "active" ? "inactive" : "active";
    await db.section.update({
      where: { id },
      data: { status: newStatus },
    });
    await createAuditLog({
      module: "catalog",
      action: "updated",
      severity: newStatus === "inactive" ? "warning" : "info",
      actorName: "Sistema",
      target: "Secao",
      targetId: id,
      description: `Seção "${section.name}" ${newStatus === "active" ? "ativada" : "desativada"}`,
    });
    revalidatePath("/secoes-categorias");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao alterar status da seção." };
  }
}
