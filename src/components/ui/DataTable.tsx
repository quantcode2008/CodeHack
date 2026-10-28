"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  mobileLabel?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyState?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyState,
  className,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <div className="w-full">{emptyState}</div>;
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Desktop view (≥768px): Refined editorial table */}
      <div className="hidden md:block overflow-hidden border border-line rounded-editorial bg-surface shadow-editorial">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-bone/40 text-mono-label font-mono uppercase text-ink-muted">
              {columns.map((col) => (
                <th key={col.key} className={cn("py-3.5 px-4 font-medium", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-bone/30 transition-colors group"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("py-4 px-4 text-small text-ink", col.className)}>
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view (<768px): Responsive stacked card architecture */}
      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            className="p-4 bg-surface border border-line rounded-editorial shadow-sm space-y-2.5"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex items-center justify-between text-small gap-2"
              >
                <span className="text-mono-label text-ink-muted uppercase">
                  {col.mobileLabel || col.header}
                </span>
                <div className="text-right text-ink font-medium">
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? "")}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
