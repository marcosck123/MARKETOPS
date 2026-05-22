"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  Play,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  type TestArea,
  type TestCase,
  type TestCasePriority,
  type TestCaseStatus,
  initialTestCases,
  initialTestRuns,
  testAreaLabels,
  testCasePriorityLabels,
  testCaseStatusLabels,
} from "@/lib/test-data";

function getStatusTone(status: TestCaseStatus) {
  if (status === "passed") {
    return "success" as const;
  }

  if (status === "failed") {
    return "danger" as const;
  }

  if (status === "blocked") {
    return "warning" as const;
  }

  return "info" as const;
}

function getPriorityTone(priority: TestCasePriority) {
  if (priority === "high") {
    return "danger" as const;
  }

  if (priority === "medium") {
    return "warning" as const;
  }

  return "info" as const;
}

function getStatusIcon(status: TestCaseStatus) {
  if (status === "passed") {
    return <CheckCircle2 className="size-4" aria-hidden="true" />;
  }

  if (status === "failed") {
    return <XCircle className="size-4" aria-hidden="true" />;
  }

  if (status === "blocked") {
    return <ShieldAlert className="size-4" aria-hidden="true" />;
  }

  return <CircleDashed className="size-4" aria-hidden="true" />;
}

const areaOptions = Object.keys(testAreaLabels) as TestArea[];

export function TestsContent() {
  const [cases, setCases] = useState<TestCase[]>(initialTestCases);
  const [runs, setRuns] = useState(initialTestRuns);
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState<"all" | TestArea>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TestCaseStatus>(
    "all",
  );

  const filteredCases = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return cases.filter((testCase) => {
      const matchesSearch =
        !search ||
        testCase.code.toLowerCase().includes(search) ||
        testCase.title.toLowerCase().includes(search) ||
        testCase.owner.toLowerCase().includes(search) ||
        testCase.command.toLowerCase().includes(search);
      const matchesArea = areaFilter === "all" || testCase.area === areaFilter;
      const matchesStatus =
        statusFilter === "all" || testCase.status === statusFilter;

      return matchesSearch && matchesArea && matchesStatus;
    });
  }, [areaFilter, cases, searchTerm, statusFilter]);

  const passedCases = cases.filter((testCase) => testCase.status === "passed");
  const pendingCases = cases.filter((testCase) => testCase.status === "pending");
  const blockedCases = cases.filter((testCase) => testCase.status === "blocked");
  const failedCases = cases.filter((testCase) => testCase.status === "failed");
  const coverage = cases.length > 0 ? Math.round((passedCases.length / cases.length) * 100) : 0;

  function updateCaseStatus(testCaseId: string, status: TestCaseStatus) {
    setCases((current) =>
      current.map((testCase) =>
        testCase.id === testCaseId
          ? {
              ...testCase,
              status,
              evidence:
                status === "passed"
                  ? "Validado manualmente no checklist."
                  : testCase.evidence,
            }
          : testCase,
      ),
    );
  }

  function runManualSuite() {
    setCases((current) =>
      current.map((testCase) =>
        testCase.status === "pending"
          ? {
              ...testCase,
              status: "passed",
              evidence: "Marcado como validado pela suite manual simulada.",
            }
          : testCase,
      ),
    );
    setRuns((current) => [
      {
        id: `run-${current.length + 1001}`,
        title: "Suite manual simulada",
        status: "passed",
        startedAt: "22/05/2026 agora",
        finishedAt: "22/05/2026 agora",
        summary: "Casos pendentes foram marcados como validados manualmente.",
      },
      ...current,
    ]);
  }

  return (
    <>
      <PageHeader
        eyebrow="Qualidade do MVP"
        title="Testes"
        description="Controle casos de teste, validacoes manuais, bloqueios de ambiente e criterios antes do deploy."
        action={
          <Button
            type="button"
            onClick={runManualSuite}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            <Play className="size-4" aria-hidden="true" />
            Rodar suite manual
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-5">
        <SummaryCard label="Cobertura" value={`${coverage}%`} />
        <SummaryCard label="Passaram" value={String(passedCases.length)} />
        <SummaryCard label="Pendentes" value={String(pendingCases.length)} />
        <SummaryCard label="Bloqueados" value={String(blockedCases.length)} />
        <SummaryCard label="Falhas" value={String(failedCases.length)} />
      </section>

      {blockedCases.length > 0 ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" />
            <div>
              <h2 className="text-sm font-semibold text-amber-900">
                Validacao automatica bloqueada
              </h2>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Build e lint ainda dependem de node/npm no PATH ou de liberar o
                Docker para executar os scripts dentro do container.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Casos de teste
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Casos prioritarios para venda, estoque, PDV e operacao.
            </p>
          </div>

          <div className="grid gap-2 lg:grid-cols-[1fr_160px_160px]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar teste"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={areaFilter}
              onChange={(event) =>
                setAreaFilter(event.target.value as "all" | TestArea)
              }
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Todas areas</option>
              {areaOptions.map((area) => (
                <option key={area} value={area}>
                  {testAreaLabels[area]}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | TestCaseStatus)
              }
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">Todos status</option>
              {Object.entries(testCaseStatusLabels).map(([status, label]) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Caso</th>
                <th className="px-5 py-3 font-semibold">Area</th>
                <th className="px-5 py-3 font-semibold">Prioridade</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((testCase) => (
                <tr key={testCase.id} className="text-slate-700">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-950">
                      {testCase.code} | {testCase.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {testCase.command}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Evidencia: {testCase.evidence}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {testAreaLabels[testCase.area]}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge
                      label={testCasePriorityLabels[testCase.priority]}
                      tone={getPriorityTone(testCase.priority)}
                    />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="inline-flex items-center gap-2">
                      {getStatusIcon(testCase.status)}
                      <StatusBadge
                        label={testCaseStatusLabels[testCase.status]}
                        tone={getStatusTone(testCase.status)}
                      />
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => updateCaseStatus(testCase.id, "passed")}
                      >
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                        Passou
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => updateCaseStatus(testCase.id, "failed")}
                      >
                        <XCircle className="size-4" aria-hidden="true" />
                        Falhou
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => updateCaseStatus(testCase.id, "blocked")}
                      >
                        <ShieldAlert className="size-4" aria-hidden="true" />
                        Bloquear
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            Execucoes
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Historico das validacoes feitas no projeto.
          </p>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
          {runs.map((run) => (
            <article
              key={run.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{run.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {run.startedAt} {run.finishedAt ? `| ${run.finishedAt}` : ""}
                  </p>
                </div>
                <StatusBadge
                  label={testCaseStatusLabels[run.status]}
                  tone={getStatusTone(run.status)}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {run.summary}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-blue-700" />
          <div>
            <h2 className="text-sm font-semibold text-blue-900">
              Proximo nivel
            </h2>
            <p className="mt-1 text-sm leading-6 text-blue-800">
              Quando o ambiente permitir, adicionar testes automatizados para
              `sale-engine`, estoque, permissoes e componentes criticos.
            </p>
          </div>
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
