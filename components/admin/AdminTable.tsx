"use client";

import { cn } from "@/lib/utils";

export type AdminColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

type Props<T> = {
  columns: AdminColumn<T>[];
  data: T[];
  keyField: keyof T | ((row: T) => string);
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
};

export function AdminTable<T>({ columns, data, keyField, emptyMessage = "No records found.", onRowClick }: Props<T>) {
  const getKey = (row: T) => (typeof keyField === "function" ? keyField(row) : String(row[keyField]));

  if (data.length === 0) {
    return <p className="text-sm text-ink-400 text-center py-8">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.02]">
            {columns.map((col) => (
              <th key={col.key} className={cn("px-4 py-3 text-xs font-medium text-ink-400 uppercase tracking-wide", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={getKey(row)}
              className={cn(
                "border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-ink-200", col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
