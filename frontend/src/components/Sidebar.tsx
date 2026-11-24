"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  Table2,
  Wand2,
  FileSpreadsheet,
  Database,
  Terminal,
  Compass,
  Sigma,
  BarChart3,
  GitPullRequest,
  ShieldCheck,
  TrendingUp,
  Brain,
  Workflow,
  CheckCircle2,
  Layers,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    title: "Executive & Core",
    items: [
      { name: "Overview Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    title: "Data Analytics Studio",
    items: [
      { name: "Data Upload Center", href: "/upload", icon: UploadCloud },
      { name: "Data Explorer", href: "/explorer", icon: Table2 },
      { name: "Data Cleaning Studio", href: "/cleaning", icon: Wand2 },
      { name: "Excel Analytics", href: "/excel", icon: FileSpreadsheet },
      { name: "SQL Studio", href: "/sql", icon: Database },
      { name: "Python Analytics", href: "/python", icon: Terminal },
      { name: "EDA Workspace", href: "/eda", icon: Compass },
      { name: "Statistics Lab", href: "/statistics", icon: Sigma },
      { name: "Visualization Studio", href: "/visualizations", icon: BarChart3 },
    ],
  },
  {
    title: "Engineering Intelligence",
    items: [
      { name: "GitHub Analytics", href: "/github-analytics", icon: GitPullRequest },
      { name: "Software Quality", href: "/software-quality", icon: ShieldCheck },
      { name: "Business Insights", href: "/business-insights", icon: TrendingUp },
      { name: "Predictive Analytics", href: "/predictive", icon: Brain },
    ],
  },
  {
    title: "Engineering & BI Ops",
    items: [
      { name: "ETL Pipelines", href: "/etl", icon: Workflow },
      { name: "Data Quality Center", href: "/quality", icon: CheckCircle2 },
      { name: "Power BI Integration", href: "/powerbi", icon: Layers },
      { name: "Report Center", href: "/reports", icon: FileText },
      { name: "Settings & API", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border bg-card transition-all duration-300 h-screen select-none",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-foreground">DEVPULSE</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Intelligence</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            <Activity className="h-5 w-5" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <p className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Status */}
      {!collapsed && (
        <div className="border-t border-border p-3 text-[11px] text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-medium text-foreground">API v1 Connected</span>
          </div>
          <span className="text-[10px] font-mono">v1.0.0</span>
        </div>
      )}
    </aside>
  );
}
