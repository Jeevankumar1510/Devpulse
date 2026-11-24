"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { useDataset } from "@/components/DatasetContext";
import {
  Sigma,
  Scale,
  Calculator,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  TrendingUp,
} from "lucide-react";

export default function StatisticsLabPage() {
  const { selectedDatasetId, selectedDataset } = useDataset();
  const [activeTab, setActiveTab] = useState<"hypothesis" | "ab_test">("hypothesis");

  // Hypothesis test state
  const [testType, setTestType] = useState("two_sample_ttest");
  const [colA, setColA] = useState("");
  const [colB, setColB] = useState("");
  const [groupCol, setGroupCol] = useState("");
  const [alpha, setAlpha] = useState(0.05);
  const [hypoResult, setHypoResult] = useState<any>(null);
  const [loadingHypo, setLoadingHypo] = useState(false);

  // A/B test state
  const [ctrlVisitors, setCtrlVisitors] = useState(10000);
  const [ctrlConv, setCtrlConv] = useState(520);
  const [varVisitors, setVarVisitors] = useState(10000);
  const [varConv, setVarConv] = useState(645);
  const [confLevel, setConfLevel] = useState(0.95);
  const [abResult, setAbResult] = useState<any>(null);
  const [loadingAb, setLoadingAb] = useState(false);

  const columns = selectedDataset?.columns_metadata?.map((c: any) => c.name) || [];

  const handleRunHypo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDatasetId || !colA) return;
    setLoadingHypo(true);
    try {
      const res = await api.runHypothesisTest({
        dataset_id: selectedDatasetId,
        test_type: testType,
        col_a: colA,
        col_b: colB || undefined,
        group_col: groupCol || undefined,
        alpha: Number(alpha),
      });
      setHypoResult(res);
    } catch (err: any) {
      alert(err.message || "Hypothesis test execution failed");
    } finally {
      setLoadingHypo(false);
    }
  };

  const handleRunAB = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAb(true);
    try {
      const res = await api.calculateABTest({
        control_visitors: Number(ctrlVisitors),
        control_conversions: Number(ctrlConv),
        variant_visitors: Number(varVisitors),
        variant_conversions: Number(varConv),
        confidence_level: Number(confLevel),
      });
      setAbResult(res);
    } catch (err: any) {
      alert(err.message || "A/B test calculation failed");
    } finally {
      setLoadingAb(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sigma className="h-5 w-5 text-primary" />
            Statistics &amp; Experimentation Lab
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Parametric &amp; non-parametric hypothesis testing, ANOVA, Chi-Square, and A/B experimentation calculators.
          </p>
        </div>

        <div className="flex rounded-lg border border-border p-0.5 bg-muted/40 text-xs">
          <button
            onClick={() => setActiveTab("hypothesis")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === "hypothesis" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Hypothesis Testing
          </button>
          <button
            onClick={() => {
              setActiveTab("ab_test");
              if (!abResult) handleRunAB({ preventDefault: () => {} } as any);
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === "ab_test" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            A/B Testing Calculator
          </button>
        </div>
      </div>

      {activeTab === "hypothesis" ? (
        /* Hypothesis Testing Suite */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Setup (1 Col) */}
          <form onSubmit={handleRunHypo} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-primary" /> Test Specification
            </h2>

            <div>
              <label className="text-[11px] font-medium text-foreground block mb-1">Statistical Test</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
              >
                <option value="two_sample_ttest">Welch's Two-Sample t-Test (Independent)</option>
                <option value="paired_ttest">Paired Samples t-Test (Repeated Measures)</option>
                <option value="anova">One-Way ANOVA (3+ Groups)</option>
                <option value="chi_square">Pearson Chi-Square Test (Independence)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-foreground block mb-1">
                {testType === "chi_square" ? "Categorical Feature 1" : "Continuous Metric (Col A)"}
              </label>
              <select
                value={colA}
                onChange={(e) => setColA(e.target.value)}
                className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
              >
                <option value="">Select primary column...</option>
                {columns.map((c: string) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {testType !== "anova" && (
              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1">
                  {testType === "chi_square" ? "Categorical Feature 2" : "Comparison Metric (Col B, if no grouping)"}
                </label>
                <select
                  value={colB}
                  onChange={(e) => setColB(e.target.value)}
                  className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
                >
                  <option value="">(None / Using Group Column)</option>
                  {columns.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {(testType === "two_sample_ttest" || testType === "anova") && (
              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1">
                  Categorical Factor (Group Column)
                </label>
                <select
                  value={groupCol}
                  onChange={(e) => setGroupCol(e.target.value)}
                  className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
                >
                  <option value="">Select grouping factor...</option>
                  {columns.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-foreground block mb-1">
                Significance Threshold (α)
              </label>
              <select
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
              >
                <option value={0.01}>α = 0.01 (99% Confidence)</option>
                <option value={0.05}>α = 0.05 (95% Confidence - Industry Standard)</option>
                <option value={0.10}>α = 0.10 (90% Confidence)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loadingHypo || !colA}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loadingHypo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
              Compute Test Statistics
            </button>
          </form>

          {/* Result Card (2 Cols) */}
          <div className="lg:col-span-2">
            {hypoResult ? (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{hypoResult.test_name}</h3>
                    <span className="text-[11px] text-muted-foreground">Significance Level α = {hypoResult.alpha}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      hypoResult.reject_null_hypothesis
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {hypoResult.reject_null_hypothesis ? "H₀ Rejected (Significant)" : "Fail to Reject H₀"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">{hypoResult.statistic_name}</span>
                    <div className="text-xl font-bold font-mono text-foreground mt-1">{hypoResult.statistic_value}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">p-Value</span>
                    <div className="text-xl font-bold font-mono text-primary mt-1">{hypoResult.p_value}</div>
                  </div>
                  {hypoResult.degrees_of_freedom !== null && (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground">Degrees of Freedom</span>
                      <div className="text-xl font-bold font-mono text-foreground mt-1">{hypoResult.degrees_of_freedom}</div>
                    </div>
                  )}
                </div>

                {hypoResult.confidence_interval && (
                  <div className="text-xs p-3 rounded-lg bg-muted/30 border border-border">
                    <span className="font-semibold text-foreground">95% Confidence Interval for Difference: </span>
                    <span className="font-mono text-primary font-bold">
                      [{hypoResult.confidence_interval[0]}, {hypoResult.confidence_interval[1]}]
                    </span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs space-y-1">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-primary" /> Analytical Interpretation:
                  </div>
                  <p className="text-muted-foreground leading-relaxed pl-5">{hypoResult.interpretation}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <Sigma className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-xs font-medium">Select parameters on the left and run test to view statistical outputs.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* A/B Testing Calculator */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleRunAB} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground">Experiment Cohort Inputs</h2>

            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-3">
              <span className="text-xs font-bold text-foreground block">Control Cohort (A)</span>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-0.5">Visitors / Samples (N₁)</label>
                <input
                  type="number"
                  value={ctrlVisitors}
                  onChange={(e) => setCtrlVisitors(Number(e.target.value))}
                  className="w-full h-8 rounded border border-input bg-background px-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-0.5">Conversions (C₁)</label>
                <input
                  type="number"
                  value={ctrlConv}
                  onChange={(e) => setCtrlConv(Number(e.target.value))}
                  className="w-full h-8 rounded border border-input bg-background px-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-3">
              <span className="text-xs font-bold text-foreground block">Variant Cohort (B)</span>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-0.5">Visitors / Samples (N₂)</label>
                <input
                  type="number"
                  value={varVisitors}
                  onChange={(e) => setVarVisitors(Number(e.target.value))}
                  className="w-full h-8 rounded border border-input bg-background px-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-0.5">Conversions (C₂)</label>
                <input
                  type="number"
                  value={varConv}
                  onChange={(e) => setVarConv(Number(e.target.value))}
                  className="w-full h-8 rounded border border-input bg-background px-2 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-foreground block mb-1">Confidence Level</label>
              <select
                value={confLevel}
                onChange={(e) => setConfLevel(Number(e.target.value))}
                className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
              >
                <option value={0.90}>90% Confidence (Z = 1.645)</option>
                <option value={0.95}>95% Confidence (Z = 1.960)</option>
                <option value={0.99}>99% Confidence (Z = 2.576)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loadingAb}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              {loadingAb ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
              Evaluate Experiment
            </button>
          </form>

          {/* A/B Test Results (2 Cols) */}
          <div className="lg:col-span-2">
            {abResult ? (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Two-Proportion Z-Test Evaluation</h3>
                    <span className="text-[11px] text-muted-foreground">Confidence Level: {int(confLevel * 100)}%</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      abResult.is_statistically_significant
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}
                  >
                    {abResult.is_statistically_significant ? "Statistically Significant" : "Inconclusive"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Control CR</span>
                    <div className="text-lg font-bold font-mono text-foreground mt-1">{abResult.control_cr}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Variant CR</span>
                    <div className="text-lg font-bold font-mono text-foreground mt-1">{abResult.variant_cr}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Relative Uplift</span>
                    <div className={`text-lg font-bold font-mono mt-1 ${abResult.relative_uplift_pct >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {abResult.relative_uplift_pct >= 0 ? `+${abResult.relative_uplift_pct}%` : `${abResult.relative_uplift_pct}%`}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">p-Value</span>
                    <div className="text-lg font-bold font-mono text-primary mt-1">{abResult.p_value}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <span className="text-muted-foreground block text-[10px] uppercase">Confidence Interval (Diff)</span>
                    <span className="font-mono font-bold text-foreground mt-1 block">
                      [{abResult.confidence_interval[0]}%, {abResult.confidence_interval[1]}%]
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <span className="text-muted-foreground block text-[10px] uppercase">Recommended Sample Size</span>
                    <span className="font-mono font-bold text-foreground mt-1 block">
                      ~{abResult.sample_size_recommendation?.toLocaleString()} visitors / branch
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs space-y-1">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-primary" /> Decision Recommendation:
                  </div>
                  <p className="text-muted-foreground leading-relaxed pl-5">{abResult.business_recommendation}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function int(val: number) {
  return Math.round(val);
}
