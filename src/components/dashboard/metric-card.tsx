type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  trend: string;
  tone: "emerald" | "blue" | "amber" | "slate";
};

const toneClasses = {
  emerald: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  slate: "bg-slate-100 text-slate-700",
};

export function MetricCard({ label, value, helper, trend, tone }: MetricCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
          {trend}
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-500">{helper}</p>
    </article>
  );
}
