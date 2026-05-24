import { CalendarDays, Search, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AppHeader() {
  const today = new Intl.DateTimeFormat("pt-BR").format(new Date());

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="relative min-w-0 flex-1">
          <label className="sr-only" htmlFor="global-search">
            Buscar no MARKETOPS
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="global-search"
            type="search"
            placeholder="Buscar produto, venda, cliente ou fornecedor"
            className="h-10 w-full max-w-xl rounded-lg border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="hidden items-center gap-3 md:flex">
            <Button className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              <ShoppingCart className="size-4" aria-hidden="true" />
              Nova venda
            </Button>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-950 dark:text-slate-100">Admin MARKETOPS</p>
              <p className="flex items-center justify-end gap-1 text-xs text-slate-500 dark:text-slate-400">
                <CalendarDays className="size-3" aria-hidden="true" />
                {today}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              AD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
