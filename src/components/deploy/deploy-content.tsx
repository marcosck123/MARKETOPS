"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Cloud,
  Database,
  Globe2,
  KeyRound,
  Rocket,
  ServerCog,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  type DeployChecklistItem,
  type DeployEnvironment,
  type DeployItemStatus,
  type DeployService,
  type DeployServiceKind,
  type DeployVariable,
  deployEnvironmentLabels,
  deployItemStatusLabels,
  deployServiceKindLabels,
  initialDeployChecklist,
  initialDeployServices,
  initialDeployVariables,
} from "@/lib/deploy-data";

function getStatusTone(status: DeployItemStatus) {
  if (status === "done") {
    return "success" as const;
  }

  if (status === "blocked") {
    return "danger" as const;
  }

  return "warning" as const;
}

function getServiceIcon(kind: DeployServiceKind) {
  if (kind === "frontend") {
    return <Globe2 className="size-5" aria-hidden="true" />;
  }

  if (kind === "database") {
    return <Database className="size-5" aria-hidden="true" />;
  }

  if (kind === "auth") {
    return <ShieldCheck className="size-5" aria-hidden="true" />;
  }

  if (kind === "monitoring") {
    return <ServerCog className="size-5" aria-hidden="true" />;
  }

  return <Cloud className="size-5" aria-hidden="true" />;
}

const environmentOptions = Object.keys(
  deployEnvironmentLabels,
) as DeployEnvironment[];

export function DeployContent() {
  const [checklist, setChecklist] = useState<DeployChecklistItem[]>(
    initialDeployChecklist,
  );
  const [services, setServices] = useState<DeployService[]>(
    initialDeployServices,
  );
  const [variables, setVariables] = useState<DeployVariable[]>(
    initialDeployVariables,
  );
  const [environmentFilter, setEnvironmentFilter] = useState<
    "all" | DeployEnvironment
  >("all");

  const filteredChecklist = useMemo(
    () =>
      checklist.filter(
        (item) =>
          environmentFilter === "all" ||
          item.environment === environmentFilter,
      ),
    [checklist, environmentFilter],
  );
  const filteredServices = useMemo(
    () =>
      services.filter(
        (service) =>
          environmentFilter === "all" ||
          service.environment === environmentFilter,
      ),
    [environmentFilter, services],
  );
  const filteredVariables = useMemo(
    () =>
      variables.filter(
        (variable) =>
          environmentFilter === "all" ||
          variable.environment === environmentFilter,
      ),
    [environmentFilter, variables],
  );

  const doneChecklist = checklist.filter((item) => item.status === "done");
  const blockedChecklist = checklist.filter((item) => item.status === "blocked");
  const configuredVariables = variables.filter((variable) => variable.configured);
  const readiness =
    checklist.length > 0 ? Math.round((doneChecklist.length / checklist.length) * 100) : 0;

  function updateChecklistStatus(itemId: string, status: DeployItemStatus) {
    setChecklist((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status,
              notes:
                status === "done"
                  ? "Marcado como pronto para a proxima etapa."
                  : item.notes,
            }
          : item,
      ),
    );
  }

  function updateServiceStatus(serviceId: string, status: DeployItemStatus) {
    setServices((current) =>
      current.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              status,
            }
          : service,
      ),
    );
  }

  function toggleVariable(variableId: string) {
    setVariables((current) =>
      current.map((variable) =>
        variable.id === variableId
          ? {
              ...variable,
              configured: !variable.configured,
            }
          : variable,
      ),
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Publicacao"
        title="Deploy"
        description="Prepare ambientes, variaveis, servicos e checklist antes de publicar o MARKETOPS."
        action={<StatusBadge label={`${readiness}% pronto`} tone={readiness >= 80 ? "success" : "warning"} />}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Prontidao" value={`${readiness}%`} />
        <SummaryCard label="Concluidos" value={String(doneChecklist.length)} />
        <SummaryCard label="Bloqueados" value={String(blockedChecklist.length)} />
        <SummaryCard label="Variaveis" value={`${configuredVariables.length}/${variables.length}`} />
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <Rocket className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="text-sm font-semibold text-amber-900">
              Deploy ainda depende de validacao tecnica
            </h2>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              O projeto esta preparado para publicar, mas build/lint e banco
              real precisam ser validados antes de producao.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={environmentFilter === "all" ? "default" : "outline"}
          onClick={() => setEnvironmentFilter("all")}
          className={environmentFilter === "all" ? "bg-slate-950 text-white hover:bg-slate-800" : ""}
        >
          Todos
        </Button>
        {environmentOptions.map((environment) => (
          <Button
            key={environment}
            type="button"
            variant={environmentFilter === environment ? "default" : "outline"}
            onClick={() => setEnvironmentFilter(environment)}
            className={
              environmentFilter === environment
                ? "bg-slate-950 text-white hover:bg-slate-800"
                : ""
            }
          >
            {deployEnvironmentLabels[environment]}
          </Button>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-950">
              Checklist de deploy
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Itens obrigatorios para preview e producao.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Item</th>
                  <th className="px-5 py-3 font-semibold">Ambiente</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChecklist.map((item) => (
                  <tr key={item.id} className="text-slate-700">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-950">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.owner} | {item.notes}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {deployEnvironmentLabels[item.environment]}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={deployItemStatusLabels[item.status]}
                        tone={getStatusTone(item.status)}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => updateChecklistStatus(item.id, "done")}
                        >
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                          Concluir
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => updateChecklistStatus(item.id, "blocked")}
                        >
                          <XCircle className="size-4" aria-hidden="true" />
                          Bloquear
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-950">
              Variaveis de ambiente
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Controle o que precisa ser configurado fora do repositorio.
            </p>
          </div>
          <div className="space-y-3 p-5">
            {filteredVariables.map((variable) => (
              <article
                key={variable.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-slate-950">
                      {variable.key}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {variable.description}
                    </p>
                  </div>
                  <KeyRound className="size-5 shrink-0 text-emerald-600" />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <StatusBadge
                    label={variable.configured ? "Configurada" : "Pendente"}
                    tone={variable.configured ? "success" : "warning"}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => toggleVariable(variable.id)}
                  >
                    {variable.configured ? "Remover marca" : "Marcar"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            Servicos
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Mapa dos servicos externos previstos para o deploy.
          </p>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => (
            <article
              key={service.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                    {getServiceIcon(service.kind)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">
                      {service.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {deployServiceKindLabels[service.kind]} | {service.provider}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  label={deployItemStatusLabels[service.status]}
                  tone={getStatusTone(service.status)}
                />
              </div>
              <p className="mt-4 text-sm text-slate-600">
                {deployEnvironmentLabels[service.environment]} | {service.url}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => updateServiceStatus(service.id, "done")}
                >
                  Pronto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => updateServiceStatus(service.id, "blocked")}
                >
                  Bloquear
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </article>
  );
}
