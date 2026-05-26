import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <section className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-5 dark:border-stone-800 md:flex-row md:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          {eyebrow}
        </p>
        <h1
          className="mt-1 text-2xl font-bold text-stone-900 dark:text-white"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500 dark:text-stone-400">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}
