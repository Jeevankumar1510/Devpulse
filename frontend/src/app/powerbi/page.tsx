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

export default function PowerBIPage() {
  const [model, setModel] = useState<any>(null);
  const [daxMeasures, setDaxMeasures] = useState<any[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    async function loadPowerBI() {
      try {
        const [schema, measures] = await Promise.all([
          api.getStarSchema(),
          api.getDaxMeasures(),
        ]);
        setModel(schema);
        setDaxMeasures(measures);
      } catch (err) {
        console.error(err);
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
                  <span className="text-[10px] text-primary">PK: {ft.primary_key}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{ft.description}</p>
                <div className="pt-2 border-t border-primary/10 text-[11px]">
                  <span className="text-muted-foreground">Measures: </span>
                  <strong className="text-foreground font-mono">{ft.measures.join(", ")}</strong>
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
                  <span className="text-foreground font-mono">{dt.columns.join(", ")}</span>
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
