"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useDataset } from "@/components/DatasetContext";
import {
  Compass,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  BarChart2,
  Loader2,
} from "lucide-react";

export default function EDAPage() {
  const { selectedDatasetId, selectedDataset } = useDataset();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEDA() {
      if (!selectedDatasetId) return;
      setLoading(true);
      try {
        const res = await api.getEDAReport(selectedDatasetId);
        setData(res);
      } catch (err) {
        console.error("EDA error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEDA();
  }, [selectedDatasetId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground text-sm font-medium">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        Generating Automated EDA Intelligence Report...
      </div>
    );
  }

  const overview = data?.overview || {};
  const correlations = data?.correlations || {};
  const numDist = data?.numerical_distributions || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          Exploratory Data Analysis: {selectedDataset?.name || "Dataset"}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Univariate, bivariate, correlation heatmaps, skewness diagnostics, and automatic analytical narrative.
        </p>
      </div>

      {/* Top Stat Pulse Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Rows</span>
          <div className="text-2xl font-bold text-foreground mt-1">{overview.total_rows?.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Dimensions</span>
          <div className="text-2xl font-bold text-foreground mt-1">
            {overview.numeric_columns_count} num / {overview.categorical_columns_count} cat
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Duplicate Rows</span>
          <div className="text-2xl font-bold text-foreground mt-1">{overview.duplicate_rows_count}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Missing Data %</span>
          <div className="text-2xl font-bold text-foreground mt-1">{overview.missing_cells_pct}%</div>
        </div>
      </div>

      {/* Automated Analytical Narrative Insights */}
      {data?.automated_insights?.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-sm space-y-2.5">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Automated Analytical Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {data.automated_insights.map((insight: string, i: number) => (
              <div key={i} className="flex items-start gap-2 bg-card p-3 rounded-lg border border-border">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-foreground leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correlation Matrix Heatmap */}
      {correlations.columns && correlations.matrix && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Pearson Correlation Matrix (Heatmap)</h3>
              <p className="text-xs text-muted-foreground">Values range from -1.0 (inverse) to +1.0 (direct correlation)</p>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-rose-500" /> Negative (-1.0)</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-muted" /> Neutral (0.0)</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Positive (+1.0)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border border-border bg-muted/60 text-left font-mono text-[10px]">Feature</th>
                  {correlations.columns.map((col: string) => (
                    <th key={col} className="p-2 border border-border bg-muted/60 font-mono text-[10px] text-center max-w-[120px] truncate" title={col}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlations.columns.map((rowCol: string, rIdx: number) => (
                  <tr key={rowCol}>
                    <td className="p-2 border border-border font-mono text-[10px] font-bold bg-muted/30 whitespace-nowrap">
                      {rowCol}
                    </td>
                    {correlations.matrix[rIdx].map((val: number, cIdx: number) => {
                      // Color intensity based on correlation
                      let bgStyle = "";
                      if (val > 0.5) bgStyle = "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold";
                      else if (val > 0.2) bgStyle = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                      else if (val < -0.5) bgStyle = "bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold";
                      else if (val < -0.2) bgStyle = "bg-rose-500/10 text-rose-600 dark:text-rose-400";

                      return (
                        <td
                          key={cIdx}
                          className={`p-2 border border-border text-center font-mono text-[11px] whitespace-nowrap ${bgStyle}`}
                        >
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Numerical Distributions & Moments */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-foreground">Statistical Moments & Distribution Parameters</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/60 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Column</th>
                <th className="py-2.5 px-3">Mean</th>
                <th className="py-2.5 px-3">Std Dev</th>
                <th className="py-2.5 px-3">Median</th>
                <th className="py-2.5 px-3">IQR</th>
                <th className="py-2.5 px-3">Min</th>
                <th className="py-2.5 px-3">Max</th>
                <th className="py-2.5 px-3">Skewness</th>
                <th className="py-2.5 px-3">Kurtosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono text-[11px]">
              {Object.entries(numDist).map(([col, stats]: [string, any]) => (
                <tr key={col} className="hover:bg-accent/40">
                  <td className="py-2 px-3 font-semibold text-foreground">{col}</td>
                  <td className="py-2 px-3">{stats.mean}</td>
                  <td className="py-2 px-3">{stats.std}</td>
                  <td className="py-2 px-3">{stats.median}</td>
                  <td className="py-2 px-3">{stats.iqr}</td>
                  <td className="py-2 px-3">{stats.min}</td>
                  <td className="py-2 px-3">{stats.max}</td>
                  <td className={`py-2 px-3 ${Math.abs(stats.skewness) > 1.0 ? "text-amber-500 font-bold" : ""}`}>
                    {stats.skewness}
                  </td>
                  <td className="py-2 px-3">{stats.kurtosis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
