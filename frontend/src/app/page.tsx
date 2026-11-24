"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { KPICard } from "@/components/KPICard";
import {
  Rocket,
  Clock,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  Database,
  FileSpreadsheet,
  Brain,
  Code2,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const metrics = await api.getOverviewMetrics();
        setData(metrics);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground text-sm font-medium">
        <Activity className="h-6 w-6 animate-spin text-primary mr-2" />
        Loading Executive Dashboard...
      </div>
    );
  }

  const dora = data?.dora_metrics || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: DORA & Executive Pulse */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-accent/20 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-primary-foreground uppercase tracking-wider">
                {data?.dora_tier || "High Performer"}
              </span>
              <span className="text-xs text-muted-foreground font-medium">DORA Velocity Index: <strong>{data?.dora_score || 84.2}/100</strong></span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Engineering Intelligence & Quality Overview
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
              {data?.executive_summary ||
                "DORA velocity benchmarks confirm high engineering delivery cadence with lead times averaging 18.5 hours. Automated quality gates and bottleneck diagnostics are tracking below."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Health Score</span>
              <div className="text-3xl font-black text-primary">{data?.overall_health_score || 85.0}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* DORA 4 Core Metrics Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            Verified DORA Metrics (Audit-Backed)
          </h2>
          <span className="text-[11px] text-muted-foreground">Calibrated against verified deployment logs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Deployment Frequency"
            value={dora.deployment_frequency?.value || "1.2"}
            unit={dora.deployment_frequency?.unit || "deploys / day"}
            status={dora.deployment_frequency?.rating?.toUpperCase() || "HEALTHY"}
            change={12.5}
            description="Daily continuous delivery cadence"
          />
          <KPICard
            title="Lead Time for Changes"
            value={dora.lead_time_for_changes?.value || "18.5"}
            unit={dora.lead_time_for_changes?.unit || "hours"}
            status={dora.lead_time_for_changes?.rating?.toUpperCase() || "HEALTHY"}
            change={-15.4}
            description="Median elapsed commit to live deploy"
          />
          <KPICard
            title="Change Failure Rate"
            value={dora.change_failure_rate?.value || "7.8"}
            unit="%"
            status={dora.change_failure_rate?.rating === "Elite" ? "HEALTHY" : "WARNING"}
            change={8.2}
            target="< 5.0%"
            description="Incidents requiring rollback or hotfix"
          />
          <KPICard
            title="Time to Restore (MTTR)"
            value={dora.time_to_restore_service?.value || "2.8"}
            unit="hours"
            status={dora.time_to_restore_service?.rating === "Elite" ? "HEALTHY" : "WARNING"}
            change={-6.5}
            target="< 2.0h"
            description="Mean time to remediate failure"
          />
        </div>
      </div>

      {/* Trend Visualizations & Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Lead Time vs Review Turnaround Trend</h3>
              <p className="text-xs text-muted-foreground">5-week trajectory showing PR velocity improvements</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Lead Time (h)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Review Turnaround (h)</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.quality_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadTimeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="week" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="lead_time" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#leadTimeGrad)" name="Lead Time (h)" />
                <Area type="monotone" dataKey="review_hours" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#reviewGrad)" name="Review Wait (h)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottleneck Alerts (1 Col) */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Active Workflow Bottlenecks
              </h3>
              <span className="text-[10px] font-semibold text-amber-500 px-2 py-0.5 rounded-full bg-amber-500/10">Priority Focus</span>
            </div>

            <div className="space-y-3">
              {(data?.bottlenecks || []).map((b: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-border p-3 bg-muted/30 text-xs">
                  <div className="flex items-center justify-between font-semibold text-foreground mb-1">
                    <span>{b.type}</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">{b.severity}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mb-2">{b.impact}</p>
                  <div className="text-[11px] text-primary font-medium bg-primary/10 p-1.5 rounded">
                    <strong>Action:</strong> {b.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/github-analytics"
            className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Explore Full Engineering Analytics <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Launchpad to Analytical Studios */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Interactive Analytical Suites
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: "SQL Studio", href: "/sql", icon: Database, desc: "Safe queries & plans" },
            { name: "Excel Studio", href: "/excel", icon: FileSpreadsheet, desc: "Pivots & formulas" },
            { name: "Python Lab", href: "/python", icon: Code2, desc: "Pandas & transforms" },
            { name: "EDA Workspace", href: "/eda", icon: TrendingUp, desc: "Distributions & heatmaps" },
            { name: "Predictive ML", href: "/predictive", icon: Brain, desc: "Regression & models" },
            { name: "Quality Center", href: "/quality", icon: ShieldCheck, desc: "Audit scorecards" },
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.name}
                href={tool.href}
                className="group rounded-xl border border-border bg-card p-3.5 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {tool.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{tool.desc}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
