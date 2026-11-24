"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeContext";
import { useDataset } from "./DatasetContext";
import {
  Sun,
  Moon,
  Database,
  UploadCloud,
  Search,
  AlertCircle,
  RefreshCw,
  Info,
  ServerOff,
  Activity,
} from "lucide-react";

export function Header() {
  const { theme, toggleTheme, mounted } = useTheme();
  const { datasets, selectedDatasetId, setSelectedDatasetId, selectedDataset, refreshDatasets, isLoading, isBackendConnected } = useDataset();
  const [showDisclosure, setShowDisclosure] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/80 bg-card/80 backdrop-blur-md px-4 gap-4 sticky top-0 z-30 transition-colors">
      {/* Left: Active Dataset Selector & Live Telemetry Pill */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Database className="h-4 w-4 text-primary animate-pulse" />
          <span className="font-semibold text-foreground hidden sm:inline">Active Dataset:</span>
        </div>
        <select
          value={selectedDatasetId}
          onChange={(e) => setSelectedDatasetId(e.target.value)}
          className="h-8 rounded-lg border border-input bg-background/90 px-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[200px] sm:max-w-[280px] truncate shadow-sm transition-all"
        >
          {datasets.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.row_count} rows)
            </option>
          ))}
        </select>

        <button
          onClick={() => refreshDatasets()}
          disabled={isLoading}
          title="Refresh dataset inventory"
          className="h-8 w-8 rounded-lg border border-input bg-background/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>

        {/* Backend Connection Indicator */}
        {isBackendConnected ? (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>API Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold">
            <ServerOff className="h-3 w-3" />
            <span className="hidden sm:inline">Offline (Start backend on :8000)</span>
          </div>
        )}

        {/* Synthetic origin transparency disclosure tag */}
        {selectedDataset?.is_synthetic && (
          <div className="relative">
            <button
              onClick={() => setShowDisclosure(!showDisclosure)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25 text-[10px] font-bold hover:bg-amber-500/20 transition-all shadow-sm"
              title="Click to view synthetic disclosure"
            >
              <AlertCircle className="h-3 w-3 animate-bounce" />
              <span>Synthetic Disclosed</span>
            </button>
            {showDisclosure && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl border border-border/80 bg-card/95 backdrop-blur-md p-3.5 shadow-2xl z-50 text-xs animate-fade-in">
                <div className="flex items-center gap-1.5 font-bold text-amber-500 mb-1">
                  <Info className="h-4 w-4" />
                  <span>Synthetic Data Disclosure</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {selectedDataset.synthetic_disclosure ||
                    "This dataset was algorithmically generated using realistic statistical distributions. Analytical findings reflect simulated engineering scenarios."}
                </p>
                <button
                  onClick={() => setShowDisclosure(false)}
                  className="mt-2 text-[10px] text-primary hover:underline font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions, Global Search, Theme Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-60">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search metrics, SQL, KPIs..."
            className="h-8 w-full rounded-lg border border-input bg-background/80 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
          />
        </div>

        {/* Quick Upload Action */}
        <Link
          href="/upload"
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all shadow-sm hover:scale-105 active:scale-95"
        >
          <UploadCloud className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Upload</span>
        </Link>

        {/* Theme Toggle (Client mounted safe) */}
        <button
          onClick={toggleTheme}
          title={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle Theme"}
          className="h-8 w-8 rounded-lg border border-input bg-background/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-90"
        >
          {!mounted ? (
            <div className="h-4 w-4" />
          ) : theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 hover:rotate-90 duration-300" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 transition-transform -rotate-12 hover:rotate-0 duration-300" />
          )}
        </button>
      </div>
    </header>
  );
}
