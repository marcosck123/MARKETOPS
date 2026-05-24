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
  const [openingBalance, setOpeningBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    if (!selectedRegisterId) {
      setError("Selecione um caixa.");
      return;
    }
    setLoading(true);
    setError("");
    const balance = parseFloat(openingBalance.replace(",", ".")) || 0;
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
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500 text-lg font-bold text-slate-950">
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
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 transition hover:border-emerald-500 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-950"
                  >
                    <input
                      type="radio"
                      name="register"
                      value={register.id}
                      checked={selectedRegisterId === register.id}
                      onChange={() => setSelectedRegisterId(register.id)}
                      className="accent-emerald-500"
                    />
                    <span className="text-sm font-medium text-white">{register.name}</span>
                  </label>
                ))}
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                Saldo de abertura (R$)
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </label>

            {error && (
              <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading || registers.length === 0}
              className="h-12 w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
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
