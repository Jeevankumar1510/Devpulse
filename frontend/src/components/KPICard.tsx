import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, CheckCircle, AlertTriangle, AlertOctagon } from "lucide-react";
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
}: KPICardProps) {
  const statusColors = {
    HEALTHY: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    WARNING: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    CRITICAL: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  }[status.toUpperCase()] || "text-primary bg-primary/10 border-primary/20";

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider", statusColors)}>
          {status}
        </span>
      </div>

      <div className="my-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
        {unit && <span className="text-xs text-muted-foreground font-medium">{unit}</span>}
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50 text-muted-foreground">
        {change !== undefined ? (
          <div className="flex items-center gap-1">
            {change > 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
            ) : change < 0 ? (
              <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
            ) : (
              <Minus className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={cn("font-medium", change > 0 ? "text-emerald-500" : change < 0 ? "text-rose-500" : "")}>
              {change > 0 ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-[10px]">vs prev</span>
          </div>
        ) : (
          <span className="text-[11px] truncate">{description || "Live Metric"}</span>
        )}

        {target !== undefined && (
          <span className="text-[11px]">
            Target: <strong className="text-foreground">{target}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
