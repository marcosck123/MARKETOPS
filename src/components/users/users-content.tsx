"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Plus, UserCheck, UserX, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  createUser,
  toggleUserActive,
  updateUser,
  type UserRow,
} from "@/lib/actions/users";

const ROLES = [
  { value: "operator", label: "Operador" },
  { value: "supervisor", label: "Supervisor" },
  { value: "estoque", label: "Estoque" },
  { value: "financeiro", label: "Financeiro" },
  { value: "admin", label: "Administrador" },
] as const;

const roleBadge: Record<string, { label: string; tone: "success" | "warning" | "danger" | "info" }> = {
  operator: { label: "Operador", tone: "info" },
  supervisor: { label: "Supervisor", tone: "info" },
  estoque: { label: "Estoque", tone: "warning" },
  financeiro: { label: "Financeiro", tone: "warning" },
  admin: { label: "Administrador", tone: "success" },
};

type CreateForm = { name: string; email: string; password: string; role: string };
type EditForm = { name: string; role: string };

const defaultCreateForm: CreateForm = { name: "", email: "", password: "", role: "operator" };

type Props = { users: UserRow[]; currentUserId: string };

export function UsersContent({ users, currentUserId }: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [createForm, setCreateForm] = useState<CreateForm>(defaultCreateForm);
  const [editForm, setEditForm] = useState<EditForm>({ name: "", role: "operator" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await createUser(createForm);
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    setShowCreate(false);
    setCreateForm(defaultCreateForm);
    router.refresh();
  }

  async function handleEdit(event: FormEvent) {
    event.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    setError("");
    const result = await updateUser(editingUser.id, editForm);
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    setEditingUser(null);
    router.refresh();
  }

  async function handleToggle(id: string) {
    const result = await toggleUserActive(id);
    if (!result.success) { setError(result.error); return; }
    router.refresh();
  }

  function openEdit(user: UserRow) {
    setEditingUser(user);
    setEditForm({ name: user.name ?? "", role: user.role });
    setError("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Retaguarda"
        title="Usuários"
        description="Gerencie operadores, supervisores e administradores do sistema."
        action={
          <Button onClick={() => { setShowCreate(true); setError(""); }} className="bg-stone-950 text-white hover:bg-stone-800">
            <Plus className="size-4" aria-hidden="true" />
            Novo usuário
          </Button>
        }
      />

      {users.length === 0 ? (
        <div className="grid min-h-72 place-items-center rounded-lg border border-stone-200 bg-white">
          <div className="text-center">
            <Users className="mx-auto size-10 text-stone-300" />
            <p className="mt-3 text-sm font-medium text-stone-500">Nenhum usuário cadastrado</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome / Email</th>
                <th className="px-4 py-3 font-semibold">Cargo</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Desde</th>
                <th className="px-4 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((user) => {
                const badge = roleBadge[user.role] ?? { label: user.role, tone: "info" as const };
                const isSelf = user.id === currentUserId;
                return (
                  <tr key={user.id} className="text-stone-700 hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-950">{user.name ?? "—"}</p>
                      <p className="text-xs text-stone-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={badge.label} tone={badge.tone} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={user.active ? "Ativo" : "Inativo"}
                        tone={user.active ? "success" : "danger"}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone-500">{user.createdAt}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => openEdit(user)} title="Editar">
                          <Edit3 className="size-4" aria-hidden="true" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => void handleToggle(user.id)}
                          disabled={isSelf}
                          title={isSelf ? "Você não pode desativar sua própria conta" : user.active ? "Desativar" : "Ativar"}
                        >
                          {user.active ? (
                            <UserX className="size-4 text-red-500" aria-hidden="true" />
                          ) : (
                            <UserCheck className="size-4 text-amber-500" aria-hidden="true" />
                          )}
                          <span className="sr-only">{user.active ? "Desativar" : "Ativar"}</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-stone-950">Novo usuário</h2>
            <form onSubmit={(e) => void handleCreate(e)} className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-stone-700">Nome</span>
                <input value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" placeholder="Nome completo (opcional)" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-stone-700">Email <span className="text-red-500">*</span></span>
                <input required type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" placeholder="email@exemplo.com" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-stone-700">Senha <span className="text-red-500">*</span></span>
                <input required type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" placeholder="Mínimo 6 caracteres" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-stone-700">Cargo <span className="text-red-500">*</span></span>
                <select value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))} className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </label>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowCreate(false); setError(""); }}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-stone-950 text-white hover:bg-stone-800">{loading ? "Criando..." : "Criar usuário"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-stone-950">Editar usuário</h2>
            <p className="mt-1 text-sm text-stone-500">{editingUser.email}</p>
            <form onSubmit={(e) => void handleEdit(e)} className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-stone-700">Nome</span>
                <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" placeholder="Nome completo (opcional)" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-stone-700">Cargo</span>
                <select value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))} className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </label>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setEditingUser(null); setError(""); }}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-stone-950 text-white hover:bg-stone-800">{loading ? "Salvando..." : "Salvar"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
