"use client";

import React, { useState } from "react";
import { Activity, ShieldCheck, Database, Cpu, Server, Wifi } from "lucide-react";

interface RadarBlip {
  id: string;
  name: string;
  category: string;
  status: string;
  latency: string;
  xPct: number; // percentage from left
  yPct: number; // percentage from top
  color: string;
  pingColor: string;
}

const RADAR_BLIPS: RadarBlip[] = [
  {
    id: "duckdb",
    name: "DuckDB OLAP",
    category: "In-Memory Engine",
    status: "400 Rows Preloaded",
    latency: "<1ms",
    xPct: 68,
    yPct: 28,
    color: "bg-cyan-400",
    pingColor: "bg-cyan-500",
  },
  {
    id: "fastapi",
    name: "FastAPI Core :8000",
    category: "REST Microservice",
    status: "19 Endpoints Ready",
    latency: "3.8ms",
    xPct: 76,
    yPct: 65,
    color: "bg-emerald-400",
    pingColor: "bg-emerald-500",
  },
  {
    id: "nextjs",
    name: "Next.js 14 Webpack",
    category: "SSR & Static Client",
    status: "Hydrated (0 Errors)",
    latency: "12ms",
    xPct: 26,
    yPct: 72,
    color: "bg-blue-400",
    pingColor: "bg-blue-500",
  },
  {
    id: "postgres",
    name: "SQLite / Postgres",
    category: "Relational Persistence",
    status: "WAL In-Sync",
    latency: "1.2ms",
    xPct: 24,
    yPct: 32,
    color: "bg-indigo-400",
    pingColor: "bg-indigo-500",
  },
];

interface RadarSweepProps {
  score?: number;
  tier?: string;
}

export function RadarSweep({ score = 84.2, tier = "High Performer" }: RadarSweepProps) {
  const [activeBlip, setActiveBlip] = useState<RadarBlip | null>(RADAR_BLIPS[0]);

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 border border-primary/20 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-cyan-500/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <h3 className="text-sm font-extrabold text-foreground tracking-tight uppercase">
            Live Telemetry Radar
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
          360° SWEEP ACTIVE
        </span>
      </div>

      {/* Main Radar Screen */}
      <div className="relative aspect-square max-w-[280px] sm:max-w-[320px] mx-auto my-2 w-full flex items-center justify-center">
        {/* Concentric Technical Rings */}
        <div className="absolute inset-0 rounded-full border border-primary/20" />
        <div className="absolute inset-[15%] rounded-full border border-primary/25 border-dashed" />
        <div className="absolute inset-[32%] rounded-full border border-primary/30" />
        <div className="absolute inset-[50%] rounded-full border border-primary/20 border-dotted" />

        {/* Crosshair Axes */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-primary/20" />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-primary/20" />

        {/* Diagonal Axis Guides */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-primary/10 rotate-45" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-primary/10 -rotate-45" />

        {/* Rotating 360-degree Radar Sweep Beam */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div
            className="w-1/2 h-1/2 absolute top-0 left-1/2 origin-bottom-left animate-radar-sweep pointer-events-none"
            style={{
              background:
                "conic-gradient(from 180deg at 0% 100%, rgba(6, 182, 212, 0.45) 0deg, rgba(6, 182, 212, 0.15) 35deg, transparent 65deg)",
            }}
          />
        </div>

        {/* Pulsating Center Orb: Composite Score */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center p-3 rounded-full bg-card/90 border border-primary/40 shadow-xl backdrop-blur-md w-24 h-24 sm:w-28 sm:h-28">
          <div className="absolute -inset-1 rounded-full border border-cyan-400/30 animate-pulse-ring pointer-events-none" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            DORA Index
          </span>
          <span className="text-xl sm:text-2xl font-black text-foreground font-mono tracking-tight text-primary">
            {score}
          </span>
          <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-tight">
            {tier}
          </span>
        </div>

        {/* Telemetry Blips on the Radar Screen */}
        {RADAR_BLIPS.map((blip) => {
          const isSelected = activeBlip?.id === blip.id;
          return (
            <button
              key={blip.id}
              onClick={() => setActiveBlip(blip)}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group/blip focus:outline-none"
              style={{ left: `${blip.xPct}%`, top: `${blip.yPct}%` }}
              title={`${blip.name}: ${blip.status}`}
            >
              <span className="relative flex h-4 w-4 items-center justify-center">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${blip.pingColor}`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${blip.color} border border-white/60 shadow-md transition-transform group-hover/blip:scale-150`}
                />
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Blip Telemetry Details Card */}
      {activeBlip && (
        <div className="relative z-10 mt-3 pt-3 border-t border-border/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${activeBlip.color} animate-pulse`} />
            <div>
              <span className="font-bold text-foreground block">{activeBlip.name}</span>
              <span className="text-[10px] text-muted-foreground">{activeBlip.status}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold text-cyan-400 block">{activeBlip.latency}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Latency
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
