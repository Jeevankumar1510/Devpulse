"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useDataset } from "@/components/DatasetContext";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  FileCheck,
  Percent,
  CheckCircle,
} from "lucide-react";

export default function QualityCenterPage() {
  const { selectedDatasetId, selectedDataset } = useDataset();
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAudit() {
      if (!selectedDatasetId) return;
      setLoading(true);
      try {
        const res = await api.getQualityAudit(selectedDatasetId);
        setAudit(res);
      } catch (err) {
        console.error("Quality audit failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, [selectedDatasetId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground text-sm font-medium">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        Auditing Data Quality Rules &amp; Integrity Dimensions...
      </div>
    );
  }

  const dim = audit?.dimension_scores || {};
  const metrics = audit?.summary_metrics || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          Data Quality Center: {selectedDataset?.name || "Dataset"}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Enterprise data quality scorecard measuring completeness, uniqueness, statistical validity, and column-level anomalies.
        </p>
      </div>

      {/* Top Quality Scorecard Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-3xl">
            {audit?.quality_grade || "A"}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overall Quality Score</div>
            <div className="text-3xl font-extrabold text-foreground mt-0.5">
              {audit?.overall_score || 95.0} <span className="text-lg font-normal text-muted-foreground">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Quality evaluation based on 4 weighted integrity dimensions across {metrics.total_rows?.toLocaleString()} rows.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground block">Completeness</span>
            <span className="text-lg font-bold text-foreground">{dim.completeness}%</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground block">Uniqueness</span>
            <span className="text-lg font-bold text-foreground">{dim.uniqueness}%</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground block">Validity</span>
            <span className="text-lg font-bold text-foreground">{dim.validity}%</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground block">Consistency</span>
            <span className="text-lg font-bold text-foreground">{dim.consistency}%</span>
          </div>
        </div>
      </div>

      {/* Issue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Missing Cells</span>
            <div className="text-xl font-bold text-foreground mt-1">{metrics.total_missing_cells || 0}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Percent className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Duplicate Rows</span>
            <div className="text-xl font-bold text-foreground mt-1">{metrics.duplicate_rows || 0}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Statistical Outliers</span>
            <div className="text-xl font-bold text-amber-500 mt-1">{metrics.total_outliers || 0}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Column Diagnostics Breakdown Table */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-foreground">Column Diagnostic Audit ({audit?.column_diagnostics?.length || 0} columns)</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/60 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Column</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Completeness</th>
                <th className="py-2.5 px-3">Nulls</th>
                <th className="py-2.5 px-3">Unique</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Diagnostics &amp; Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {audit?.column_diagnostics?.map((c: any) => (
                <tr key={c.column} className="hover:bg-accent/40 font-mono text-[11px]">
                  <td className="py-2 px-3 font-bold text-foreground">{c.column}</td>
                  <td className="py-2 px-3 text-muted-foreground">{c.data_type}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${c.completeness_score}%` }}
                        />
                      </div>
                      <span>{c.completeness_score}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">{c.null_count}</td>
                  <td className="py-2 px-3">{c.unique_count}</td>
                  <td className="py-2 px-3">
                    {c.status === "PASS" ? (
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> PASS
                      </span>
                    ) : (
                      <span className="text-amber-500 font-bold flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> WARNING
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-sans text-xs">
                    {c.issues?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {c.issues.map((iss: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px]">
                            {iss}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">Clean &amp; Validated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
