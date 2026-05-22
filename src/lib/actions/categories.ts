"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";

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

export async function createCategory(formData: {
  name: string;
  sectionId: string;
}): Promise<ActionResult<{ id: string }>> {
  const name = formData.name.trim();
  const sectionId = formData.sectionId.trim();

  if (!name) return { success: false, error: "Nome é obrigatório." };
  if (!sectionId) return { success: false, error: "Seção é obrigatória." };

  const section = await db.section.findUnique({ where: { id: sectionId } });
  if (!section) return { success: false, error: "Seção não encontrada." };

  const id = toSlug(name);
  if (!id) return { success: false, error: "Nome inválido para gerar ID." };

  try {
    await db.category.create({
      data: { id, name, sectionId },
    });
    revalidatePath("/secoes-categorias");
    return { success: true, data: { id } };
  } catch {
    return { success: false, error: "Erro ao criar categoria. Verifique se já existe uma categoria com esse nome." };
  }
}

export async function updateCategory(
  id: string,
  formData: { name: string; sectionId: string },
): Promise<ActionResult> {
  const name = formData.name.trim();
  const sectionId = formData.sectionId.trim();

  if (!id) return { success: false, error: "ID inválido." };
  if (!name) return { success: false, error: "Nome é obrigatório." };
  if (!sectionId) return { success: false, error: "Seção é obrigatória." };

  const section = await db.section.findUnique({ where: { id: sectionId } });
  if (!section) return { success: false, error: "Seção não encontrada." };

  try {
    await db.category.update({
      where: { id },
      data: { name, sectionId },
    });
    revalidatePath("/secoes-categorias");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao atualizar categoria." };
  }
}

export async function toggleCategoryStatus(id: string): Promise<ActionResult> {
  if (!id) return { success: false, error: "ID inválido." };

  try {
    const category = await db.category.findUnique({ where: { id } });
    if (!category) return { success: false, error: "Categoria não encontrada." };

    await db.category.update({
      where: { id },
      data: { status: category.status === "active" ? "inactive" : "active" },
    });
    revalidatePath("/secoes-categorias");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao alterar status da categoria." };
  }
}
