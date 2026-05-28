"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { openCashSession } from "@/lib/actions/cash-sessions";

type Register = { id: string; name: string };

type Props = {
  registers: Register[];
  operatorId: string;
  operatorName: string;
};

export function SessionGate({ registers, operatorId, operatorName }: Props) {
  const router = useRouter();
  const [selectedRegisterId, setSelectedRegisterId] = useState(registers[0]?.id ?? "");
  const [openingBalance, setOpeningBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const balanceFilled = openingBalance.trim() !== "";

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    if (!selectedRegisterId) {
      setError("Selecione um caixa.");
      return;
    }
    if (!balanceFilled) {
      setError("Informe o saldo de abertura antes de iniciar a sessão.");
      return;
    }
    const balance = parseFloat(openingBalance.replace(",", "."));
    if (Number.isNaN(balance) || balance < 0) {
      setError("Saldo inválido. Use um número como 50 ou 50,00.");
      return;
    }
    const result = await openCashSession({
      cashRegisterId: selectedRegisterId,
      operatorId,
      operatorName,
      openingBalance: balance,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-400 text-lg font-bold text-slate-950">
            M
          </div>
          <div>
            <p className="text-lg font-semibold text-white">MARKETOPS PDV</p>
            <p className="text-xs text-slate-400">Olá, {operatorName}</p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900 p-6">
          <h1 className="text-base font-semibold text-white">Selecionar caixa</h1>
          <p className="mt-1 text-sm text-slate-400">
            Escolha o caixa que você vai operar nesta sessão.
          </p>

          <form onSubmit={(e) => void handleConfirm(e)} className="mt-5 space-y-4">
            {registers.length === 0 ? (
              <p className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-400">
                Nenhum caixa aberto no momento. Solicite ao supervisor que abra um caixa em <strong className="text-slate-300">Retaguarda → Caixas</strong>.
              </p>
            ) : (
              <div className="space-y-2">
                {registers.map((register) => (
                  <label
                    key={register.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 transition hover:border-amber-400 has-[:checked]:border-amber-400 has-[:checked]:bg-amber-950"
                  >
                    <input
                      type="radio"
                      name="register"
                      value={register.id}
                      checked={selectedRegisterId === register.id}
                      onChange={() => setSelectedRegisterId(register.id)}
                      className="accent-amber-400"
                    />
                    <span className="text-sm font-medium text-white">{register.name}</span>
                  </label>
                ))}
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                Saldo de abertura (R$) <span className="text-amber-400">*</span>
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="Ex: 50,00"
                required
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Obrigatório — informe o valor em caixa antes de iniciar.
              </p>
            </label>

            {error && (
              <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading || registers.length === 0 || !balanceFilled}
              className="h-12 w-full bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-50"
            >
              <LogIn className="size-4" aria-hidden="true" />
              {loading ? "Abrindo sessão..." : "Iniciar sessão"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
