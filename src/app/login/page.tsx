"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Lock, Mail, ShoppingCart } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou senha incorretos.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-emerald-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-24 h-[550px] w-[550px] rounded-full bg-blue-700/20 blur-[140px]" />
        <div className="absolute left-1/2 top-1/3 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-emerald-900/30 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-sm">
            <ShoppingCart className="h-9 w-9 text-emerald-400" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-widest text-white">
              MARKETOPS
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-emerald-400/80">
              Controle total da operacao ao caixa
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="group relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-emerald-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                name="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                placeholder="EMAIL"
                className="h-12 w-full rounded-xl border border-white/15 bg-white/5 pl-11 pr-4 text-sm font-medium uppercase tracking-widest text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500/60 focus:bg-white/10 focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>

            {/* Senha */}
            <div className="group relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-emerald-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="SENHA"
                className="h-12 w-full rounded-xl border border-white/15 bg-white/5 pl-11 pr-4 text-sm font-medium uppercase tracking-widest text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500/60 focus:bg-white/10 focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs font-medium text-red-400">
                {error}
              </p>
            )}

            {/* Botao */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-xl bg-emerald-500 text-sm font-bold uppercase tracking-widest text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              className="text-xs text-slate-400 transition hover:text-emerald-400"
            >
              Esqueceu a senha?
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-600">
          MARKETOPS &copy; {new Date().getFullYear()} — Acesso restrito
        </p>
      </div>
    </main>
  );
}
