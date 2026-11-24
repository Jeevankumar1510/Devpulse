"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useDataset } from "@/components/DatasetContext";
import { DataTable } from "@/components/DataTable";
import {
  Database,
  Play,
  Clock,
  History,
  FileCode,
  CheckCircle,
  AlertCircle,
  Copy,
  Terminal,
  Loader2,
} from "lucide-react";

const STARTER_QUERIES = [
  {
    name: "CTE & Window Ranking",
    sql: `-- Window Functions & Common Table Expression (CTE)
WITH repo_stats AS (
  SELECT 
    repo_name,
    COUNT(*) AS total_prs,
    ROUND(AVG(lead_time_hours), 2) AS avg_lead_time_hours,
    ROUND(AVG(review_turnaround_hours), 2) AS avg_review_wait_hours
  FROM current_dataset
  GROUP BY repo_name
)
SELECT 
  repo_name,
  total_prs,
  avg_lead_time_hours,
  avg_review_wait_hours,
  RANK() OVER (ORDER BY avg_lead_time_hours ASC) AS velocity_rank,
  DENSE_RANK() OVER (ORDER BY total_prs DESC) AS volume_rank
FROM repo_stats
ORDER BY velocity_rank ASC;`,
  },
  {
    name: "PR Size & CI Correlation",
    sql: `-- Aggregate PR Line Changes by CI Outcome
SELECT 
  ci_status,
  has_test_coverage,
  COUNT(*) AS pr_count,
  ROUND(AVG(lines_added), 1) AS mean_lines_added,
  ROUND(AVG(ci_duration_min), 1) AS mean_ci_duration_min,
  ROUND(AVG(review_comments), 1) AS mean_comments
FROM current_dataset
GROUP BY ci_status, has_test_coverage
ORDER BY pr_count DESC;`,
  },
  {
    name: "Basic Data Exploration",
    sql: `-- Preview top 25 records from analytical table
SELECT * 
FROM current_dataset 
LIMIT 25;`,
  },
];

export default function SQLStudioPage() {
  const { selectedDatasetId, selectedDataset } = useDataset();
  const [query, setQuery] = useState(STARTER_QUERIES[0].sql);
  const [result, setResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<"results" | "plan" | "history">("results");
  const [history, setHistory] = useState<any[]>([]);

  const handleExecute = async () => {
    if (!query.trim()) return;
    setExecuting(true);
    try {
      const res = await api.executeSQL(query, selectedDatasetId || undefined);
      setResult(res);
      setActiveTab("results");
      loadHistory();
    } catch (err: any) {
      setResult({ error: err.message, columns: [], rows: [] });
    } finally {
      setExecuting(false);
    }
  };

  const loadHistory = async () => {
    try {
      const hist = await api.getQueryHistory();
      setHistory(hist);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          SQL Analytics Studio: {selectedDataset?.name || "Analytical Table"}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          High-performance analytical SQL query engine supporting CTEs, window functions, and query execution plans.
        </p>
      </div>

      {/* Query Editor & Templates */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Terminal className="h-3.5 w-3.5 text-primary" />
            <span>SQL Query Editor</span>
            <span className="text-[10px] text-muted-foreground font-mono ml-2">
              (Table alias: <code className="text-primary font-bold">current_dataset</code>)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Templates:</span>
            {STARTER_QUERIES.map((t) => (
              <button
                key={t.name}
                onClick={() => setQuery(t.sql)}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary hover:bg-accent text-secondary-foreground transition-colors"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={7}
          className="w-full font-mono text-xs p-3 rounded-lg border border-input bg-background/90 text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
          placeholder="Enter SQL statement (e.g. SELECT * FROM current_dataset LIMIT 10)..."
        />

        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <CheckCircle className="h-3 w-3" /> Safe Read-Only Mode
            </span>
            <span>• Destructive DDL/DML statements blocked</span>
          </div>

          <button
            onClick={handleExecute}
            disabled={executing || !query.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {executing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Executing Query...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" /> Run Query (Ctrl+Enter)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Header Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab("results")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === "results"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Query Results {result?.row_count !== undefined && `(${result.row_count} rows)`}
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === "plan"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Query Execution Plan (EXPLAIN)
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === "history"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Query History ({history.length})
          </button>
        </div>

        {result?.execution_time_ms !== undefined && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="h-3.5 w-3.5" /> {result.execution_time_ms} ms
            </span>
            <span className="font-mono">{result.row_count} rows returned</span>
          </div>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === "results" && (
        <div>
          {result?.error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-500 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong>SQL Syntax / Runtime Error:</strong>
                <pre className="mt-1 font-mono text-[11px] whitespace-pre-wrap">{result.error}</pre>
              </div>
            </div>
          ) : result?.rows ? (
            <DataTable
              columns={result.columns || []}
              data={result.rows || []}
              totalRows={result.row_count || 0}
              pageSize={50}
            />
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
              <Database className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs">Click &quot;Run Query&quot; above to view analytical results.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "plan" && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground">Physical Execution Plan</h3>
            <span className="text-[10px] text-muted-foreground font-mono">DuckDB Analytical Optimizer</span>
          </div>
          <pre className="p-4 rounded-lg bg-muted/60 border border-border font-mono text-[11px] text-foreground overflow-x-auto whitespace-pre-wrap">
            {result?.query_plan || "Execute a query to inspect its cost and execution tree."}
          </pre>
        </div>
      )}

      {activeTab === "history" && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-foreground">Recent Query Executions</h3>
          <div className="divide-y divide-border/60">
            {history.map((h) => (
              <div key={h.id} className="py-2.5 flex items-center justify-between text-xs gap-4">
                <div className="font-mono text-[11px] truncate text-foreground flex-1">
                  <code>{h.query_text}</code>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-[11px] shrink-0">
                  <span className={h.status === "SUCCESS" ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                    {h.status}
                  </span>
                  <span>{h.execution_time_ms} ms</span>
                  <span>{h.row_count} rows</span>
                  <button
                    onClick={() => {
                      setQuery(h.query_text);
                      setActiveTab("results");
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Load
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
