type ChartPoint = {
  label: string;
  value: number;
};

type DashboardChartCardProps = {
  title: string;
  subtitle: string;
  data: ChartPoint[];
};

export function DashboardChartCard({
  title,
  subtitle,
  data,
}: DashboardChartCardProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <article className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-base font-semibold text-stone-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>
        </div>
        <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-400">
          Semanal
        </span>
      </div>

      <div className="mt-6 flex h-64 items-end gap-3 border-b border-l border-stone-200 px-2 pt-6 dark:border-stone-700">
        {data.map((item) => {
          const height = Math.max(4, Math.round((item.value / maxValue) * 100));

          return (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-52 w-full items-end rounded-t-md bg-stone-50 dark:bg-stone-800">
                <div
                  className="w-full rounded-t-md bg-amber-400 transition hover:bg-amber-300"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{item.label}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
