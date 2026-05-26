"use client";

import { type FormEvent, useState } from "react";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  updateCompanySettings,
  type CompanySettingsData,
} from "@/lib/actions/company-settings";

type Props = {
  settings: CompanySettingsData;
};

type FormState = Omit<CompanySettingsData, "id" | "nfeSequence">;

function toForm(s: CompanySettingsData): FormState {
  return {
    razaoSocial: s.razaoSocial,
    cnpj: s.cnpj,
    ie: s.ie ?? "",
    address: s.address,
    number: s.number,
    district: s.district,
    city: s.city,
    state: s.state,
    zipCode: s.zipCode,
    phone: s.phone,
    nfeSerie: s.nfeSerie,
  };
}

export function CompanySettingsContent({ settings }: Props) {
  const [form, setForm] = useState<FormState>(toForm(settings));
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(key: keyof FormState, value: string) {
    setForm((c) => ({ ...c, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const result = await updateCompanySettings({
      ...form,
      ie: form.ie || null,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="size-6 text-amber-600" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Configurações</h1>
          <p className="mt-1 text-sm text-stone-500">
            Dados do emitente e configurações fiscais
          </p>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-stone-800">Dados da empresa</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-stone-600">Razão Social</span>
              <input
                type="text"
                value={form.razaoSocial}
                onChange={(e) => update("razaoSocial", e.target.value)}
                className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">CNPJ</span>
              <input
                type="text"
                inputMode="numeric"
                value={form.cnpj}
                onChange={(e) => update("cnpj", e.target.value)}
                placeholder="00.000.000/0000-00"
                className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">
                Inscrição Estadual
              </span>
              <input
                type="text"
                value={form.ie ?? ""}
                onChange={(e) => update("ie", e.target.value)}
                className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">Telefone</span>
              <input
                type="text"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-stone-800">Endereço</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-stone-600">Logradouro</span>
              <input
                type="text"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">Número</span>
              <input
                type="text"
                value={form.number}
                onChange={(e) => update("number", e.target.value)}
                className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">Bairro</span>
              <input
                type="text"
                value={form.district}
                onChange={(e) => update("district", e.target.value)}
                className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">Cidade</span>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">Estado (UF)</span>
              <input
                type="text"
                maxLength={2}
                value={form.state}
                onChange={(e) => update("state", e.target.value.toUpperCase())}
                placeholder="MT"
                className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">CEP</span>
              <input
                type="text"
                inputMode="numeric"
                value={form.zipCode}
                onChange={(e) => update("zipCode", e.target.value)}
                placeholder="00000-000"
                className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-stone-800">Fiscal (NF-e)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">Série NF-e</span>
              <input
                type="text"
                inputMode="numeric"
                value={form.nfeSerie}
                onChange={(e) => update("nfeSerie", e.target.value)}
                className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">
                Sequência atual (readonly)
              </span>
              <input
                type="text"
                readOnly
                value={settings.nfeSequence}
                className="h-10 w-full rounded-lg border border-stone-100 bg-stone-50 px-3 text-sm text-stone-400 outline-none"
              />
            </label>
          </div>
        </section>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {saved && (
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Configurações salvas com sucesso.
          </p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-amber-400 text-stone-950 hover:bg-amber-300 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar configurações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
