"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Printer,
  ReceiptText,
  RotateCcw,
  Search,
  Settings2,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { type Product, initialProducts } from "@/lib/product-data";
import {
  type PrintDevice,
  type PrintDeviceStatus,
  type PrintJob,
  type PrintJobStatus,
  initialPrintDevices,
  initialPrintJobs,
  initialPrintTemplates,
  printDeviceStatusLabels,
  printDocumentKindLabels,
  printJobStatusLabels,
} from "@/lib/print-data";
import { initialSales, paymentMethodLabels } from "@/lib/sale-data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getDeviceStatusTone(status: PrintDeviceStatus) {
  if (status === "online") {
    return "success" as const;
  }

  if (status === "offline") {
    return "danger" as const;
  }

  return "warning" as const;
}

function getJobStatusTone(status: PrintJobStatus) {
  if (status === "printed") {
    return "success" as const;
  }

  if (status === "failed" || status === "canceled") {
    return "danger" as const;
  }

  return "warning" as const;
}

export function PrintContent() {
  const [jobs, setJobs] = useState<PrintJob[]>(initialPrintJobs);
  const [devices, setDevices] = useState<PrintDevice[]>(initialPrintDevices);
  const [templates, setTemplates] = useState(initialPrintTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(initialPrintJobs[0]?.id);

  const productById = useMemo(
    () => new Map(initialProducts.map((product) => [product.id, product])),
    [],
  );
  const selectedSale = initialSales[0];
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0];
  const filteredJobs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return jobs.filter(
      (job) =>
        !search ||
        job.code.toLowerCase().includes(search) ||
        job.origin.toLowerCase().includes(search) ||
        job.deviceName.toLowerCase().includes(search) ||
        job.requestedBy.toLowerCase().includes(search),
    );
  }, [jobs, searchTerm]);

  const onlineDevices = devices.filter((device) => device.status === "online");
  const queuedJobs = jobs.filter((job) => job.status === "queued");
  const failedJobs = jobs.filter((job) => job.status === "failed");
  const enabledTemplates = templates.filter((template) => template.enabled);

  function updateJobStatus(jobId: string, status: PrintJobStatus) {
    setJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status,
              printedAt: status === "printed" ? "22/05/2026 agora" : job.printedAt,
            }
          : job,
      ),
    );
  }

  function reprintJob(job: PrintJob) {
    const nextNumber = jobs.length + 1001;
    const newJob: PrintJob = {
      ...job,
      id: `print-job-${nextNumber}`,
      code: `IMP-${nextNumber}`,
      status: "queued",
      requestedAt: "22/05/2026 agora",
      printedAt: "",
    };

    setJobs((current) => [newJob, ...current]);
    setSelectedJobId(newJob.id);
  }

  function toggleDevice(deviceId: string) {
    setDevices((current) =>
      current.map((device) =>
        device.id === deviceId
          ? {
              ...device,
              status: device.status === "online" ? "offline" : "online",
              lastHeartbeat:
                device.status === "online" ? device.lastHeartbeat : "22/05/2026 agora",
            }
          : device,
      ),
    );
  }

  function toggleTemplate(templateId: string) {
    setTemplates((current) =>
      current.map((template) =>
        template.id === templateId
          ? {
              ...template,
              enabled: !template.enabled,
            }
          : template,
      ),
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Comprovantes"
        title="Impressao"
        description="Prepare comprovantes de venda, fechamento de caixa, self-checkout e relatorios para impressora termica ou PDF."
        action={<StatusBadge label="Fila simulada" tone="info" />}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Dispositivos online" value={`${onlineDevices.length}/${devices.length}`} />
        <SummaryCard label="Na fila" value={String(queuedJobs.length)} />
        <SummaryCard label="Falhas" value={String(failedJobs.length)} />
        <SummaryCard label="Modelos ativos" value={String(enabledTemplates.length)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-stone-200 px-5 py-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-base font-semibold text-stone-950">
                Fila de impressao
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Acompanhe comprovantes enviados pelo PDV, caixa e self-checkout.
              </p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar impressao"
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 pl-9 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Documento</th>
                  <th className="px-5 py-3 font-semibold">Dispositivo</th>
                  <th className="px-5 py-3 font-semibold">Valor</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="text-stone-700">
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-950">{job.code}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        {printDocumentKindLabels[job.documentKind]} | {job.origin}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        Solicitado por {job.requestedBy} em {job.requestedAt}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {job.deviceName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatCurrency(job.total)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge
                        label={printJobStatusLabels[job.status]}
                        tone={getJobStatusTone(job.status)}
                      />
                      {job.printedAt ? (
                        <p className="mt-1 text-xs text-stone-500">
                          {job.printedAt}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSelectedJobId(job.id)}
                        >
                          <ReceiptText className="size-4" aria-hidden="true" />
                          Preview
                        </Button>
                        {job.status !== "printed" ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => updateJobStatus(job.id, "printed")}
                          >
                            <CheckCircle2 className="size-4" aria-hidden="true" />
                            Marcar impresso
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => reprintJob(job)}
                          >
                            <RotateCcw className="size-4" aria-hidden="true" />
                            Reimprimir
                          </Button>
                        )}
                        {job.status === "queued" ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => updateJobStatus(job.id, "canceled")}
                          >
                            <X className="size-4" aria-hidden="true" />
                            Cancelar
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ReceiptPreview
          selectedJob={selectedJob}
          productById={productById}
          selectedSale={selectedSale}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="text-base font-semibold text-stone-950">
              Dispositivos
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Impressoras fisicas e saidas virtuais preparadas para integracao.
            </p>
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-2">
            {devices.map((device) => (
              <article
                key={device.id}
                className="rounded-lg border border-stone-200 bg-stone-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-950">{device.name}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {device.location} | {device.paperWidth}
                    </p>
                  </div>
                  <StatusBadge
                    label={printDeviceStatusLabels[device.status]}
                    tone={getDeviceStatusTone(device.status)}
                  />
                </div>
                <p className="mt-3 text-sm text-stone-600">
                  {device.storeName} | {device.lastHeartbeat}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toggleDevice(device.id)}
                  className="mt-4 w-full"
                >
                  <Printer className="size-4" aria-hidden="true" />
                  {device.status === "online" ? "Desativar" : "Ativar"}
                </Button>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="text-base font-semibold text-stone-950">
              Modelos
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Defina tipos de comprovante, copias e rodape.
            </p>
          </div>
          <div className="space-y-3 p-5">
            {templates.map((template) => (
              <article
                key={template.id}
                className="rounded-lg border border-stone-200 bg-stone-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-950">
                      {template.name}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {printDocumentKindLabels[template.documentKind]}
                    </p>
                  </div>
                  <StatusBadge
                    label={template.enabled ? "Ativo" : "Inativo"}
                    tone={template.enabled ? "success" : "warning"}
                  />
                </div>
                <p className="mt-3 text-sm text-stone-600">
                  {template.copies} copia(s) | {template.footer}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toggleTemplate(template.id)}
                  className="mt-4 w-full"
                >
                  <Settings2 className="size-4" aria-hidden="true" />
                  {template.enabled ? "Desativar modelo" : "Ativar modelo"}
                </Button>
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

function ReceiptPreview({
  selectedJob,
  productById,
  selectedSale,
}: {
  selectedJob?: PrintJob;
  productById: Map<string, Product>;
  selectedSale: typeof initialSales[number];
}) {
  return (
    <aside className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-amber-700">Preview</p>
          <h2 className="mt-1 text-lg font-semibold text-stone-950">
            {selectedJob?.code ?? "Sem documento"}
          </h2>
        </div>
        <FileText className="size-5 text-stone-400" aria-hidden="true" />
      </div>

      <div className="mx-auto mt-5 max-w-xs rounded-lg border border-stone-200 bg-stone-50 p-4 font-mono text-xs text-stone-800">
        <div className="text-center">
          <p className="font-bold">MARKETOPS</p>
          <p>Controle total da operacao ao caixa</p>
          <p>{selectedSale.finishedAt}</p>
        </div>
        <div className="my-3 border-t border-dashed border-stone-300" />
        <p>Documento: {selectedJob?.origin ?? selectedSale.code}</p>
        <p>Operador: {selectedSale.operator}</p>
        <div className="my-3 border-t border-dashed border-stone-300" />
        <div className="space-y-2">
          {selectedSale.items.map((item) => (
            <div key={item.id}>
              <p>{productById.get(item.productId)?.name ?? "Produto"}</p>
              <div className="flex justify-between gap-3">
                <span>
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                </span>
                <span>{formatCurrency(item.total)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="my-3 border-t border-dashed border-stone-300" />
        <div className="space-y-1">
          <PreviewRow label="Subtotal" value={formatCurrency(selectedSale.subtotal)} />
          <PreviewRow label="Desconto" value={formatCurrency(selectedSale.discount)} />
          <PreviewRow label="Total" value={formatCurrency(selectedSale.total)} />
        </div>
        <div className="my-3 border-t border-dashed border-stone-300" />
        {selectedSale.payments.map((payment) => (
          <PreviewRow
            key={payment.id}
            label={paymentMethodLabels[payment.method]}
            value={formatCurrency(payment.amount)}
          />
        ))}
        <p className="mt-4 text-center">Obrigado pela preferencia.</p>
      </div>
    </aside>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
