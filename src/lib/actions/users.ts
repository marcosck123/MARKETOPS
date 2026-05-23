"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const VALID_ROLES = ["operator", "supervisor", "estoque", "financeiro", "admin"] as const;
type UserRole = (typeof VALID_ROLES)[number];

export type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  active: boolean;
  createdAt: string;
};

export async function getUsers(): Promise<UserRow[]> {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return users.map((u: (typeof users)[number]) => ({
    ...u,
    createdAt: new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(u.createdAt),
  }));
}

export async function createUser(formData: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<ActionResult<{ id: string }>> {
  const email = formData.email.trim().toLowerCase();
  const name = formData.name.trim() || null;
  const role = formData.role as UserRole;

  if (!email) return { success: false, error: "Email é obrigatório." };
  if (!formData.password || formData.password.length < 6)
    return { success: false, error: "Senha deve ter no mínimo 6 caracteres." };
  if (!VALID_ROLES.includes(role))
    return { success: false, error: "Cargo inválido." };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: "Email já cadastrado." };

  const passwordHash = await bcrypt.hash(formData.password, 12);

  try {
    const user = await db.user.create({
      data: { name, email, passwordHash, role, active: true },
    });
    revalidatePath("/admin/usuarios");
    return { success: true, data: { id: user.id } };
  } catch {
    return { success: false, error: "Erro ao criar usuário." };
  }
}

export async function updateUser(
  id: string,
  formData: { name: string; role: string },
): Promise<ActionResult> {
  const name = formData.name.trim() || null;
  const role = formData.role as UserRole;

  if (!VALID_ROLES.includes(role))
    return { success: false, error: "Cargo inválido." };

  try {
    await db.user.update({ where: { id }, data: { name, role } });
    revalidatePath("/admin/usuarios");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao atualizar usuário." };
  }
}

export async function toggleUserActive(id: string): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.id === id)
    return { success: false, error: "Você não pode desativar sua própria conta." };

  try {
    const user = await db.user.findUnique({ where: { id }, select: { active: true } });
    if (!user) return { success: false, error: "Usuário não encontrado." };

    await db.user.update({ where: { id }, data: { active: !user.active } });
    revalidatePath("/admin/usuarios");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao alterar status do usuário." };
  }
}
