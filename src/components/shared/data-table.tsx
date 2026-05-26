import type { ReactNode } from "react";

type DataTableProps = {
  title: string;
  columns: string[];
  rows: ReactNode[][];
};

export function DataTable({ title, columns, rows }: DataTableProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="border-b border-stone-200 px-5 py-4 dark:border-stone-800">
        <h2 className="text-base font-semibold text-stone-900 dark:text-white">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-500 dark:bg-stone-800/50 dark:text-stone-400">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-5 py-3 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="text-stone-700 dark:text-stone-300">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap px-5 py-4">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
