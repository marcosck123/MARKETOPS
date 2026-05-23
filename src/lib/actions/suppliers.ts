"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type SupplierRow = {
  id: string;
  name: string;
  cnpj: string | null;
  phone: string | null;
  email: string | null;
  contactName: string | null;
  notes: string | null;
  active: boolean;
  createdAt: Date;
};

type SupplierInput = {
  name: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  contactName?: string;
  notes?: string;
};

export async function listSuppliers(search?: string): Promise<SupplierRow[]> {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { cnpj: { contains: search.replace(/\D/g, "") } },
        ],
      }
    : {};
  return db.supplier.findMany({ where, orderBy: { name: "asc" } });
}

export async function createSupplier(
  data: SupplierInput,
): Promise<ActionResult<SupplierRow>> {
  const cnpj = data.cnpj ? data.cnpj.replace(/\D/g, "") : null;
  if (cnpj) {
    const existing = await db.supplier.findUnique({ where: { cnpj } });
    if (existing) return { success: false, error: "CNPJ já cadastrado." };
  }
  const supplier = await db.supplier.create({
    data: {
      name: data.name.trim(),
      cnpj: cnpj || null,
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      contactName: data.contactName?.trim() || null,
      notes: data.notes?.trim() || null,
    },
  });
  revalidatePath("/admin/fornecedores");
  return { success: true, data: supplier };
}

export async function updateSupplier(
  id: string,
  data: SupplierInput,
): Promise<ActionResult<SupplierRow>> {
  const cnpj = data.cnpj ? data.cnpj.replace(/\D/g, "") : null;
  if (cnpj) {
    const existing = await db.supplier.findUnique({ where: { cnpj } });
    if (existing && existing.id !== id)
      return { success: false, error: "CNPJ já cadastrado para outro fornecedor." };
  }
  const supplier = await db.supplier.update({
    where: { id },
    data: {
      name: data.name.trim(),
      cnpj: cnpj || null,
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      contactName: data.contactName?.trim() || null,
      notes: data.notes?.trim() || null,
    },
  });
  revalidatePath("/admin/fornecedores");
  return { success: true, data: supplier };
}

export async function toggleSupplierStatus(
  id: string,
): Promise<ActionResult> {
  const supplier = await db.supplier.findUnique({ where: { id } });
  if (!supplier) return { success: false, error: "Fornecedor não encontrado." };
  await db.supplier.update({ where: { id }, data: { active: !supplier.active } });
  revalidatePath("/admin/fornecedores");
  return { success: true, data: undefined };
}
