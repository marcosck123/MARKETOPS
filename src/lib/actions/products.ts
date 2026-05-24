"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/actions/audit-log";

type ProductUnit =
  | "unidade"
  | "caixa"
  | "fardo"
  | "pacote"
  | "quilo"
  | "litro"
  | "volume";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

type ProductFormData = {
  name: string;
  barcode: string;
  sku: string;
  sectionId: string;
  categoryId: string;
  unit: ProductUnit;
  costPrice: number;
  salePrice: number;
  wholesalePrice: number;
  currentStock: number;
  minimumStock: number;
};

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateProductForm(
  data: ProductFormData,
): string | null {
  if (!data.name.trim()) return "Nome é obrigatório.";
  if (!data.barcode.trim()) return "Código de barras é obrigatório.";
  if (!data.sku.trim()) return "SKU é obrigatório.";
  if (!data.sectionId) return "Seção é obrigatória.";
  if (!data.categoryId) return "Categoria é obrigatória.";
  if (data.costPrice < 0) return "Preço de custo inválido.";
  if (data.salePrice < 0) return "Preço de venda inválido.";
  if (data.wholesalePrice < 0) return "Preço atacado inválido.";
  if (data.currentStock < 0) return "Estoque atual inválido.";
  if (data.minimumStock < 0) return "Estoque mínimo inválido.";
  return null;
}

export async function createProduct(
  data: ProductFormData,
): Promise<ActionResult<{ id: string }>> {
  const error = validateProductForm(data);
  if (error) return { success: false, error };

  const [section, category] = await Promise.all([
    db.section.findUnique({ where: { id: data.sectionId } }),
    db.category.findUnique({ where: { id: data.categoryId } }),
  ]);
  if (!section) return { success: false, error: "Seção não encontrada." };
  if (!category) return { success: false, error: "Categoria não encontrada." };

  const id = toSlug(data.name) || toSlug(data.sku);
  if (!id) return { success: false, error: "Nome inválido para gerar ID." };

  try {
    await db.product.create({
      data: {
        id,
        name: data.name.trim(),
        barcode: data.barcode.trim(),
        sku: data.sku.trim(),
        sectionId: data.sectionId,
        categoryId: data.categoryId,
        unit: data.unit,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        wholesalePrice: data.wholesalePrice,
        currentStock: data.currentStock,
        minimumStock: data.minimumStock,
      },
    });
    await createAuditLog({
      module: "catalog",
      action: "created",
      actorName: "Sistema",
      target: "Produto",
      targetId: id,
      description: `Produto "${data.name.trim()}" criado (SKU: ${data.sku.trim()})`,
    });
    revalidatePath("/produtos");
    return { success: true, data: { id } };
  } catch {
    return {
      success: false,
      error: "Erro ao criar produto. Verifique se o código de barras ou SKU já estão cadastrados.",
    };
  }
}

export async function updateProduct(
  id: string,
  data: ProductFormData,
): Promise<ActionResult> {
  if (!id) return { success: false, error: "ID inválido." };

  const error = validateProductForm(data);
  if (error) return { success: false, error };

  const [section, category] = await Promise.all([
    db.section.findUnique({ where: { id: data.sectionId } }),
    db.category.findUnique({ where: { id: data.categoryId } }),
  ]);
  if (!section) return { success: false, error: "Seção não encontrada." };
  if (!category) return { success: false, error: "Categoria não encontrada." };

  try {
    await db.product.update({
      where: { id },
      data: {
        name: data.name.trim(),
        barcode: data.barcode.trim(),
        sku: data.sku.trim(),
        sectionId: data.sectionId,
        categoryId: data.categoryId,
        unit: data.unit,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        wholesalePrice: data.wholesalePrice,
        currentStock: data.currentStock,
        minimumStock: data.minimumStock,
      },
    });
    await createAuditLog({
      module: "catalog",
      action: "updated",
      actorName: "Sistema",
      target: "Produto",
      targetId: id,
      description: `Produto "${data.name.trim()}" atualizado`,
    });
    revalidatePath("/produtos");
    return { success: true, data: undefined };
  } catch {
    return {
      success: false,
      error: "Erro ao atualizar produto. Verifique se o código de barras ou SKU já estão em uso.",
    };
  }
}

export async function toggleProductStatus(id: string): Promise<ActionResult> {
  if (!id) return { success: false, error: "ID inválido." };

  try {
    const product = await db.product.findUnique({ where: { id } });
    if (!product) return { success: false, error: "Produto não encontrado." };

    const newStatus = product.status === "active" ? "inactive" : "active";
    await db.product.update({
      where: { id },
      data: { status: newStatus },
    });
    await createAuditLog({
      module: "catalog",
      action: "updated",
      severity: newStatus === "inactive" ? "warning" : "info",
      actorName: "Sistema",
      target: "Produto",
      targetId: id,
      description: `Produto "${product.name}" ${newStatus === "active" ? "ativado" : "desativado"}`,
    });
    revalidatePath("/produtos");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao alterar status do produto." };
  }
}
