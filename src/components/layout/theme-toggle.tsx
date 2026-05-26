"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="grid h-9 w-9 place-items-center rounded-lg border border-stone-200 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-white"
      title={resolvedTheme === "dark" ? "Tema claro" : "Tema escuro"}
      aria-label={resolvedTheme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
