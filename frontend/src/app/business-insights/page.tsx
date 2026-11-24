"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { KPICard } from "@/components/KPICard";
import {
  TrendingUp,
  Target,
  Sparkles,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  Loader2,
} from "lucide-react";

export default function BusinessInsightsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBI() {
      try {
        const res = await api.getBusinessInsights();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBI();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground text-sm font-medium">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        Synthesizing Executive Business Intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Business Intelligence &amp; Strategic Insights
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          KPI management, root-cause tree analysis, month-over-month trend benchmarks, and automated executive recommendations.
        </p>
      </div>

      {/* Executive Brief Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-accent/20 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground uppercase tracking-wider">
                Automated Synthesis
              </span>
              <span className="text-xs text-muted-foreground">Executive Intelligence Summary</span>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed max-w-3xl mt-1">
              {data?.executive_summary}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">System Health</span>
            <div className="text-3xl font-black text-primary">{data?.overall_health_score}%</div>
          </div>
        </div>
      </div>

      {/* KPI Performance Scorecard */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" /> Core Performance Scorecards ({data?.kpi_summary?.length || 0})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.kpi_summary?.map((k: any) => (
            <KPICard
              key={k.id}
              title={k.name}
              value={k.current}
              unit={k.unit}
              target={k.target}
              status={k.status}
              trend={k.trend}
              change={k.change_pct}
              description={k.description}
            />
          ))}
        </div>
      </div>

      {/* Root-Cause Analysis Trees */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" /> Root-Cause Analysis Diagnostic Trees
        </h3>

        <div className="space-y-4">
          {data?.root_cause_analysis?.map((rc: any, idx: number) => (
            <div key={idx} className="rounded-xl border border-border p-4 bg-muted/20 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border pb-2">
                <span className="font-bold text-foreground text-sm">{rc.issue}</span>
                <span className="text-[11px] font-semibold text-primary">Confidence: {rc.confidence_level}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Primary Root Driver:
                </span>
                <p className="font-medium text-foreground mt-0.5">{rc.root_driver}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Contributing Factors:
                </span>
                <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground text-[11px]">
                  {rc.contributing_factors?.map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-foreground">
                <strong className="text-primary">Recommended Remediation:</strong> {rc.recommended_action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Comparisons Table & Strategic Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Comparisons */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-foreground">Month-over-Month Velocity Trajectory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/60 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3">Prev Month</th>
                  <th className="py-2.5 px-3">Current</th>
                  <th className="py-2.5 px-3 text-right">Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                {data?.trend_comparisons?.map((t: any) => (
                  <tr key={t.metric} className="hover:bg-accent/40">
                    <td className="py-2 px-3 font-sans font-medium text-foreground">{t.metric}</td>
                    <td className="py-2 px-3 text-muted-foreground">{t.previous_month}</td>
                    <td className="py-2 px-3 font-bold text-foreground">{t.current_month}</td>
                    <td className="py-2 px-3 text-right text-emerald-500 font-bold">
                      {t.delta_pct > 0 ? `+${t.delta_pct}%` : `${t.delta_pct}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prioritized Actionable Recommendations */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-foreground">Prioritized Actionable Roadmap</h3>
          <div className="space-y-3">
            {data?.actionable_recommendations?.map((rec: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-muted/20 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-primary">{rec.priority}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{rec.area}</span>
                </div>
                <p className="text-foreground leading-relaxed text-[11px] font-medium">{rec.action}</p>
                <div className="text-[10px] text-emerald-500 font-semibold pt-1">
                  Expected Impact: {rec.expected_impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
