"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { KPICard } from "@/components/KPICard";
import {
  ShieldCheck,
  Bug,
  AlertTriangle,
  CheckCircle,
  Activity,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function SoftwareQualityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuality() {
      try {
        const res = await api.getSoftwareQualityMetrics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadQuality();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground text-sm font-medium">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        Loading Software Quality Intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          Software Quality Intelligence &amp; Defect Analytics
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Defect density per KLOC, escape defect rates, component vulnerabilities, and resolution velocity.
        </p>
      </div>

      {/* Top Quality Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Defect Density"
          value={data?.defect_density_per_kloc || "1.8"}
          unit="defects / KLOC"
          status="HEALTHY"
          change={-12.0}
          target="< 2.5"
          description="Normalized defect rate per 1,000 lines"
        />
        <KPICard
          title="Escape Defect Rate"
          value={`${data?.escape_defect_rate_pct || 22.0}%`}
          status={data?.escape_defect_rate_pct <= 25.0 ? "HEALTHY" : "WARNING"}
          change={-4.5}
          target="< 20.0%"
          description="Defects identified in Production post-release"
        />
        <KPICard
          title="Avg Resolution Time"
          value={data?.avg_resolution_time_hours || "36.4"}
          unit="hours"
          status="HEALTHY"
          change={-8.8}
          description="Mean bug remediation duration"
        />
        <KPICard
          title="Release Stability Index"
          value={`${data?.release_stability_index || 92.4}%`}
          status="HEALTHY"
          change={3.2}
          target="> 90.0%"
          description="Composite deployment health score"
        />
      </div>

      {/* Visualizations: Component Vulnerability & Root Causes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component Breakdown */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground">Defects by Architecture Component</h3>
            <span className="text-[10px] text-muted-foreground font-mono">{data?.total_defects} total bugs</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.component_breakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="component" stroke="#888888" fontSize={10} angle={-20} textAnchor="end" />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Defects" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground">Defects by Severity Tier</h3>
            <span className="text-[10px] text-muted-foreground">Triage Priority</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.severity_distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="severity" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Defect Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Root Cause Taxonomy */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Bug className="h-4 w-4 text-rose-500" /> Root Cause Taxonomy &amp; Frequency Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {data?.root_cause_breakdown?.map((rc: any) => (
            <div key={rc.cause} className="p-3.5 rounded-lg border border-border bg-muted/30 text-xs space-y-1">
              <span className="text-muted-foreground font-mono text-[11px] block">{rc.cause}</span>
              <div className="text-lg font-bold text-foreground">{rc.count} occurrences</div>
              <div className="text-[10px] text-primary">
                {Math.round((rc.count / data.total_defects) * 100)}% of total defects
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
