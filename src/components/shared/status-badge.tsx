type StatusBadgeProps = {
  label: string;
  tone: "success" | "warning" | "danger" | "info";
};

const toneClasses = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  info: "bg-blue-50 text-blue-700 ring-blue-200",
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-md px-2.5 text-xs font-semibold ring-1 ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
