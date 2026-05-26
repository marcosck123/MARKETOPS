import { CalendarDays, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AppHeader() {
  const today = new Intl.DateTimeFormat("pt-BR").format(new Date());

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
      <div className="flex min-h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="relative min-w-0 flex-1">
          <label className="sr-only" htmlFor="global-search">
            Buscar no MARKETOPS
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
            aria-hidden="true"
          />
          <input
            id="global-search"
            type="search"
            placeholder="Buscar produto, venda, cliente..."
            className="h-9 w-full max-w-sm rounded-lg border border-stone-200 bg-stone-50 px-3 pl-9 text-sm outline-none transition placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:bg-stone-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/vendas"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-stone-900 px-4 text-sm font-medium text-white transition hover:bg-stone-800 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300"
            >
              <ShoppingCart className="size-4" aria-hidden="true" />
              Nova venda
            </Link>
            <div className="text-right">
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">MARKETOPS</p>
              <p className="flex items-center justify-end gap-1 text-xs text-stone-500 dark:text-stone-400">
                <CalendarDays className="size-3" aria-hidden="true" />
                {today}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
