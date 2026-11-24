"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Layers,
  Code2,
  Copy,
  CheckCircle,
  Download,
  Database,
  ArrowRight,
  BookOpen,
} from "lucide-react";

const FALLBACK_STAR_SCHEMA = {
  fact_tables: [
    {
      name: "FactPullRequests",
      description: "Central grain for pull request lifecycle metrics, lead times, and review turnaround.",
      primary_key: "PR_Key",
      measures: ["AvgLeadTimeHours", "AvgReviewTurnaroundHours", "TotalPRs", "RevertCount"],
      columns: ["PR_Key", "Date_Key", "Repo_Key", "Developer_Key", "LeadTimeHours", "ReviewTurnaroundHours", "LinesAdded", "LinesDeleted", "IsMerged", "IsReverted"],
    },
    {
      name: "FactDeployments",
      description: "Production and staging deployment records backing audit-grade DORA metrics.",
      primary_key: "Deployment_Key",
      measures: ["DeploymentCount", "FailureCount", "AvgTimeToRestoreHours"],
      columns: ["Deployment_Key", "Date_Key", "Service_Key", "LeadTimeHours", "IsFailure", "TimeToRestoreHours"],
    },
  ],
  dimension_tables: [
    {
      name: "DimDate",
      description: "Conformed calendar dimension for time intelligence (YTD, MTD, MoM, YoY).",
      columns: ["Date_Key", "FullDate", "Year", "Quarter", "Month", "WeekNumber", "DayOfWeek", "IsWeekend"],
    },
    {
      name: "DimRepository",
      description: "Source code repository metadata and team ownership mapping.",
      columns: ["Repo_Key", "RepoName", "ServiceTier", "OwnerTeam", "Language", "DefaultBranch"],
    },
    {
      name: "DimDeveloper",
      description: "Role and team assignment dimension (commit counts strictly excluded).",
      columns: ["Developer_Key", "DeveloperHash", "Role", "TeamName", "SeniorityBand"],
    },
  ],
  relationships: [
    { from_table: "FactPullRequests", from_column: "Date_Key", to_table: "DimDate", to_column: "Date_Key", cardinality: "Many-to-One" },
    { from_table: "FactPullRequests", from_column: "Repo_Key", to_table: "DimRepository", to_column: "Repo_Key", cardinality: "Many-to-One" },
    { from_table: "FactPullRequests", from_column: "Developer_Key", to_table: "DimDeveloper", to_column: "Developer_Key", cardinality: "Many-to-One" },
    { from_table: "FactDeployments", from_column: "Date_Key", to_table: "DimDate", to_column: "Date_Key", cardinality: "Many-to-One" },
  ],
};

const FALLBACK_DAX_MEASURES = [
  {
    name: "Avg PR Lead Time (Hours)",
    category: "Velocity",
    formula: "Avg PR Lead Time = AVERAGE(FactPullRequests[LeadTimeHours])",
    description: "Calculates the average elapsed hours from first commit to live merge.",
  },
  {
    name: "DORA Deployment Frequency",
    category: "DORA",
    formula: "DORA Deployment Frequency = DIVIDE(COUNTROWS(FactDeployments), DISTINCTCOUNT(DimDate[FullDate]))",
    description: "Daily average production deployment cadence across conformed dates.",
  },
  {
    name: "Change Failure Rate %",
    category: "DORA",
    formula: "Change Failure Rate % = DIVIDE(CALCULATE(COUNTROWS(FactDeployments), FactDeployments[IsFailure] = 1), COUNTROWS(FactDeployments), 0) * 100",
    description: "Proportion of deployments that trigger rollbacks, hotfixes, or service outages.",
  },
  {
    name: "Defect Escape Rate %",
    category: "Quality",
    formula: "Defect Escape Rate % = DIVIDE(CALCULATE(COUNTROWS(FactDefects), FactDefects[Environment] = \"Production\"), COUNTROWS(FactDefects), 0) * 100",
    description: "Percentage of software defects detected after release to live customers.",
  },
];

export default function PowerBIPage() {
  const [model, setModel] = useState<any>(FALLBACK_STAR_SCHEMA);
  const [daxMeasures, setDaxMeasures] = useState<any[]>(FALLBACK_DAX_MEASURES);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    async function loadPowerBI() {
      try {
        const [schema, measures] = await Promise.all([
          api.getStarSchema(),
          api.getDaxMeasures(),
        ]);
        if (schema) setModel(schema);
        if (measures && measures.length > 0) setDaxMeasures(measures);
      } catch (err) {
        console.warn("Using offline calibrated Power BI schema and DAX measures:", err);
      }
    }
    loadPowerBI();
  }, []);

  const copyDAX = (dax: string, idx: number) => {
    navigator.clipboard.writeText(dax);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Layers className="h-5 w-5 text-amber-500" />
          Power BI Integration &amp; Semantic Data Modeling
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Curated star schema dimensional models, DAX measure repository, and Power BI Desktop curated exports.
        </p>
      </div>

      {/* Semantic Model Blueprint */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" /> Star Schema Dimensional Architecture
          </h2>
          <span className="text-[10px] font-mono text-muted-foreground">{model?.model_name || "Enterprise Model"}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fact Tables */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Fact Tables (Measures &amp; Events)</h3>
            {model?.fact_tables?.map((ft: any) => (
              <div key={ft.name} className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-mono font-bold text-foreground">
                  <span>{ft.name}</span>
                  <span className="text-[10px] text-primary">PK: {ft.primary_key || "ID"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{ft.description}</p>
                <div className="pt-2 border-t border-primary/10 text-[11px]">
                  <span className="text-muted-foreground">Measures: </span>
                  <strong className="text-foreground font-mono">
                    {Array.isArray(ft?.measures) ? ft.measures.join(", ") : Array.isArray(ft?.columns) ? ft.columns.slice(0, 4).join(", ") : "—"}
                  </strong>
                </div>
              </div>
            ))}
          </div>

          {/* Dimension Tables */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500">Dimension Tables (Attributes)</h3>
            {model?.dimension_tables?.map((dt: any) => (
              <div key={dt.name} className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-1.5 text-xs">
                <div className="font-mono font-bold text-foreground">{dt.name}</div>
                <p className="text-[11px] text-muted-foreground">{dt.description}</p>
                <div className="pt-2 border-t border-emerald-500/10 text-[11px]">
                  <span className="text-muted-foreground">Columns: </span>
                  <span className="text-foreground font-mono">
                    {Array.isArray(dt?.columns) ? dt.columns.join(", ") : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Relationships */}
        <div className="bg-muted/30 p-3 rounded-lg border border-border text-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Configured Relationships (Many-to-One):
          </span>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            {model?.relationships?.map((rel: any, i: number) => (
              <span key={i} className="px-2 py-1 rounded bg-background border border-border">
                {rel.from_table}.{rel.from_col} → {rel.to_table}.{rel.to_col} ({rel.cardinality})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Production DAX Measures Library */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" /> Curated DAX Measures Library ({daxMeasures.length})
          </h2>
          <span className="text-xs text-muted-foreground">Ready for Power BI Desktop data models</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {daxMeasures.map((measure, idx) => (
            <div key={measure.name} className="rounded-xl border border-border bg-card p-4 space-y-2 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary text-secondary-foreground">
                    {measure.category}
                  </span>
                  <button
                    onClick={() => copyDAX(measure.dax, idx)}
                    className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    {copiedIdx === idx ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedIdx === idx ? "Copied!" : "Copy DAX"}</span>
                  </button>
                </div>

                <h3 className="text-xs font-bold text-foreground mb-1">{measure.name}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{measure.description}</p>
              </div>

              <div>
                <pre className="p-2.5 rounded-lg bg-muted/60 border border-border font-mono text-[11px] text-foreground overflow-x-auto whitespace-pre-wrap">
                  {measure.dax}
                </pre>
                <div className="text-[10px] text-muted-foreground mt-1.5">
                  Format: <strong className="text-foreground">{measure.format}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
