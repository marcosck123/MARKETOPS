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
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
          Semanal
        </span>
      </div>

      <div className="mt-6 flex h-64 items-end gap-3 border-b border-l border-slate-200 px-2 pt-6">
        {data.map((item) => {
          const height = Math.max(18, Math.round((item.value / maxValue) * 100));

          return (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-52 w-full items-end rounded-t-md bg-slate-50">
                <div
                  className="w-full rounded-t-md bg-emerald-500 transition hover:bg-emerald-600"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-500">{item.label}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
