"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  ShieldCheck,
  Database,
  GitCommit,
  Rocket,
  Info,
  X,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from "lucide-react";

interface SyntheticDisclosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetName?: string;
}

export function SyntheticDisclosureModal({
  isOpen,
  onClose,
  datasetName,
}: SyntheticDisclosureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Synthetic Data Provenance &amp; Ethical Disclosure
              </h2>
              <p className="text-xs text-muted-foreground">
                Commitment to Analytical Integrity, Transparent Provenance, and Responsible DORA Measurement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Core Principles */}
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
              <Info className="h-4 w-4" />
              <span>Analytical Integrity Policy</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To respect developer privacy and enterprise IP security while providing a complete,
              zero-configuration analytical demonstration, DevPulse includes seeded <strong>synthetic demonstration datasets</strong>.
              These datasets follow genuine empirical probability distributions (log-normal PR lead times, Poisson incident arrivals, and Pareto defect distributions) observed in modern high-velocity software engineering organizations.
            </p>
          </div>

          {/* DORA & Productivity Ethics Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span>Strict Rule: Commit Counts &ne; Individual Productivity</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              DevPulse strictly rejects vanity metrics. Individual commit counts and lines of code (LOC)
              are <strong>never</strong> aggregated into individual developer productivity scores. Such metrics induce perverse incentives (Goodhart&apos;s Law) and degrade software quality.
              Instead, DevPulse focuses on team-level flow efficiency, code review turnaround velocity, defect escape rates, and audit-grade DORA metrics.
            </p>
          </div>
        </div>

        {/* Provenance of Seeded Datasets */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Seeded Demonstration Datasets Inventory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-border p-3 space-y-1 bg-muted/20">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-primary" /> Engineering Productivity
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono">Synthetic</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                600 simulated pull requests containing review turnaround hours, lines added/deleted, CI run duration, and merge outcomes.
              </p>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-1 bg-muted/20">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Rocket className="h-3.5 w-3.5 text-emerald-500" /> CI/CD Deployments (DORA)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono">DORA Backed</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Deployment events log with explicit environment targets, failure flags, and incident restoration durations for authentic DORA calculations.
              </p>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-1 bg-muted/20">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" /> Software Defects
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono">Synthetic</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Component vulnerability data across Auth, API, Gateway, UI, and Database with MTTR hours and escape defect tracking.
              </p>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-1 bg-muted/20">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-blue-500" /> Enterprise Sales &amp; Operations
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono">Demo BI</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Cross-department business analytics dataset designed for testing Excel pivots, SQL CTEs, and predictive forecasting.
              </p>
            </div>
          </div>
        </div>

        {/* How to Connect Live Authentic Data */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Connecting Authentic Production Data
            </h4>
            <a
              href="/settings"
              onClick={onClose}
              className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
            >
              Configure in Settings &rarr;
            </a>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            You can replace synthetic demonstration data at any time by:
            (1) Uploading your team&apos;s CSV, Excel, or JSON export via the <strong>Data Upload Center</strong>,
            (2) Configuring your <strong>GitHub Personal Access Token (PAT)</strong> in Settings to stream authentic pull request and workflow telemetry,
            or (3) Pointing the backend to an enterprise <strong>PostgreSQL</strong> instance.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-sm"
          >
            Understood &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
