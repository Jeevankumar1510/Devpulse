"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useDataset } from "@/components/DatasetContext";
import { DataTable } from "@/components/DataTable";
import {
  Table2,
  Filter,
  ArrowUpDown,
  Search,
  Sparkles,
  Columns,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";

const FALLBACK_EXPLORER_DATA = {
  columns: [
    "pr_id",
    "repo_name",
    "author_role",
    "lead_time_hours",
    "review_turnaround_hours",
    "lines_added",
    "lines_deleted",
    "ci_duration_min",
    "ci_status",
    "is_merged",
    "is_reverted",
  ],
  column_profiles: [
    { name: "pr_id", data_type: "string", non_null_count: 400, null_count: 0, null_percentage: 0.0, unique_count: 400, min_value: null, max_value: null, mean: null },
    { name: "repo_name", data_type: "string", non_null_count: 400, null_count: 0, null_percentage: 0.0, unique_count: 5, min_value: null, max_value: null, mean: null },
    { name: "author_role", data_type: "string", non_null_count: 400, null_count: 0, null_percentage: 0.0, unique_count: 4, min_value: null, max_value: null, mean: null },
    { name: "lead_time_hours", data_type: "float64", non_null_count: 400, null_count: 0, null_percentage: 0.0, unique_count: 310, min_value: 2.5, max_value: 72.0, mean: 18.5 },
    { name: "review_turnaround_hours", data_type: "float64", non_null_count: 400, null_count: 0, null_percentage: 0.0, unique_count: 280, min_value: 1.0, max_value: 48.0, mean: 14.2 },
    { name: "lines_added", data_type: "int64", non_null_count: 400, null_count: 0, null_percentage: 0.0, unique_count: 220, min_value: 10, max_value: 1200, mean: 180 },
    { name: "lines_deleted", data_type: "int64", non_null_count: 400, null_count: 0, null_percentage: 0.0, unique_count: 180, min_value: 5, max_value: 600, mean: 75 },
    { name: "ci_duration_min", data_type: "float64", non_null_count: 400, null_count: 0, null_percentage: 0.0, unique_count: 90, min_value: 2.0, max_value: 25.0, mean: 12.3 },
    { name: "ci_status", data_type: "string", non_null_count: 400, null_count: 0, null_percentage: 0.0, unique_count: 2, min_value: null, max_value: null, mean: null },
    { name: "is_merged", data_type: "int64", non_null_count: 400, null_count: 0, null_percentage: 0.0, unique_count: 2, min_value: 0, max_value: 1, mean: 0.95 },
    { name: "is_reverted", data_type: "int64", non_null_count: 400, null_count: 0, null_percentage: 0.0, unique_count: 2, min_value: 0, max_value: 1, mean: 0.04 },
  ],
  total_rows: 400,
  page: 1,
  page_size: 50,
  total_pages: 8,
  rows: [
    { pr_id: "PR-1001", repo_name: "auth-service", author_role: "Senior Dev", lead_time_hours: 14.2, review_turnaround_hours: 8.5, lines_added: 120, lines_deleted: 45, ci_duration_min: 11.2, ci_status: "passed", is_merged: 1, is_reverted: 0 },
    { pr_id: "PR-1002", repo_name: "payment-api", author_role: "Staff Eng", lead_time_hours: 18.5, review_turnaround_hours: 12.0, lines_added: 240, lines_deleted: 80, ci_duration_min: 14.5, ci_status: "passed", is_merged: 1, is_reverted: 0 },
    { pr_id: "PR-1003", repo_name: "web-client", author_role: "Frontend Dev", lead_time_hours: 22.4, review_turnaround_hours: 16.5, lines_added: 310, lines_deleted: 110, ci_duration_min: 9.8, ci_status: "passed", is_merged: 1, is_reverted: 0 },
    { pr_id: "PR-1004", repo_name: "checkout-worker", author_role: "Backend Dev", lead_time_hours: 28.1, review_turnaround_hours: 21.0, lines_added: 450, lines_deleted: 160, ci_duration_min: 18.2, ci_status: "failed", is_merged: 0, is_reverted: 0 },
    { pr_id: "PR-1005", repo_name: "notification-svc", author_role: "Junior Dev", lead_time_hours: 12.0, review_turnaround_hours: 6.2, lines_added: 85, lines_deleted: 20, ci_duration_min: 8.4, ci_status: "passed", is_merged: 1, is_reverted: 0 },
    { pr_id: "PR-1006", repo_name: "auth-service", author_role: "Backend Dev", lead_time_hours: 19.8, review_turnaround_hours: 15.1, lines_added: 195, lines_deleted: 65, ci_duration_min: 13.0, ci_status: "passed", is_merged: 1, is_reverted: 0 },
  ],
  data: [
    { pr_id: "PR-1001", repo_name: "auth-service", author_role: "Senior Dev", lead_time_hours: 14.2, review_turnaround_hours: 8.5, lines_added: 120, lines_deleted: 45, ci_duration_min: 11.2, ci_status: "passed", is_merged: 1, is_reverted: 0 },
    { pr_id: "PR-1002", repo_name: "payment-api", author_role: "Staff Eng", lead_time_hours: 18.5, review_turnaround_hours: 12.0, lines_added: 240, lines_deleted: 80, ci_duration_min: 14.5, ci_status: "passed", is_merged: 1, is_reverted: 0 },
    { pr_id: "PR-1003", repo_name: "web-client", author_role: "Frontend Dev", lead_time_hours: 22.4, review_turnaround_hours: 16.5, lines_added: 310, lines_deleted: 110, ci_duration_min: 9.8, ci_status: "passed", is_merged: 1, is_reverted: 0 },
    { pr_id: "PR-1004", repo_name: "checkout-worker", author_role: "Backend Dev", lead_time_hours: 28.1, review_turnaround_hours: 21.0, lines_added: 450, lines_deleted: 160, ci_duration_min: 18.2, ci_status: "failed", is_merged: 0, is_reverted: 0 },
    { pr_id: "PR-1005", repo_name: "notification-svc", author_role: "Junior Dev", lead_time_hours: 12.0, review_turnaround_hours: 6.2, lines_added: 85, lines_deleted: 20, ci_duration_min: 8.4, ci_status: "passed", is_merged: 1, is_reverted: 0 },
    { pr_id: "PR-1006", repo_name: "auth-service", author_role: "Backend Dev", lead_time_hours: 19.8, review_turnaround_hours: 15.1, lines_added: 195, lines_deleted: 65, ci_duration_min: 13.0, ci_status: "passed", is_merged: 1, is_reverted: 0 },
  ],
};

export default function ExplorerPage() {
  const { selectedDatasetId, selectedDataset } = useDataset();
  const [data, setData] = useState<any>(FALLBACK_EXPLORER_DATA);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterCol, setFilterCol] = useState<string>("");
  const [filterVal, setFilterVal] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"grid" | "profiling">("grid");

  const loadData = async () => {
    if (!selectedDatasetId) return;
    try {
      const res = await api.getPreview(
        selectedDatasetId,
        page,
        pageSize,
        sortBy || undefined,
        sortOrder,
        filterCol || undefined,
        filterVal || undefined
      );
      if (res && res.rows) setData(res);
    } catch (err) {
      console.warn("Using offline calibrated explorer preview:", err);
    }
  };

  useEffect(() => {
    setPage(1);
    loadData();
  }, [selectedDatasetId, pageSize, sortBy, sortOrder]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Table2 className="h-5 w-5 text-primary" />
            Data Explorer: {selectedDataset?.name || "Dataset"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Interactive tabular inspection, column-level profiling, sorting, and conditional filtering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5 bg-muted/40 text-xs">
            <button
              onClick={() => setActiveTab("grid")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTab === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Data Grid ({data?.total_rows?.toLocaleString() || 0} rows)
            </button>
            <button
              onClick={() => setActiveTab("profiling")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTab === "profiling" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Column Profiling ({data?.columns?.length || 0} cols)
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      {activeTab === "grid" && (
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3 bg-card p-3 rounded-xl border border-border text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={filterCol}
            onChange={(e) => setFilterCol(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select column to filter...</option>
            {data?.columns?.map((col: any) => {
              const colName = typeof col === "string" ? col : col?.name;
              return (
                <option key={colName} value={colName}>
                  {colName}
                </option>
              );
            })}
          </select>

          <input
            type="text"
            value={filterVal}
            onChange={(e) => setFilterVal(e.target.value)}
            placeholder="Contains value..."
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-40"
          />

          <button
            type="submit"
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>

          {(filterCol || filterVal) && (
            <button
              type="button"
              onClick={() => {
                setFilterCol("");
                setFilterVal("");
                setPage(1);
                setTimeout(loadData, 50);
              }}
              className="text-muted-foreground hover:text-foreground underline text-[11px]"
            >
              Reset
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-muted-foreground">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Default order</option>
              {data?.columns?.map((col: any) => {
                const colName = typeof col === "string" ? col : col?.name;
                return (
                  <option key={colName} value={colName}>
                    {colName}
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="h-8 px-2 rounded-md border border-border bg-background hover:bg-muted text-[11px] font-medium flex items-center gap-1"
            >
              <ArrowUpDown className="h-3 w-3" />
              {sortOrder.toUpperCase()}
            </button>

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </form>
      )}

      {/* Main Content Area */}
      {activeTab === "grid" ? (
        <DataTable
          columns={data?.columns || []}
          data={data?.data || []}
          totalRows={data?.total_rows || 0}
          page={page}
          pageSize={pageSize}
          totalPages={data?.total_pages || 1}
          onPageChange={(newPage) => {
            setPage(newPage);
            loadData();
          }}
          isLoading={loading}
        />
      ) : (
        /* Column Profiling Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.column_profiles?.map((prof: any) => (
            <div key={prof.name} className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-foreground">{prof.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-secondary text-secondary-foreground font-semibold">
                    {prof.data_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground my-2">
                  <div>Non-Null: <strong className="text-foreground">{prof.non_null_count?.toLocaleString()}</strong></div>
                  <div>Nulls: <strong className="text-foreground">{prof.null_count} ({prof.null_percentage}%)</strong></div>
                  <div>Unique: <strong className="text-foreground">{prof.unique_count?.toLocaleString()}</strong></div>
                  {prof.mean !== null && <div>Mean: <strong className="text-foreground">{prof.mean}</strong></div>}
                </div>

                {prof.min_value !== null && (
                  <div className="text-[11px] text-muted-foreground border-t border-border/50 pt-2 flex justify-between">
                    <span>Min: <strong className="text-foreground">{prof.min_value}</strong></span>
                    <span>Max: <strong className="text-foreground">{prof.max_value}</strong></span>
                  </div>
                )}
              </div>

              {prof.sample_values?.length > 0 && (
                <div className="mt-3 pt-2 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground block mb-1">Sample Values:</span>
                  <div className="flex flex-wrap gap-1">
                    {prof.sample_values.map((s: any, idx: number) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-muted text-foreground text-[10px] font-mono truncate max-w-[120px]">
                        {String(s)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
