"use client";

import { useMemo, useState } from "react";
import {
  Cable,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  Printer,
  QrCode,
  RefreshCcw,
  Scale,
  Send,
  Webhook,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  type IntegrationConnection,
  type IntegrationEvent,
  type IntegrationHealth,
  type IntegrationKind,
  type IntegrationRequirement,
  type IntegrationStatus,
  initialIntegrationConnections,
  initialIntegrationEvents,
  initialIntegrationRequirements,
  integrationHealthLabels,
  integrationKindLabels,
  integrationStatusLabels,
} from "@/lib/integration-data";

function getStatusTone(status: IntegrationStatus) {
  if (status === "configured" || status === "test_mode") {
    return "success" as const;
  }

  if (status === "error" || status === "offline") {
    return "danger" as const;
  }

  return "warning" as const;
}

function getHealthTone(health: IntegrationHealth) {
  if (health === "healthy") {
    return "success" as const;
  }

  if (health === "critical") {
    return "danger" as const;
  }

  return "warning" as const;
}

function getEventTone(status: IntegrationEvent["status"]) {
  if (status === "success") {
    return "success" as const;
  }

  if (status === "failed") {
    return "danger" as const;
  }

  return "warning" as const;
}

function getIntegrationIcon(kind: IntegrationKind) {
  if (kind === "pix") {
    return <QrCode className="size-5" aria-hidden="true" />;
  }

  if (kind === "tef") {
    return <CreditCard className="size-5" aria-hidden="true" />;
  }

  if (kind === "fiscal") {
    return <FileCheck2 className="size-5" aria-hidden="true" />;
  }

  if (kind === "scale") {
    return <Scale className="size-5" aria-hidden="true" />;
  }

  if (kind === "thermal_printer") {
    return <Printer className="size-5" aria-hidden="true" />;
  }

  return <Webhook className="size-5" aria-hidden="true" />;
}

export function IntegrationsContent() {
  const [connections, setConnections] = useState<IntegrationConnection[]>(
    initialIntegrationConnections,
  );
  const [events, setEvents] = useState<IntegrationEvent[]>(
    initialIntegrationEvents,
  );
  const [requirements, setRequirements] = useState<IntegrationRequirement[]>(
    initialIntegrationRequirements,
  );
  const [activeKind, setActiveKind] = useState<"all" | IntegrationKind>("all");

  const filteredConnections = useMemo(
    () =>
      connections.filter(
        (connection) => activeKind === "all" || connection.kind === activeKind,
      ),
    [activeKind, connections],
  );
  const enabledConnections = connections.filter((connection) => connection.enabled);
  const healthyConnections = connections.filter(
    (connection) => connection.health === "healthy",
  );
  const pendingRequirements = requirements.filter((requirement) => !requirement.done);
  const failedEvents = events.filter((event) => event.status === "failed");

  function toggleConnection(connectionId: string) {
    setConnections((current) =>
      current.map((connection) =>
        connection.id === connectionId
          ? {
              ...connection,
              enabled: !connection.enabled,
              status: connection.enabled ? "offline" : "test_mode",
              health: connection.enabled ? "warning" : "healthy",
              lastSync: connection.enabled ? connection.lastSync : "22/05/2026 agora",
            }
          : connection,
      ),
    );
  }

  function testConnection(connection: IntegrationConnection) {
    const success = connection.kind !== "scale";
    const nextEvent: IntegrationEvent = {
      id: `integration-event-${events.length + 2001}`,
      integrationId: connection.id,
      integrationName: connection.name,
      status: success ? "success" : "failed",
      message: success
        ? "Teste de comunicacao executado com sucesso."
        : "Teste local falhou. Conferir dispositivo e credenciais.",
      occurredAt: "22/05/2026 agora",
    };

    setEvents((current) => [nextEvent, ...current]);
    setConnections((current) =>
      current.map((item) =>
        item.id === connection.id
          ? {
              ...item,
              status: success ? "test_mode" : "error",
              health: success ? "healthy" : "critical",
              lastSync: "22/05/2026 agora",
            }
          : item,
      ),
    );
  }

  function completeRequirement(requirementId: string) {
    setRequirements((current) =>
      current.map((requirement) =>
        requirement.id === requirementId
          ? {
              ...requirement,
              done: true,
            }
          : requirement,
      ),
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Conectores externos"
        title="Integracoes"
        description="Organize PIX automatico, TEF, fiscal, balanca, impressora termica e webhooks antes da conexao real."
        action={<StatusBadge label="Ambiente simulado" tone="info" />}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Ativas" value={`${enabledConnections.length}/${connections.length}`} />
        <SummaryCard label="Saudaveis" value={String(healthyConnections.length)} />
        <SummaryCard label="Pendencias" value={String(pendingRequirements.length)} />
        <SummaryCard label="Falhas recentes" value={String(failedEvents.length)} />
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <Cable className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="text-sm font-semibold text-amber-900">
              Integracoes em modo preparatorio
            </h2>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Esta tela guarda configuracao operacional. Credenciais reais,
              certificados, TEF e comunicacao fiscal devem entrar com backend
              seguro.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200 px-5 py-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-base font-semibold text-stone-950">
              Conectores
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Controle ativacao, saude, provedor e proximo passo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={activeKind === "all" ? "default" : "outline"}
              onClick={() => setActiveKind("all")}
              className={activeKind === "all" ? "bg-stone-950 text-white hover:bg-stone-800" : ""}
            >
              Todos
            </Button>
            {(Object.keys(integrationKindLabels) as IntegrationKind[]).map((kind) => (
              <Button
                key={kind}
                type="button"
                variant={activeKind === kind ? "default" : "outline"}
                onClick={() => setActiveKind(kind)}
                className={activeKind === kind ? "bg-stone-950 text-white hover:bg-stone-800" : ""}
              >
                {integrationKindLabels[kind]}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredConnections.map((connection) => (
            <article
              key={connection.id}
              className="rounded-lg border border-stone-200 bg-stone-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-amber-100 text-amber-700">
                    {getIntegrationIcon(connection.kind)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-950">
                      {connection.name}
                    </h3>
                    <p className="mt-1 text-xs text-stone-500">
                      {connection.provider} | {connection.storeName}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  label={connection.enabled ? "Ativa" : "Inativa"}
                  tone={connection.enabled ? "success" : "warning"}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge
                  label={integrationStatusLabels[connection.status]}
                  tone={getStatusTone(connection.status)}
                />
                <StatusBadge
                  label={integrationHealthLabels[connection.health]}
                  tone={getHealthTone(connection.health)}
                />
              </div>

              <div className="mt-4 space-y-2 text-sm text-stone-600">
                <p>Ultima sync: {connection.lastSync}</p>
                <p>Proximo passo: {connection.nextStep}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testConnection(connection)}
                >
                  <RefreshCcw className="size-4" aria-hidden="true" />
                  Testar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toggleConnection(connection.id)}
                >
                  {connection.enabled ? (
                    <XCircle className="size-4" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  )}
                  {connection.enabled ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="text-base font-semibold text-stone-950">
              Eventos recentes
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Resultado dos testes e chamadas simuladas.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Integracao</th>
                  <th className="px-5 py-3 font-semibold">Mensagem</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {events.map((event) => (
                  <tr key={event.id} className="text-stone-700">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-stone-950">
                      {event.integrationName}
                    </td>
                    <td className="px-5 py-4">{event.message}</td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={event.status}
                        tone={getEventTone(event.status)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {event.occurredAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="text-base font-semibold text-stone-950">
              Checklist de ativacao
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Requisitos antes de sair do modo teste.
            </p>
          </div>
          <div className="space-y-3 p-5">
            {requirements.map((requirement) => (
              <article
                key={requirement.id}
                className="rounded-lg border border-stone-200 bg-stone-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-950">
                      {requirement.title}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {integrationKindLabels[requirement.area]}
                    </p>
                  </div>
                  <StatusBadge
                    label={requirement.done ? "Concluido" : "Pendente"}
                    tone={requirement.done ? "success" : "warning"}
                  />
                </div>
                {!requirement.done ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => completeRequirement(requirement.id)}
                    className="mt-4 w-full"
                  >
                    <Send className="size-4" aria-hidden="true" />
                    Marcar concluido
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
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
