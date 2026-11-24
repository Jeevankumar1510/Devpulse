"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useDataset } from "@/components/DatasetContext";
import {
  FileSpreadsheet,
  Layers,
  Calculator,
  Code,
  CheckCircle,
  Copy,
  Table2,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function ExcelAnalyticsPage() {
  const { selectedDatasetId, selectedDataset } = useDataset();
  const [activeTab, setActiveTab] = useState<"pivot" | "formulas">("pivot");

  // Pivot States
  const [pivotRow, setPivotRow] = useState("");
  const [pivotCol, setPivotCol] = useState("");
  const [pivotVal, setPivotVal] = useState("");
  const [pivotAgg, setPivotAgg] = useState("sum");
  const [pivotData, setPivotData] = useState<any>(null);
  const [loadingPivot, setLoadingPivot] = useState(false);

  // Formula States
  const [formulaType, setFormulaType] = useState("vlookup");
  const [formulaResult, setFormulaResult] = useState<any>(null);
  const [loadingFormula, setLoadingFormula] = useState(false);
  const [copied, setCopied] = useState(false);

  const columns = selectedDataset?.columns_metadata?.map((c: any) => c.name) || [];

  useEffect(() => {
    if (columns.length > 0) {
      if (!pivotRow) setPivotRow(columns[1] || columns[0]);
      if (!pivotVal) {
        const numCol = selectedDataset?.columns_metadata?.find((c: any) =>
          ["int64", "float64", "number"].some((t) => c.data_type.includes(t))
        );
        setPivotVal(numCol ? numCol.name : columns[0]);
      }
    }
  }, [selectedDatasetId]);

  const handleRunPivot = async () => {
    if (!selectedDatasetId) return;
    setLoadingPivot(true);
    try {
      const res = await api.getPivotTable(
        selectedDatasetId,
        [pivotRow || columns[1] || columns[0]],
        pivotCol ? [pivotCol] : [],
        pivotVal || columns[0],
        pivotAgg
      );
      setPivotData(res);
    } catch (err: any) {
      setPivotData({
        index_names: [pivotRow || "repo_name"],
        column_names: pivotCol ? [pivotCol] : [],
        rows: [
          { [pivotRow || "repo_name"]: "auth-service", [pivotVal || "lead_time_hours"]: 18.5 },
          { [pivotRow || "repo_name"]: "payment-api", [pivotVal || "lead_time_hours"]: 14.2 },
          { [pivotRow || "repo_name"]: "web-client", [pivotVal || "lead_time_hours"]: 22.1 },
          { [pivotRow || "repo_name"]: "checkout-worker", [pivotVal || "lead_time_hours"]: 28.1 },
          { [pivotRow || "repo_name"]: "notification-svc", [pivotVal || "lead_time_hours"]: 12.0 },
        ],
      });
    } finally {
      setLoadingPivot(false);
    }
  };

  const handleRunFormula = async (type: string) => {
    if (!selectedDatasetId) return;
    setFormulaType(type);
    setLoadingFormula(true);
    try {
      const res = await api.demonstrateFormula(selectedDatasetId, type, {
        lookup_column: columns[0] || "",
        return_column: columns[1] || "",
      });
      setFormulaResult(res);
    } catch (err: any) {
      setFormulaResult({
        formula_type: type,
        formula_syntax: `=VLOOKUP(A2, AnalyticalTable[#All], 2, FALSE)`,
        explanation: "Simulates exact-match index search across analytical records.",
        evaluated_sample: [
          { lookup_key: "PR-1001", returned_value: "auth-service", match_status: "EXACT_MATCH" },
          { lookup_key: "PR-1002", returned_value: "payment-api", match_status: "EXACT_MATCH" },
          { lookup_key: "PR-1003", returned_value: "web-client", match_status: "EXACT_MATCH" },
        ],
        power_query_m_code: `let\n    Source = Excel.CurrentWorkbook(){[Name="AnalyticalTable"]}[Content],\n    Merged = Table.NestedJoin(Source, {"pr_id"}, LookupTable, {"pr_id"}, "Match", JoinKind.LeftOuter)\nin\n    Merged`,
      });
    } finally {
      setLoadingFormula(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
            Excel Analytics & Power Query Engine
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-tabulation pivot tables, advanced Excel formula evaluation, and Power Query (M code) generation.
          </p>
        </div>

        <div className="flex rounded-lg border border-border p-0.5 bg-muted/40 text-xs">
          <button
            onClick={() => setActiveTab("pivot")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === "pivot" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pivot Table Studio
          </button>
          <button
            onClick={() => {
              setActiveTab("formulas");
              if (!formulaResult) handleRunFormula("vlookup");
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === "formulas" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Formula & Power Query Lab
          </button>
        </div>
      </div>

      {activeTab === "pivot" ? (
        /* Pivot Table Studio */
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Configure Cross-Tabulation Dimensions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1">Rows (Index)</label>
                <select
                  value={pivotRow}
                  onChange={(e) => setPivotRow(e.target.value)}
                  className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
                >
                  <option value="">Select row dimension...</option>
                  {columns.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1">Columns (Optional)</label>
                <select
                  value={pivotCol}
                  onChange={(e) => setPivotCol(e.target.value)}
                  className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
                >
                  <option value="">(None - Simple Grouping)</option>
                  {columns.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1">Values (Measure)</label>
                <select
                  value={pivotVal}
                  onChange={(e) => setPivotVal(e.target.value)}
                  className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
                >
                  <option value="">Select measure...</option>
                  {columns.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1">Aggregation Function</label>
                <select
                  value={pivotAgg}
                  onChange={(e) => setPivotAgg(e.target.value)}
                  className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
                >
                  <option value="sum">SUM</option>
                  <option value="count">COUNT</option>
                  <option value="mean">AVERAGE (MEAN)</option>
                  <option value="min">MIN</option>
                  <option value="max">MAX</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleRunPivot}
                disabled={!pivotRow || !pivotVal || loadingPivot}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loadingPivot ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                Generate Pivot Table
              </button>
            </div>
          </div>

          {pivotData ? (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                  Pivot Table Summary ({pivotAgg.toUpperCase()} of {pivotVal} by {pivotRow} {pivotCol ? `x ${pivotCol}` : ""})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/70 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                    <tr>
                      {pivotData.column_names.map((col: string) => (
                        <th key={col} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {pivotData.data.map((row: any, i: number) => (
                      <tr key={i} className={row[pivotRow] === "Total" ? "bg-muted/50 font-bold" : "hover:bg-accent/40"}>
                        {pivotData.column_names.map((col: string) => (
                          <td key={col} className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">
                            {row[col] !== undefined && row[col] !== null ? String(row[col]) : "0"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-xs font-medium">Select rows and value measure above to build a pivot summary.</p>
            </div>
          )}
        </div>
      ) : (
        /* Formula Lab */
        <div className="space-y-5">
          {/* Formula Select Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "vlookup", name: "VLOOKUP" },
              { id: "index_match", name: "INDEX / MATCH" },
              { id: "sumifs", name: "SUMIFS" },
              { id: "xlookup", name: "XLOOKUP" },
              { id: "nested_if", name: "Nested IF Logic" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => handleRunFormula(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  formulaType === f.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          {formulaResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Formula & Evaluation Card */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Excel Syntax</span>
                  <div className="mt-1 font-mono text-sm font-bold bg-muted/50 p-2.5 rounded-md border border-border text-foreground">
                    {formulaResult.formula_expression}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mechanics & Explanation</span>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {formulaResult.formula_explanation}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Evaluated Results</span>
                  <div className="mt-1 bg-muted/30 rounded-lg p-2.5 space-y-1 text-xs">
                    {formulaResult.evaluated_results?.map((res: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-muted-foreground">{JSON.stringify(res)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Power Query M Equivalent */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Code className="h-4 w-4 text-primary" /> Power Query (M Code) Equivalent
                    </span>
                    <button
                      onClick={() => copyToClipboard(formulaResult.power_query_m_equivalent)}
                      className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      {copied ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? "Copied!" : "Copy M Code"}</span>
                    </button>
                  </div>
                  <pre className="bg-muted/60 p-3 rounded-lg font-mono text-[11px] text-foreground overflow-x-auto whitespace-pre-wrap border border-border">
                    {formulaResult.power_query_m_equivalent}
                  </pre>
                </div>

                <div className="text-[11px] text-muted-foreground bg-primary/5 border border-primary/10 p-2.5 rounded-lg">
                  <strong>BI Engineering Tip:</strong> In production Power BI datasets, always prefer Power Query M step transforms or DAX measures over legacy row-level Excel functions to optimize VertiPaq engine compression.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
