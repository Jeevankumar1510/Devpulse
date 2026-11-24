import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  target?: number | string;
  status?: "HEALTHY" | "WARNING" | "CRITICAL" | string;
  trend?: "UP" | "DOWN" | "NEUTRAL" | string;
  description?: string;
  className?: string;
  progressPct?: number;
}

export function KPICard({
  title,
  value,
  unit = "",
  change,
  target,
  status = "HEALTHY",
  trend = "NEUTRAL",
  description,
  className,
  progressPct,
}: KPICardProps) {
  const statusStyles = {
    HEALTHY: {
      badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      glow: "hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.25)]",
      dot: "bg-emerald-500",
      bar: "bg-emerald-500",
    },
    WARNING: {
      badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      glow: "hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)]",
      dot: "bg-amber-500",
      bar: "bg-amber-500",
    },
    CRITICAL: {
      badge: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      glow: "hover:shadow-[0_0_25px_-5px_rgba(244,63,94,0.25)]",
      dot: "bg-rose-500",
      bar: "bg-rose-500",
    },
  }[status.toUpperCase()] || {
    badge: "text-primary bg-primary/10 border-primary/20",
    glow: "hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.25)]",
    dot: "bg-primary",
    bar: "bg-primary",
  };

  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group cursor-default transition-all duration-300",
        statusStyles.glow,
        className
      )}
    >
      {/* Background ambient lighting */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
        <span
          className={cn(
            "text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1.5 transition-transform group-hover:scale-105",
            statusStyles.badge
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full animate-ping", statusStyles.dot)} />
          {status}
        </span>
      </div>

      {/* Main Metric Value */}
      <div className="my-2.5 flex items-baseline gap-1.5 relative z-10">
        <span className="text-3xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {value}
        </span>
        {unit && <span className="text-xs text-muted-foreground font-semibold">{unit}</span>}
      </div>

      {/* Optional Progress Bar */}
      {progressPct !== undefined && (
        <div className="w-full h-1.5 rounded-full bg-muted/60 overflow-hidden mb-2 relative z-10">
          <div
            className={cn("h-full rounded-full transition-all duration-700 ease-out", statusStyles.bar)}
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40 text-muted-foreground relative z-10">
        {change !== undefined ? (
          <div className="flex items-center gap-1">
            {change > 0 ? (
              <span className="flex items-center text-emerald-400 font-bold gap-0.5">
                <ArrowUpRight className="h-3.5 w-3.5" /> +{change}%
              </span>
            ) : change < 0 ? (
              <span className="flex items-center text-rose-400 font-bold gap-0.5">
                <ArrowDownRight className="h-3.5 w-3.5" /> {change}%
              </span>
            ) : (
              <span className="flex items-center text-muted-foreground font-bold gap-0.5">
                <Minus className="h-3.5 w-3.5" /> 0%
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/80">vs benchmark</span>
          </div>
        ) : (
          <span className="text-[11px] truncate">{description || "Real-time Telemetry"}</span>
        )}

        {target !== undefined && (
          <span className="text-[11px]">
            Target: <strong className="text-foreground font-mono">{target}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
