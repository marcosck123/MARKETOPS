"use server";

import { db } from "@/lib/db";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type CustomerRow = {
  id: string;
  type: "cpf" | "cnpj";
  document: string;
  name: string;
  tradeName: string | null;
  email: string | null;
  phone: string | null;
  active: boolean;
};

type CreateCustomerParams = {
  type: "cpf" | "cnpj";
  document: string;
  name: string;
  tradeName?: string;
  email?: string;
  phone?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  ie?: string;
};

export async function createCustomer(
  params: CreateCustomerParams,
): Promise<ActionResult<{ id: string }>> {
  const doc = params.document.replace(/\D/g, "");
  if (!doc) return { success: false, error: "Documento inválido." };

  const existing = await db.customer.findUnique({ where: { document: doc } });
  if (existing) return { success: false, error: "Documento já cadastrado." };

  const customer = await db.customer.create({
    data: {
      type: params.type,
      document: doc,
      name: params.name.trim(),
      tradeName: params.tradeName?.trim() || null,
      email: params.email?.trim() || null,
      phone: params.phone?.trim() || null,
      zipCode: params.zipCode?.trim() || null,
      street: params.street?.trim() || null,
      number: params.number?.trim() || null,
      complement: params.complement?.trim() || null,
      district: params.district?.trim() || null,
      city: params.city?.trim() || null,
      state: params.state?.trim() || null,
      ie: params.ie?.trim() || null,
    },
  });

  return { success: true, data: { id: customer.id } };
}

export async function updateCustomer(
  id: string,
  params: Partial<CreateCustomerParams>,
): Promise<ActionResult> {
  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer) return { success: false, error: "Cliente não encontrado." };

  if (params.document) {
    const doc = params.document.replace(/\D/g, "");
    if (doc !== customer.document) {
      const conflict = await db.customer.findUnique({ where: { document: doc } });
      if (conflict) return { success: false, error: "Documento já cadastrado." };
      params.document = doc;
    }
  }

  await db.customer.update({
    where: { id },
    data: {
      name: params.name?.trim(),
      tradeName: params.tradeName?.trim() || null,
      email: params.email?.trim() || null,
      phone: params.phone?.trim() || null,
      zipCode: params.zipCode?.trim() || null,
      street: params.street?.trim() || null,
      number: params.number?.trim() || null,
      complement: params.complement?.trim() || null,
      district: params.district?.trim() || null,
      city: params.city?.trim() || null,
      state: params.state?.trim() || null,
      ie: params.ie?.trim() || null,
    },
  });

  return { success: true, data: undefined };
}

export async function toggleCustomerStatus(id: string): Promise<ActionResult> {
  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer) return { success: false, error: "Cliente não encontrado." };

  await db.customer.update({
    where: { id },
    data: { active: !customer.active },
  });

  return { success: true, data: undefined };
}

export async function findCustomerByDocument(
  document: string,
): Promise<(CustomerRow & { city: string | null; state: string | null }) | null> {
  const doc = document.replace(/\D/g, "");
  if (!doc) return null;

  const customer = await db.customer.findUnique({
    where: { document: doc },
    select: {
      id: true,
      type: true,
      document: true,
      name: true,
      tradeName: true,
      email: true,
      phone: true,
      active: true,
      city: true,
      state: true,
    },
  });

  return customer as typeof customer & { type: "cpf" | "cnpj" };
}

export async function listCustomers(search?: string): Promise<CustomerRow[]> {
  const rows = await db.customer.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { document: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    select: {
      id: true,
      type: true,
      document: true,
      name: true,
      tradeName: true,
      email: true,
      phone: true,
      active: true,
    },
  });

  return rows as CustomerRow[];
}
