"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  attendHelpRequest,
  getActiveHelpRequests,
  type HelpRequestRow,
} from "@/lib/actions/help-requests";
import { cn } from "@/lib/utils";

type Props = {
  initialRequests: HelpRequestRow[];
};

function playBeep(ctx: AudioContext) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.type = "sine";
  oscillator.frequency.value = 440;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.2);
}

function getRemainingSeconds(expiresAt: Date, nowMs: number): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - nowMs) / 1000));
}

function getProgressPercent(expiresAt: Date, nowMs: number): number {
  const remaining = getRemainingSeconds(expiresAt, nowMs);
  return Math.min(100, Math.max(0, (remaining / 60) * 100));
}

export function SupervisorContent({ initialRequests }: Props) {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<HelpRequestRow[]>(initialRequests);
  const [now, setNow] = useState(() => Date.now());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 4s polling for new requests
  useEffect(() => {
    const interval = setInterval(async () => {
      const fresh = await getActiveHelpRequests();
      setRequests(fresh);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 1s ticker for progress bars
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Alarm: bipe every 5s while there are active requests
  const hasRequests = requests.length > 0;
  useEffect(() => {
    if (!hasRequests) {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      return;
    }

    const beep = () => {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      playBeep(audioCtxRef.current);
    };

    beep();
    alarmIntervalRef.current = setInterval(beep, 5000);

    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    };
  }, [hasRequests]);

  // Browser tab title badge
  useEffect(() => {
    document.title =
      requests.length > 0
        ? `(${requests.length}) Supervisor — MARKETOPS`
        : "Supervisor — MARKETOPS";
    return () => {
      document.title = "MARKETOPS";
    };
  }, [requests.length]);

  async function handleAttend(id: string) {
    const supervisorName = session?.user?.name ?? "Supervisor";
    await attendHelpRequest(id, supervisorName);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Supervisor</h1>
        <p className="mt-1 text-sm text-slate-500">Fila de chamados em tempo real</p>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center shadow-sm">
          <CheckCircle2 className="mb-3 size-10 text-emerald-400" aria-hidden="true" />
          <p className="text-base font-medium text-slate-600">Nenhum chamado ativo</p>
          <p className="mt-1 text-sm text-slate-400">Todos os caixas estão operando normalmente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">
            {requests.length} chamado{requests.length > 1 ? "s" : ""} ativo{requests.length > 1 ? "s" : ""}
          </p>
          {requests.map((req) => {
            const remaining = getRemainingSeconds(req.expiresAt, now);
            const progress = getProgressPercent(req.expiresAt, now);
            const isUrgent = remaining <= 20;

            return (
              <div
                key={req.id}
                className={cn(
                  "rounded-xl border bg-white p-4 shadow-sm",
                  isUrgent ? "border-red-200" : "border-amber-200",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                        isUrgent ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600",
                      )}
                    >
                      <Bell className="size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{req.cashRegisterName}</p>
                      <p className="text-sm text-slate-500">{req.operatorName}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleAttend(req.id)}
                    className="shrink-0 rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-400 active:scale-95"
                  >
                    Atender
                  </button>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Tempo restante</span>
                    <span
                      className={cn(
                        "font-medium tabular-nums",
                        isUrgent ? "text-red-500" : "text-amber-600",
                      )}
                    >
                      {remaining}s
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        isUrgent ? "bg-red-500" : "bg-amber-400",
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
