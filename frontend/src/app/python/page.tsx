"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { useDataset } from "@/components/DatasetContext";
import { DataTable } from "@/components/DataTable";
import {
  Terminal,
  Play,
  Code2,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileCode,
} from "lucide-react";

const PYTHON_TEMPLATES = [
  {
    name: "Pandas PR GroupBy & Metrics",
    code: `# Inspect PR lead time distributions by service
summary = df.groupby('repo_name').agg(
    total_prs=('pr_id', 'count'),
    mean_lead_time=('lead_time_hours', 'mean'),
    median_lead_time=('lead_time_hours', 'median'),
    mean_review_turnaround=('review_turnaround_hours', 'mean'),
    reverts=('is_reverted', 'sum')
).reset_index()

summary['revert_rate_pct'] = (summary['reverts'] / summary['total_prs'] * 100).round(2)
summary = summary.sort_values(by='mean_lead_time', ascending=True)

print("Aggregated Repo Performance Summary:")
print(summary.to_string(index=False))

# Assign to result_df for table preview
result_df = summary`,
  },
  {
    name: "Detect & Flag Outliers",
    code: `# Calculate IQR boundaries for review turnaround
q25 = df['review_turnaround_hours'].quantile(0.25)
q75 = df['review_turnaround_hours'].quantile(0.75)
iqr = q75 - q25
upper_bound = q75 + 1.5 * iqr

outliers = df[df['review_turnaround_hours'] > upper_bound][
    ['pr_id', 'repo_name', 'author_role', 'lines_added', 'review_turnaround_hours']
]

print(f"IQR Upper Threshold: {upper_bound:.2f} hours")
print(f"Identified {len(outliers)} anomalous pull requests with delayed review turnaround.")

result_df = outliers`,
  },
  {
    name: "Feature Engineering",
    code: `# Create derived engineering metrics
df['churn_ratio'] = (df['lines_deleted'] / (df['lines_added'] + 1)).round(3)
df['size_category'] = pd.cut(
    df['lines_added'], 
    bins=[-1, 50, 200, 500, 10000], 
    labels=['XS', 'Small', 'Medium', 'Large']
)

print("Size distribution breakdown:")
print(df['size_category'].value_counts())

result_df = df[['pr_id', 'repo_name', 'lines_added', 'lines_deleted', 'churn_ratio', 'size_category']].head(30)`,
  },
];

export default function PythonAnalyticsPage() {
  const { selectedDatasetId, selectedDataset } = useDataset();
  const [code, setCode] = useState(PYTHON_TEMPLATES[0].code);
  const [result, setResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);

  const handleExecute = async () => {
    if (!code.trim()) return;
    setExecuting(true);
    try {
      const res = await api.executePython(code, selectedDatasetId || undefined);
      setResult(res);
    } catch (err: any) {
      setResult({ error: err.message, output: "" });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          Python Analytics Lab: {selectedDataset?.name || "DataFrame"}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Execute sandboxed Pandas and NumPy pipelines with live DataFrame transformations and stdout reporting.
        </p>
      </div>

      {/* Code Editor */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Code2 className="h-4 w-4 text-primary" />
            <span>Python Script (Pandas &amp; NumPy environment)</span>
            <span className="text-[10px] text-muted-foreground font-mono ml-2">
              (Dataset pre-bound to: <code className="text-primary font-bold">df</code>)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Recipes:</span>
            {PYTHON_TEMPLATES.map((t) => (
              <button
                key={t.name}
                onClick={() => setCode(t.code)}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary hover:bg-accent text-secondary-foreground transition-colors"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={9}
          className="w-full font-mono text-xs p-3 rounded-lg border border-input bg-background/90 text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
          placeholder="Write Python code operating on df..."
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground">
            Assign any transformed DataFrame to <code className="text-foreground font-bold">result_df</code> to render as a table.
          </span>

          <button
            onClick={handleExecute}
            disabled={executing || !code.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {executing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Running Python...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" /> Execute Script
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Sections */}
      {result && (
        <div className="space-y-4">
          {/* Header Duration */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-semibold text-foreground">Execution Results</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="h-3.5 w-3.5" /> {result.execution_time_ms} ms
            </span>
          </div>

          {result.error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-500">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertCircle className="h-4 w-4" /> Execution Traceback:
              </div>
              <pre className="font-mono text-[11px] whitespace-pre-wrap">{result.error}</pre>
            </div>
          )}

          {/* Console Stdout */}
          {result.output && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Standard Output (stdout)
              </span>
              <pre className="p-3 rounded-lg bg-muted/60 border border-border font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
                {result.output}
              </pre>
            </div>
          )}

          {/* Result DataFrame Grid */}
          {result.dataframe_preview && result.dataframe_preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">
                  Result DataFrame Preview {result.dataframe_shape && `(${result.dataframe_shape[0]} rows × ${result.dataframe_shape[1]} cols)`}
                </span>
              </div>
              <DataTable
                columns={result.dataframe_columns || Object.keys(result.dataframe_preview[0] || {})}
                data={result.dataframe_preview}
                pageSize={25}
                totalRows={result.dataframe_preview.length}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
