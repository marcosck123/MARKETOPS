type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  trend: string;
  tone: "amber" | "blue" | "green" | "slate";
};

const toneClasses = {
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  green: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  slate: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
};

export function MetricCard({ label, value, helper, trend, tone }: MetricCardProps) {
  return (
    <article className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
            {label}
          </p>
          <p
            className="mt-2 text-2xl font-semibold tabular-nums text-stone-900 dark:text-white"
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            {value}
          </p>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
          {trend}
        </span>
      </div>
      <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">{helper}</p>
    </article>
  );
}
