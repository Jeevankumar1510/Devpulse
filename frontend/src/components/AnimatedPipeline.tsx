"use client";

import React, { useState } from "react";
import {
  GitPullRequest,
  CheckCircle2,
  ShieldCheck,
  Rocket,
  ArrowRight,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";

interface PipelineStage {
  id: string;
  name: string;
  subtitle: string;
  icon: any;
  status: "ACTIVE" | "VERIFIED" | "GUARDED" | "DEPLOYED";
  metric: string;
  metricLabel: string;
  badge: string;
  color: string;
  borderColor: string;
  glowColor: string;
  details: {
    telemetry: string;
    throughput: string;
    health: string;
    benchmark: string;
  };
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "commit",
    name: "PR & Commit Stream",
    subtitle: "Git Intake & Code Review",
    icon: GitPullRequest,
    status: "ACTIVE",
    metric: "14.2h",
    metricLabel: "Avg Review Turnaround",
    badge: "Continuous",
    color: "from-blue-500/20 via-cyan-500/10 to-transparent text-cyan-400",
    borderColor: "border-cyan-500/40",
    glowColor: "rgba(6, 182, 212, 0.3)",
    details: {
      telemetry: "400 Engineering PR events indexed in memory",
      throughput: "1.25 pull requests merged per engineer/day",
      health: "94.2% code review participation rate",
      benchmark: "Top 15% DORA Elite quartile for review responsiveness",
    },
  },
  {
    id: "ci_test",
    name: "Automated CI/CD Test",
    subtitle: "Pytest & Regression Suite",
    icon: Zap,
    status: "VERIFIED",
    metric: "14 / 14",
    metricLabel: "Suites Passing (100%)",
    badge: "3.9s Runtime",
    color: "from-indigo-500/20 via-purple-500/10 to-transparent text-indigo-400",
    borderColor: "border-indigo-500/40",
    glowColor: "rgba(99, 102, 241, 0.3)",
    details: {
      telemetry: "Full analytical test coverage across DuckDB and SQLite",
      throughput: "Zero transient runner timeouts reported",
      health: "100% test execution pass rate with 0 warnings",
      benchmark: "Meets Tier-1 enterprise continuous delivery standard",
    },
  },
  {
    id: "quality_gate",
    name: "Defect & Security Gate",
    subtitle: "Static Analysis & Escape Audit",
    icon: ShieldCheck,
    status: "GUARDED",
    metric: "4.1%",
    metricLabel: "Defect Escape Rate",
    badge: "A-Rating",
    color: "from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-400",
    borderColor: "border-emerald-500/40",
    glowColor: "rgba(16, 185, 129, 0.3)",
    details: {
      telemetry: "Zero critical CVE vulnerabilities or unhandled exceptions",
      throughput: "1.8 defects per KLOC maintained across master branch",
      health: "Pre-deployment automated smoke checks passed",
      benchmark: "Change Failure Rate kept strictly below 8.0%",
    },
  },
  {
    id: "deploy",
    name: "Production Release",
    subtitle: "Zero-Downtime Rollout",
    icon: Rocket,
    status: "DEPLOYED",
    metric: "18.5h",
    metricLabel: "Lead Time for Changes",
    badge: "99.98% Live",
    color: "from-purple-500/20 via-pink-500/10 to-transparent text-purple-400",
    borderColor: "border-purple-500/40",
    glowColor: "rgba(168, 85, 247, 0.3)",
    details: {
      telemetry: "Active cluster synchronized with live telemetry broadcast",
      throughput: "1.25 production deployments completed daily",
      health: "Time to restore service averages 2.8 hours",
      benchmark: "DORA High Performer benchmark classification verified",
    },
  },
];

export function AnimatedPipeline() {
  const [selectedStage, setSelectedStage] = useState<PipelineStage>(PIPELINE_STAGES[0]);

  return (
    <div className="rounded-3xl border border-primary/25 bg-card/90 backdrop-blur-xl p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-all">
      {/* Background Animated Ambient Mesh */}
      <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Header with live moving pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
            </span>
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-foreground flex items-center gap-2">
              Autonomous Delivery Pipeline Telemetry
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              Live Animated Stream
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time DORA progression from GitHub commit intake through automated regression testing to live production.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-background/80 border border-border shadow-sm">
            <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
            Stream Velocity: <span className="text-foreground font-mono font-bold">1.25 deploys/day</span>
          </span>
        </div>
      </div>

      {/* Interactive Moving Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10 mb-6">
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = selectedStage.id === stage.id;

          return (
            <div key={stage.id} className="relative group">
              {/* Connector line between stages on desktop */}
              {idx < PIPELINE_STAGES.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-4 z-20 pointer-events-none">
                  <svg className="w-full h-4 overflow-visible" viewBox="0 0 16 16">
                    <line
                      x1="0"
                      y1="8"
                      x2="16"
                      y2="8"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      className="animate-flow-line opacity-80"
                    />
                    <circle cx="8" cy="8" r="3" fill="#38bdf8" className="animate-ping opacity-75" />
                  </svg>
                </div>
              )}

              {/* Stage Card */}
              <button
                onClick={() => setSelectedStage(stage)}
                className={`w-full text-left rounded-2xl p-4 sm:p-5 border transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between ${
                  isSelected
                    ? `${stage.borderColor} bg-gradient-to-b ${stage.color} shadow-lg scale-[1.02]`
                    : "border-border/80 bg-background/60 hover:border-primary/40 hover:bg-background/90"
                }`}
                style={isSelected ? { boxShadow: `0 8px 30px -4px ${stage.glowColor}` } : {}}
              >
                {/* Moving Shimmer Beam on Selected Card */}
                {isSelected && (
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-shimmer" />
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-all ${
                        isSelected
                          ? "bg-card border-primary/50 text-foreground shadow-md"
                          : "bg-muted/60 border-border text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${isSelected ? "animate-pulse" : ""}`} />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        isSelected
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {stage.badge}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-foreground tracking-tight leading-snug">
                    {stage.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{stage.subtitle}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-baseline justify-between">
                  <span className="text-lg sm:text-xl font-extrabold text-foreground font-mono tracking-tight">
                    {stage.metric}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium text-right">
                    {stage.metricLabel}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Active Stage Detailed Telemetry Inspector */}
      <div className="relative z-10 rounded-2xl border border-border/80 bg-background/70 backdrop-blur-md p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0 mt-0.5">
              <selectedStage.icon className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Stage Inspection:
                </span>
                <span className="text-xs font-extrabold text-primary">{selectedStage.name}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedStage.details.telemetry}</p>
            </div>
          </div>

          {/* Micro-metrics pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="px-3 py-2 rounded-xl bg-card border border-border">
              <span className="text-[10px] text-muted-foreground block font-medium">Throughput</span>
              <span className="text-xs font-bold text-foreground font-mono">
                {selectedStage.details.throughput}
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-card border border-border">
              <span className="text-[10px] text-muted-foreground block font-medium">Quality Health</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {selectedStage.details.health}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 px-3 py-2 rounded-xl bg-card border border-border">
              <span className="text-[10px] text-muted-foreground block font-medium">DORA Benchmark</span>
              <span className="text-xs font-bold text-cyan-400 font-mono">
                {selectedStage.details.benchmark}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
