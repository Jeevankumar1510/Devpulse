"use client";

import React from "react";
import { ShieldCheck, Cpu, Database, Zap, Activity } from "lucide-react";

interface MicroserviceNode {
  id: string;
  name: string;
  role: string;
  metric: string;
  metricLabel: string;
  status: "HEALTHY" | "OPTIMAL" | "SYNCHRONIZED";
  floatAnimation: string;
  icon: any;
  color: string;
  glow: string;
}

const NODES: MicroserviceNode[] = [
  {
    id: "auth",
    name: "auth-gateway",
    role: "OAuth2 & JWT Sentinel",
    metric: "14ms",
    metricLabel: "p99 Latency",
    status: "HEALTHY",
    floatAnimation: "animate-float-slow",
    icon: ShieldCheck,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    glow: "rgba(16, 185, 129, 0.2)",
  },
  {
    id: "olap",
    name: "duckdb-analytics",
    role: "In-Memory OLAP Studio",
    metric: "0.8ms",
    metricLabel: "Query Speed",
    status: "OPTIMAL",
    floatAnimation: "animate-float-reverse",
    icon: Database,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    glow: "rgba(6, 182, 212, 0.2)",
  },
  {
    id: "ci_pool",
    name: "pytest-runners",
    role: "14 Analytical Suites",
    metric: "100%",
    metricLabel: "Pass Rate",
    status: "SYNCHRONIZED",
    floatAnimation: "animate-float-delayed",
    icon: Zap,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    glow: "rgba(99, 102, 241, 0.2)",
  },
  {
    id: "event_bus",
    name: "telemetry-stream",
    role: "DORA Event Broker",
    metric: "400 evt",
    metricLabel: "Active Memory",
    status: "HEALTHY",
    floatAnimation: "animate-float-slow",
    icon: Activity,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    glow: "rgba(168, 85, 247, 0.2)",
  },
];

export function FloatingNodes() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-4">
      {NODES.map((node) => {
        const Icon = node.icon;
        return (
          <div
            key={node.id}
            className={`glass-card rounded-2xl p-3.5 border ${node.color} shadow-md transition-all duration-300 ${node.floatAnimation} hover:scale-105 hover:z-20 cursor-default`}
            style={{ boxShadow: `0 8px 24px -6px ${node.glow}` }}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-card/80 border border-border flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block tracking-tight font-mono">
                    {node.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">{node.role}</span>
                </div>
              </div>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-2 border-t border-border/50">
              <span className="text-sm font-extrabold text-foreground font-mono">{node.metric}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">{node.metricLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
