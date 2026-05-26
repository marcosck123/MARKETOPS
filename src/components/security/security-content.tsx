"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  KeyRound,
  Monitor,
  Plus,
  Power,
  Search,
  ShieldCheck,
  UserCheck,
  UserRoundPlus,
  UserX,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  type PermissionArea,
  type PermissionLevel,
  type SecurityPolicy,
  type SecurityRole,
  type SecuritySession,
  type SecuritySessionStatus,
  type SecurityUser,
  type SecurityUserStatus,
  initialSecurityPolicies,
  initialSecuritySessions,
  initialSecurityUsers,
  permissionAreaLabels,
  permissionLevelLabels,
  rolePermissions,
  securityRoleLabels,
  securitySessionStatusLabels,
  securityUserStatusLabels,
} from "@/lib/security-data";

const roleOptions = Object.keys(securityRoleLabels) as SecurityRole[];
const statusOptions = Object.keys(
  securityUserStatusLabels,
) as SecurityUserStatus[];
const permissionAreas = Object.keys(permissionAreaLabels) as PermissionArea[];

type SecurityUserFormState = {
  name: string;
  email: string;
  role: SecurityRole;
  storeName: string;
  mfaEnabled: boolean;
};

const emptyUserForm: SecurityUserFormState = {
  name: "",
  email: "",
  role: "CAIXA",
  storeName: "Loja Matriz",
  mfaEnabled: false,
};

function getUserStatusTone(status: SecurityUserStatus) {
  if (status === "active") {
    return "success" as const;
  }

  if (status === "blocked") {
    return "danger" as const;
  }

  return "warning" as const;
}

function getSessionStatusTone(status: SecuritySessionStatus) {
  if (status === "active") {
    return "success" as const;
  }

  if (status === "revoked") {
    return "danger" as const;
  }

  return "warning" as const;
}

function getRiskTone(riskScore: number) {
  if (riskScore >= 70) {
    return "danger" as const;
  }

  if (riskScore >= 40) {
    return "warning" as const;
  }

  return "success" as const;
}

function getPolicyTone(impact: SecurityPolicy["impact"]) {
  if (impact === "high") {
    return "danger" as const;
  }

  if (impact === "medium") {
    return "warning" as const;
  }

  return "info" as const;
}

function getPermissionTone(level: PermissionLevel) {
  if (level === "admin" || level === "approve") {
    return "success" as const;
  }

  if (level === "write") {
    return "warning" as const;
  }

  if (level === "none") {
    return "danger" as const;
  }

  return "info" as const;
}

export function SecurityContent() {
  const [users, setUsers] = useState<SecurityUser[]>(initialSecurityUsers);
  const [sessions, setSessions] = useState<SecuritySession[]>(
    initialSecuritySessions,
  );
  const [policies, setPolicies] = useState<SecurityPolicy[]>(
    initialSecurityPolicies,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | SecurityRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | SecurityUserStatus>(
    "all",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.storeName.toLowerCase().includes(search);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, searchTerm, statusFilter, users]);

  const activeUsers = users.filter((user) => user.status === "active");
  const blockedUsers = users.filter((user) => user.status === "blocked");
  const usersWithMfa = users.filter((user) => user.mfaEnabled);
  const riskyUsers = users.filter((user) => user.riskScore >= 40);
  const activeSessions = sessions.filter((session) => session.status === "active");

  function updateUserStatus(userId: string, status: SecurityUserStatus) {
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              status,
              failedAttempts: status === "blocked" ? user.failedAttempts : 0,
            }
          : user,
      ),
    );
  }

  function requireMfa(userId: string) {
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              mfaEnabled: true,
              riskScore: Math.max(0, user.riskScore - 15),
            }
          : user,
      ),
    );
  }

  function revokeSession(sessionId: string) {
    setSessions((current) =>
      current.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status: "revoked",
            }
          : session,
      ),
    );
  }

  function togglePolicy(policyId: string) {
    setPolicies((current) =>
      current.map((policy) =>
        policy.id === policyId
          ? {
              ...policy,
              enabled: !policy.enabled,
            }
          : policy,
      ),
    );
  }

  function handleCreateUser(formState: SecurityUserFormState) {
    const nextNumber = users.length + 1001;
    const newUser: SecurityUser = {
      id: `user-${nextNumber}`,
      name: formState.name,
      email: formState.email,
      role: formState.role,
      status: "invited",
      storeName: formState.storeName,
      mfaEnabled: formState.mfaEnabled,
      lastAccess: "Convite pendente",
      failedAttempts: 0,
      riskScore: formState.mfaEnabled ? 8 : 24,
    };

    setUsers((current) => [newUser, ...current]);
    setIsModalOpen(false);
  }

  return (
    <>
      <PageHeader
        eyebrow="Controle de acesso"
        title="Seguranca"
        description="Administre usuarios, papeis, sessoes e politicas de protecao antes da autenticacao real com Supabase."
        action={
          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-400 text-stone-950 hover:bg-amber-300"
          >
            <Plus className="size-4" aria-hidden="true" />
            Novo usuario
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Usuarios ativos" value={String(activeUsers.length)} />
        <SummaryCard label="Com MFA" value={`${usersWithMfa.length}/${users.length}`} />
        <SummaryCard label="Bloqueados" value={String(blockedUsers.length)} />
        <SummaryCard label="Risco alto" value={String(riskyUsers.length)} />
      </section>

      <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-blue-700" />
          <div>
            <h2 className="text-sm font-semibold text-blue-900">
              Camada simulada de seguranca
            </h2>
            <p className="mt-1 text-sm leading-6 text-blue-800">
              Este modulo organiza o modelo de acesso. Login real, tokens,
              refresh de sessao e recuperacao de senha entram quando o backend
              estiver conectado.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200 px-5 py-4 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-base font-semibold text-stone-950">
              Usuarios e acessos
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Controle status, cargo, MFA, tentativas de login e risco.
            </p>
          </div>

          <div className="grid gap-2 lg:grid-cols-[1fr_150px_150px]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar usuario"
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 pl-9 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as "all" | SecurityRole)
              }
              className="h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
            >
              <option value="all">Todos cargos</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {securityRoleLabels[role]}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "all" | SecurityUserStatus,
                )
              }
              className="h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
            >
              <option value="all">Todos status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {securityUserStatusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Usuario</th>
                <th className="px-5 py-3 font-semibold">Cargo</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">MFA</th>
                <th className="px-5 py-3 font-semibold">Risco</th>
                <th className="px-5 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="text-stone-700">
                  <td className="px-5 py-4">
                    <p className="font-medium text-stone-950">{user.name}</p>
                    <p className="mt-1 text-xs text-stone-500">{user.email}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {user.storeName} | Ultimo acesso: {user.lastAccess}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge
                      label={securityRoleLabels[user.role]}
                      tone="info"
                    />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge
                      label={securityUserStatusLabels[user.status]}
                      tone={getUserStatusTone(user.status)}
                    />
                    {user.failedAttempts > 0 ? (
                      <p className="mt-1 text-xs text-red-600">
                        {user.failedAttempts} falha(s) de login
                      </p>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge
                      label={user.mfaEnabled ? "Ativo" : "Pendente"}
                      tone={user.mfaEnabled ? "success" : "warning"}
                    />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge
                      label={`${user.riskScore} pontos`}
                      tone={getRiskTone(user.riskScore)}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {!user.mfaEnabled ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => requireMfa(user.id)}
                        >
                          <KeyRound className="size-4" aria-hidden="true" />
                          Exigir MFA
                        </Button>
                      ) : null}
                      {user.status === "blocked" ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => updateUserStatus(user.id, "active")}
                        >
                          <UserCheck className="size-4" aria-hidden="true" />
                          Desbloquear
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => updateUserStatus(user.id, "blocked")}
                        >
                          <UserX className="size-4" aria-hidden="true" />
                          Bloquear
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="text-base font-semibold text-stone-950">
              Politicas de protecao
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Ative regras de protecao que depois viram validacoes reais.
            </p>
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-2">
            {policies.map((policy) => (
              <article
                key={policy.id}
                className="rounded-lg border border-stone-200 bg-stone-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-stone-950">
                      {policy.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-stone-500">
                      {policy.description}
                    </p>
                  </div>
                  <StatusBadge
                    label={policy.enabled ? "Ativa" : "Inativa"}
                    tone={policy.enabled ? "success" : "warning"}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <StatusBadge
                    label={`Impacto ${policy.impact}`}
                    tone={getPolicyTone(policy.impact)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => togglePolicy(policy.id)}
                  >
                    {policy.enabled ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="text-base font-semibold text-stone-950">
              Sessoes ativas
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Monitore dispositivos e encerre acessos suspeitos.
            </p>
          </div>

          <div className="space-y-3 p-5">
            {sessions.map((session) => (
              <article
                key={session.id}
                className="rounded-lg border border-stone-200 bg-stone-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-950">
                      {session.userName}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {session.device} | {session.ipAddress}
                    </p>
                  </div>
                  <StatusBadge
                    label={securitySessionStatusLabels[session.status]}
                    tone={getSessionStatusTone(session.status)}
                  />
                </div>
                <div className="mt-3 grid gap-2 text-sm text-stone-600">
                  <p>Loja: {session.storeName}</p>
                  <p>Inicio: {session.startedAt}</p>
                  <p>Ultima atividade: {session.lastActivity}</p>
                </div>
                {session.status === "active" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => revokeSession(session.id)}
                    className="mt-4 w-full"
                  >
                    <Power className="size-4" aria-hidden="true" />
                    Encerrar sessao
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-5 py-4">
          <h2 className="text-base font-semibold text-stone-950">
            Matriz de permissoes
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Base inicial dos papeis antes de gravar regras no banco.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Cargo</th>
                {permissionAreas.map((area) => (
                  <th key={area} className="px-5 py-3 font-semibold">
                    {permissionAreaLabels[area]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rolePermissions.map((rolePermission) => (
                <tr key={rolePermission.role} className="text-stone-700">
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-stone-950">
                    {securityRoleLabels[rolePermission.role]}
                  </td>
                  {permissionAreas.map((area) => {
                    const level = rolePermission.permissions[area];

                    return (
                      <td key={area} className="whitespace-nowrap px-5 py-4">
                        <StatusBadge
                          label={permissionLevelLabels[level]}
                          tone={getPermissionTone(level)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {activeSessions.length === 0 ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <Monitor className="mt-0.5 size-5 shrink-0 text-amber-700" />
            <div>
              <h2 className="text-sm font-semibold text-amber-900">
                Nenhuma sessao ativa
              </h2>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Todas as sessoes foram encerradas ou expiraram.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {isModalOpen ? (
        <SecurityUserModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateUser}
        />
      ) : null}
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-stone-950">{value}</p>
    </article>
  );
}

function SecurityUserModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (formState: SecurityUserFormState) => void;
}) {
  const [formState, setFormState] =
    useState<SecurityUserFormState>(emptyUserForm);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !formState.name.trim() ||
      !formState.email.trim() ||
      !formState.storeName.trim()
    ) {
      return;
    }

    onSubmit({
      ...formState,
      name: formState.name.trim(),
      email: formState.email.trim(),
      storeName: formState.storeName.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/50 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="security-user-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-700">
              Convite de acesso
            </p>
            <h2
              id="security-user-modal-title"
              className="mt-1 text-xl font-semibold text-stone-950"
            >
              Novo usuario
            </h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-stone-700">
              <span>Nome</span>
              <input
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Nome completo"
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-stone-700">
              <span>E-mail</span>
              <input
                value={formState.email}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="usuario@empresa.com"
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-stone-700">
              <span>Cargo</span>
              <select
                value={formState.role}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    role: event.target.value as SecurityRole,
                  }))
                }
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {securityRoleLabels[role]}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-stone-700">
              <span>Loja</span>
              <input
                value={formState.storeName}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    storeName: event.target.value,
                  }))
                }
                placeholder="Loja Matriz"
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm font-medium text-stone-700">
            <input
              type="checkbox"
              checked={formState.mfaEnabled}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  mfaEnabled: event.target.checked,
                }))
              }
              className="size-4 rounded border-stone-300 text-amber-600 focus:ring-amber-400"
            />
            Exigir MFA no primeiro acesso
          </label>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-stone-950 text-white hover:bg-stone-800"
            >
              <UserRoundPlus className="size-4" aria-hidden="true" />
              Enviar convite
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
