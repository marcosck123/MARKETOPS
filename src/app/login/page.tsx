"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Lock, Mail, ShoppingCart, TrendingUp, Boxes, BadgeDollarSign } from "lucide-react";

const CAROUSEL_ITEMS = [
  {
    icon: ShoppingCart,
    title: "PDV Inteligente",
    description: "Frente de caixa ágil com suporte a múltiplos operadores e sessões simultâneas.",
  },
  {
    icon: TrendingUp,
    title: "Financeiro em tempo real",
    description: "Acompanhe faturamento, ticket médio e desempenho por caixa sem esperar relatórios.",
  },
  {
    icon: Boxes,
    title: "Controle de estoque",
    description: "Ajuste de inventário, alertas de reposição e rastreabilidade por produto.",
  },
  {
    icon: BadgeDollarSign,
    title: "Auditoria completa",
    description: "Toda ação registrada: abertura de caixas, vendas, ajustes e acesso ao sistema.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

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

  const current = CAROUSEL_ITEMS[carouselIndex];
  const Icon = current.icon;

  return (
    <main className="flex min-h-screen">
      {/* Left panel — dark brand */}
      <div className="hidden w-5/12 flex-col justify-between bg-stone-950 p-12 lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-lg font-bold text-stone-950">
            M
          </div>
          <span
            className="text-lg font-bold tracking-wide text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            MARKETOPS
          </span>
        </div>

        {/* Feature carousel */}
        <div className="space-y-8">
          <div className="grid h-16 w-16 place-items-center rounded-2xl border border-stone-800 bg-stone-900">
            <Icon className="h-8 w-8 text-amber-400" strokeWidth={1.5} />
          </div>
          <div>
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {current.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-400">
              {current.description}
            </p>
          </div>

          {/* Dots */}
          <div className="flex gap-2">
            {CAROUSEL_ITEMS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCarouselIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === carouselIndex
                    ? "w-8 bg-amber-400"
                    : "w-4 bg-stone-700 hover:bg-stone-600"
                }`}
                aria-label={`Ver item ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-stone-600">
          MARKETOPS &copy; {new Date().getFullYear()} — Acesso restrito
        </p>
      </div>

      {/* Right panel — light form */}
      <div className="flex flex-1 items-center justify-center bg-stone-50 px-6 py-12 dark:bg-stone-900">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400 text-base font-bold text-stone-950">
              M
            </div>
            <span
              className="text-base font-bold tracking-wide text-stone-900 dark:text-white"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              MARKETOPS
            </span>
          </div>

          <h1
            className="text-2xl font-bold text-stone-900 dark:text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Bem-vindo de volta
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Faça login para acessar o sistema.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Email */}
            <div className="group relative">
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 transition group-focus-within:text-amber-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                placeholder="seu@email.com"
                className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:ring-amber-900/30"
              />
            </div>

            {/* Senha */}
            <div className="group relative">
              <label htmlFor="password" className="sr-only">Senha</label>
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 transition group-focus-within:text-amber-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Senha"
                className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:ring-amber-900/30"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-xl bg-stone-900 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-[0.98] disabled:opacity-60 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              className="text-xs text-stone-400 transition hover:text-amber-600"
            >
              Esqueceu a senha?
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
