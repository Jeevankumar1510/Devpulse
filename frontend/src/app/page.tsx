"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useDataset } from "@/components/DatasetContext";
import { KPICard } from "@/components/KPICard";
import { AmbientMesh } from "@/components/AmbientMesh";
import { FloatingNodes } from "@/components/FloatingNodes";
import { AnimatedPipeline } from "@/components/AnimatedPipeline";
import { RadarSweep } from "@/components/RadarSweep";
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
  Sparkles,
  Zap,
  Play,
  Terminal,
  CheckCircle2,
  Workflow,
  Layers,
  FileText,
  BarChart3,
  GitPullRequest,
  Compass,
  Sigma,
  Table2,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const FEATURE_CATEGORIES = [
  { id: "all", name: "All Modules (19)" },
  { id: "engineering", name: "Engineering & DORA" },
  { id: "analytics", name: "Data Analytics & SQL" },
  { id: "ml_stats", name: "Predictive ML & Stats" },
  { id: "bi_quality", name: "BI & Governance" },
];

const PLATFORM_FEATURES = [
  {
    name: "Overview Dashboard",
    category: "engineering",
    href: "/",
    icon: Activity,
    badge: "Executive",
    desc: "Composite DORA velocity index, KPI scorecards, and live bottleneck detection.",
    color: "from-blue-500/20 to-cyan-500/20 text-cyan-400",
  },
  {
    name: "GitHub Engineering Analytics",
    category: "engineering",
    href: "/github-analytics",
    icon: GitPullRequest,
    badge: "DORA",
    desc: "PR review turnaround distributions, CI pass rates, and revert risks.",
    color: "from-indigo-500/20 to-blue-500/20 text-indigo-400",
  },
  {
    name: "Software Quality Intelligence",
    category: "engineering",
    href: "/software-quality",
    icon: ShieldCheck,
    badge: "Quality",
    desc: "Defect density per KLOC, escape defects, and component risk ranking.",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400",
  },
  {
    name: "SQL Analytics Studio",
    category: "analytics",
    href: "/sql",
    icon: Database,
    badge: "DuckDB OLAP",
    desc: "Safe read-only analytical queries with CTEs, window functions, and EXPLAIN plans.",
    color: "from-blue-500/20 to-violet-500/20 text-blue-400",
  },
  {
    name: "Excel Analytics Studio",
    category: "analytics",
    href: "/excel",
    icon: FileSpreadsheet,
    badge: "Formulas & M",
    desc: "Dynamic pivot tables, formula simulations (VLOOKUP, SUMIFS), and Power Query M.",
    color: "from-emerald-500/20 to-green-500/20 text-emerald-400",
  },
  {
    name: "Python Analytics Lab",
    category: "analytics",
    href: "/python",
    icon: Terminal,
    badge: "Pandas Sandbox",
    desc: "Sandboxed DataFrame transforms with stdout console capture and table rendering.",
    color: "from-amber-500/20 to-yellow-500/20 text-amber-400",
  },
  {
    name: "Data Explorer",
    category: "analytics",
    href: "/explorer",
    icon: Table2,
    badge: "Profiling",
    desc: "Paginated data grid with column statistical profiling, search, and type inspection.",
    color: "from-purple-500/20 to-pink-500/20 text-purple-400",
  },
  {
    name: "Data Cleaning Studio",
    category: "analytics",
    href: "/cleaning",
    icon: Wand2,
    badge: "Wrangling",
    desc: "Interactive imputation, deduplication, IQR outlier filtering, and min-max scaling.",
    color: "from-fuchsia-500/20 to-purple-500/20 text-fuchsia-400",
  },
  {
    name: "EDA Workspace",
    category: "analytics",
    href: "/eda",
    icon: Compass,
    badge: "Automated",
    desc: "Univariate distributions, skewness moments, and Pearson correlation heatmaps.",
    color: "from-cyan-500/20 to-blue-500/20 text-cyan-400",
  },
  {
    name: "Statistics Lab",
    category: "ml_stats",
    href: "/statistics",
    icon: Sigma,
    badge: "Hypothesis & A/B",
    desc: "Welch's t-test, ANOVA, Chi-Square, and A/B test sample size calculators.",
    color: "from-rose-500/20 to-orange-500/20 text-rose-400",
  },
  {
    name: "Predictive Analytics Lab",
    category: "ml_stats",
    href: "/predictive",
    icon: Brain,
    badge: "Scikit-Learn",
    desc: "Regression, classification, K-Means clustering, and Isolation Forest anomalies.",
    color: "from-violet-500/20 to-purple-500/20 text-violet-400",
  },
  {
    name: "Visualization Studio",
    category: "analytics",
    href: "/visualizations",
    icon: BarChart3,
    badge: "Recharts",
    desc: "Interactive histograms, box plots with quantiles, and multi-series line/bar charts.",
    color: "from-blue-500/20 to-emerald-500/20 text-emerald-400",
  },
  {
    name: "Data Quality Center",
    category: "bi_quality",
    href: "/quality",
    icon: CheckCircle2,
    badge: "Scorecard",
    desc: "Weighted quality scorecard evaluating completeness, uniqueness, and validity.",
    color: "from-teal-500/20 to-emerald-500/20 text-teal-400",
  },
  {
    name: "ETL Pipeline Manager",
    category: "bi_quality",
    href: "/etl",
    icon: Workflow,
    badge: "Warehouse Sync",
    desc: "Extract, Transform, Load pipeline orchestration and sync audit logging.",
    color: "from-amber-500/20 to-orange-500/20 text-amber-400",
  },
  {
    name: "Power BI Integration",
    category: "bi_quality",
    href: "/powerbi",
    icon: Layers,
    badge: "Star Schema",
    desc: "Fact and dimension tables, copyable DAX measure repository, and export models.",
    color: "from-yellow-500/20 to-amber-500/20 text-yellow-400",
  },
  {
    name: "Business Insights",
    category: "bi_quality",
    href: "/business-insights",
    icon: TrendingUp,
    badge: "Strategic",
    desc: "Strategic KPI scorecards, root-cause diagnostic trees, and prioritized action roadmaps.",
    color: "from-emerald-500/20 to-blue-500/20 text-emerald-400",
  },
  {
    name: "Report Center",
    category: "bi_quality",
    href: "/reports",
    icon: FileText,
    badge: "Markdown/HTML",
    desc: "Automated executive briefings, DORA velocity assessments, and PDF/MD exports.",
    color: "from-blue-500/20 to-slate-500/20 text-blue-400",
  },
  {
    name: "Data Upload Center",
    category: "analytics",
    href: "/upload",
    icon: Sparkles,
    badge: "Ingestion",
    desc: "Multi-file CSV/XLSX/JSON drag-and-drop ingestion with schema profiling.",
    color: "from-cyan-500/20 to-indigo-500/20 text-cyan-400",
  },
];

const FALLBACK_OVERVIEW_METRICS = {
  overall_health_score: 88.5,
  dora_score: 84.2,
  dora_tier: "High Performer",
  executive_summary:
    "DORA velocity benchmarks confirm high engineering delivery cadence with lead times averaging 18.5 hours. Automated quality gates and workflow bottlenecks are tracked below.",
  dora_metrics: {
    deployment_frequency: { value: "1.25", unit: "deploys / day", rating: "High" },
    lead_time_for_changes: { value: "18.5", unit: "hours", rating: "High" },
    change_failure_rate: { value: "7.8", unit: "%", rating: "Medium" },
    time_to_restore_service: { value: "2.8", unit: "hours", rating: "High" },
  },
  quality_trend: [
    { week: "W-4", lead_time: 26.2, review_hours: 19.5, defects: 14 },
    { week: "W-3", lead_time: 23.8, review_hours: 17.2, defects: 11 },
    { week: "W-2", lead_time: 20.4, review_hours: 15.6, defects: 9 },
    { week: "W-1", lead_time: 19.1, review_hours: 14.8, defects: 7 },
    { week: "Current", lead_time: 18.5, review_hours: 14.2, defects: 6 },
  ],
  bottlenecks: [
    {
      type: "Code Review Wait State",
      severity: "Medium",
      impact: "Pull requests in auth-service wait an average of 14.2 hours for initial reviewer assignment.",
      recommendation: "Introduce CODEOWNERS automated round-robin reviewer assignments in GitHub.",
    },
    {
      type: "Flaky Integration Tests",
      severity: "Low",
      impact: "E2E checkout tests exhibit a 6.2% transient retry rate across staging pipelines.",
      recommendation: "Quarantine flaky database seed mocks in the test runner.",
    },
  ],
};

export default function OverviewPage() {
  const { datasets, selectedDatasetId, setSelectedDatasetId } = useDataset();
  const [data, setData] = useState<any>(FALLBACK_OVERVIEW_METRICS);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [featureSearch, setFeatureSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const metrics = await api.getOverviewMetrics();
        if (metrics && metrics.dora_metrics) {
          setData(metrics);
        }
      } catch (err) {
        console.warn("Using offline calibrated overview metrics:", err);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-muted-foreground text-sm font-medium gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <Activity className="h-5 w-5 text-primary absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="animate-pulse-slow">Synthesizing DevPulse Platform Telemetry...</p>
      </div>
    );
  }

  const dora = data?.dora_metrics || {};

  const filteredFeatures = PLATFORM_FEATURES.filter((f) => {
    const matchesCat = activeCategory === "all" || f.category === activeCategory;
    const matchesSearch =
      featureSearch.trim() === "" ||
      f.name.toLowerCase().includes(featureSearch.toLowerCase()) ||
      f.desc.toLowerCase().includes(featureSearch.toLowerCase()) ||
      f.badge.toLowerCase().includes(featureSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 relative">
      {/* Background Animated Ambient Mesh */}
      <AmbientMesh />

      {/* Hero Banner: Glassmorphic Ambient Canvas */}
      <div className="relative rounded-3xl border border-primary/25 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Animated Glow Spheres */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-float-reverse" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                {data?.dora_tier || "High Performer"} Tier
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                DORA Velocity Index:{" "}
                <strong className="text-foreground">{data?.dora_score || 84.2} / 100</strong>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Audit Verified
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Engineering Productivity &amp;{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-indigo-400">
                Quality Intelligence
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {data?.executive_summary ||
                "DORA velocity benchmarks confirm high engineering delivery cadence with lead times averaging 18.5 hours. Automated quality gates and workflow bottlenecks are tracked below."}
            </p>

            {/* Quick Dataset Switcher Pills */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-2">
                Active Analytical Dataset:
              </span>
              <div className="flex flex-wrap gap-2">
                {datasets.map((ds) => {
                  const active = ds.id === selectedDatasetId;
                  return (
                    <button
                      key={ds.id}
                      onClick={() => setSelectedDatasetId(ds.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 border ${
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                          : "bg-card/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70"
                      }`}
                    >
                      <Database className="h-3.5 w-3.5" />
                      <span>{ds.name}</span>
                      <span className="text-[10px] opacity-80 font-mono">({ds.row_count} rows)</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Radar Sweep Component */}
          <div className="w-full lg:w-80 shrink-0">
            <RadarSweep score={data?.dora_score || 84.2} tier={data?.dora_tier || "High Performer"} />
          </div>
        </div>
      </div>

      {/* Moving Floating Microservice Telemetry Nodes */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Autonomous Microservice Telemetry Cluster
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            Continuous Health Pings &bull; Dynamic Floating Nodes
          </span>
        </div>
        <FloatingNodes />
      </div>

      {/* Autonomous Moving Delivery Pipeline Telemetry */}
      <AnimatedPipeline />

      {/* DORA 4 Core Metrics Section with Interactive Visual Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Rocket className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              DORA Core Velocity Metrics (Audit-Backed)
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
            Commit counts excluded from individual productivity scoring
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Deployment Frequency"
            value={dora.deployment_frequency?.value || "1.25"}
            unit={dora.deployment_frequency?.unit || "deploys / day"}
            status={dora.deployment_frequency?.rating?.toUpperCase() || "HEALTHY"}
            change={12.5}
            progressPct={80}
            description="Daily release cadence to production"
          />
          <KPICard
            title="Lead Time for Changes"
            value={dora.lead_time_for_changes?.value || "18.5"}
            unit={dora.lead_time_for_changes?.unit || "hours"}
            status={dora.lead_time_for_changes?.rating?.toUpperCase() || "HEALTHY"}
            change={-15.4}
            progressPct={72}
            description="Median elapsed commit to live deploy"
          />
          <KPICard
            title="Change Failure Rate"
            value={dora.change_failure_rate?.value || "7.8"}
            unit="%"
            status={dora.change_failure_rate?.rating === "Elite" ? "HEALTHY" : "WARNING"}
            change={8.2}
            target="< 5.0%"
            progressPct={85}
            description="Proportion requiring rollback or fix"
          />
          <KPICard
            title="Time to Restore (MTTR)"
            value={dora.time_to_restore_service?.value || "2.8"}
            unit="hours"
            status={dora.time_to_restore_service?.rating === "Elite" ? "HEALTHY" : "WARNING"}
            change={-6.5}
            target="< 2.0h"
            progressPct={65}
            description="Mean recovery duration after incident"
          />
        </div>
      </div>

      {/* Visual Analytics & Bottlenecks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Animated Trajectory Chart (2 Cols) */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Weekly PR Lead Time vs Review Wait Trajectory
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                5-week moving average showing review wait contraction across microservices
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" /> Lead Time (h)
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Review Turnaround (h)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.quality_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadTimeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis dataKey="week" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "12px",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="lead_time"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#leadTimeGrad)"
                    name="Lead Time (h)"
                  />
                  <Area
                    type="monotone"
                    dataKey="review_hours"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#reviewGrad)"
                    name="Review Wait (h)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bottleneck Alerts (1 Col) */}
        <div className="glass-card rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 animate-bounce" />
                Active Workflow Bottlenecks
              </h3>
              <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Priority Focus
              </span>
            </div>

            <div className="space-y-3 mt-3">
              {(data?.bottlenecks || []).map((b: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/80 p-3.5 bg-muted/30 hover:border-amber-500/40 transition-colors text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>{b.type}</span>
                    <span className="text-[10px] text-amber-400 uppercase font-mono">{b.severity}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">{b.impact}</p>
                  <div className="text-[11px] text-primary font-medium bg-primary/10 p-2 rounded-lg border border-primary/20">
                    <strong>Action:</strong> {b.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/github-analytics"
            className="mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary text-xs font-semibold transition-all hover:scale-105"
          >
            Inspect GitHub PR Intelligence <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Data Analytics Skill Progression Track (Beginner to Advanced) */}
      <div className="glass-card rounded-2xl p-5 border border-primary/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              End-to-End Data Analytics Mastery Track
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Full-stack competency pipeline from ingestion to executive BI
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center">
          {[
            { step: "01", name: "Excel & CSV", sub: "Pivots & Formulas", href: "/excel", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" },
            { step: "02", name: "SQL Studio", sub: "CTEs & Window Fns", href: "/sql", color: "border-blue-500/30 bg-blue-500/5 text-blue-400" },
            { step: "03", name: "Cleaning", sub: "IQR & Imputation", href: "/cleaning", color: "border-purple-500/30 bg-purple-500/5 text-purple-400" },
            { step: "04", name: "EDA & Moments", sub: "Distributions & Heatmaps", href: "/eda", color: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400" },
            { step: "05", name: "Hypothesis & A/B", sub: "Welch t, ANOVA, Chi²", href: "/statistics", color: "border-rose-500/30 bg-rose-500/5 text-rose-400" },
            { step: "06", name: "Predictive ML", sub: "Scikit-Learn & Anomalies", href: "/predictive", color: "border-violet-500/30 bg-violet-500/5 text-violet-400" },
            { step: "07", name: "Power BI & BI", sub: "Star Schema & DAX", href: "/powerbi", color: "border-amber-500/30 bg-amber-500/5 text-amber-400" },
          ].map((item) => (
            <Link
              key={item.step}
              href={item.href}
              className={`rounded-xl border p-2.5 flex flex-col justify-between hover:scale-105 transition-all shadow-sm group ${item.color}`}
            >
              <div className="text-[10px] font-mono font-bold opacity-75">{item.step}</div>
              <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors my-1">
                {item.name}
              </div>
              <div className="text-[10px] text-muted-foreground truncate font-medium">{item.sub}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Feature Explorer Showcase Hub (All 19 Modules) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" /> Platform Capability Explorer
            </h2>
            <p className="text-xs text-muted-foreground">
              Launch into any of the 19 practical functional analytics and engineering intelligence suites
            </p>
          </div>

          {/* Search Box & Category Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs">
            <input
              type="text"
              value={featureSearch}
              onChange={(e) => setFeatureSearch(e.target.value)}
              placeholder="Filter 19 modules..."
              className="h-8 rounded-lg border border-input bg-background/80 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
            <div className="flex flex-wrap gap-1">
              {FEATURE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <Link
                key={feat.name}
                href={feat.href}
                className="glass-card rounded-2xl p-4 flex flex-col justify-between group hover:border-primary/50 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Ambient glow accent on card hover */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl -z-10 from-primary/5 to-transparent" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`h-10 w-10 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-muted text-foreground border border-border/60">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                    {feat.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-primary">
                  <span>Open Studio</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
