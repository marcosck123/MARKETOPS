"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            MARKETOPS
          </h1>
          <p className="mt-2 text-sm text-slate-400">Painel administrativo</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >
          <h2 className="mb-5 text-base font-semibold text-white">
            Acesso ao sistema
          </h2>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                placeholder="admin@marketops.local"
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                Senha
              </span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>
          </div>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 h-10 w-full rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
