"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { datasets, selectedDatasetId, setSelectedDatasetId, selectedDataset, refreshDatasets, isLoading } = useDataset();
  const [showDisclosure, setShowDisclosure] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 gap-4 sticky top-0 z-30">
      {/* Left: Active Dataset Selector */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Database className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground hidden sm:inline">Active Dataset:</span>
        </div>
        <select
          value={selectedDatasetId}
          onChange={(e) => setSelectedDatasetId(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[200px] sm:max-w-[280px] truncate"
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
          className="h-8 w-8 rounded-md border border-input bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>

        {/* Synthetic origin transparency disclosure tag */}
        {selectedDataset?.is_synthetic && (
          <div className="relative">
            <button
              onClick={() => setShowDisclosure(!showDisclosure)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-medium hover:bg-amber-500/20 transition-colors"
              title="Click to view synthetic disclosure"
            >
              <AlertCircle className="h-3 w-3" />
              <span>Synthetic Disclosed</span>
            </button>
            {showDisclosure && (
              <div className="absolute left-0 mt-2 w-72 rounded-lg border border-border bg-card p-3 shadow-lg z-50 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-amber-500 mb-1">
                  <Info className="h-3.5 w-3.5" />
                  <span>Synthetic Data Disclosure</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {selectedDataset.synthetic_disclosure ||
                    "This dataset was algorithmically generated using realistic statistical distributions. Analytical findings reflect simulated engineering scenarios."}
                </p>
                <button
                  onClick={() => setShowDisclosure(false)}
                  className="mt-2 text-[10px] text-primary hover:underline font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions, Global Search, Theme Switcher */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search metrics, tables..."
            className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Upload Shortcut */}
        <Link
          href="/upload"
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors"
        >
          <UploadCloud className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Upload</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="h-8 w-8 rounded-md border border-input bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
}
