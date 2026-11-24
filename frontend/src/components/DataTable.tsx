import React from "react";
import { ChevronLeft, ChevronRight, Loader2, Database } from "lucide-react";

interface DataTableProps {
  columns: string[];
  data: any[];
  totalRows?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable({
  columns,
  data,
  totalRows = 0,
  page = 1,
  pageSize = 50,
  totalPages = 1,
  onPageChange,
  isLoading = false,
  emptyMessage = "No records found.",
}: DataTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground bg-card rounded-xl border border-border">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-xs font-medium">Loading data preview...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground bg-card rounded-xl border border-border">
        <Database className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-xs font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-muted/70 sticky top-0 z-10 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-2.5 px-3 w-12 text-center text-muted-foreground/60">#</th>
              {columns.map((col) => (
                <th key={col} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-accent/40 transition-colors">
                <td className="py-2 px-3 text-center text-muted-foreground text-[10px] font-mono">
                  {(page - 1) * pageSize + idx + 1}
                </td>
                {columns.map((col) => {
                  const val = row[col];
                  const displayVal = val === null || val === undefined ? "—" : typeof val === "object" ? JSON.stringify(val) : String(val);
                  return (
                    <td key={col} className="py-2 px-3 whitespace-nowrap text-foreground font-mono text-[11px] max-w-[280px] truncate" title={displayVal}>
                      {displayVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {onPageChange && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-card text-xs text-muted-foreground">
          <div>
            Showing <strong className="text-foreground">{(page - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-foreground">{Math.min(page * pageSize, totalRows)}</strong> of{" "}
            <strong className="text-foreground">{totalRows.toLocaleString()}</strong> entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-medium text-foreground">
              {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
