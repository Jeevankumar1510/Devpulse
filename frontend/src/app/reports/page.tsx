"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  FileText,
  Download,
  Copy,
  CheckCircle,
  FileCode,
  Printer,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function ReportCenterPage() {
  const [reportType, setReportType] = useState("engineering_dora");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.generateReport(reportType, "markdown");
      setReportData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportType]);

  const copyMarkdown = () => {
    if (!reportData?.content) return;
    navigator.clipboard.writeText(reportData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    if (!reportData?.content) return;
    const blob = new Blob([reportData.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Automated Intelligence Report Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Generate and export publication-ready engineering velocity briefs, DORA assessments, and data audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyMarkdown}
            disabled={!reportData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors shadow-sm disabled:opacity-50"
          >
            {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied!" : "Copy Markdown"}</span>
          </button>
          <button
            onClick={downloadReport}
            disabled={!reportData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" /> Download .md
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: "engineering_dora", name: "Engineering Velocity & DORA Brief" },
          { id: "quality_audit", name: "Software & Data Quality Audit" },
          { id: "general_overview", name: "Executive Business Summary" },
        ].map((r) => (
          <button
            key={r.id}
            onClick={() => setReportType(r.id)}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-colors border ${
              reportType === r.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Rendered Report View */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm min-h-[500px]">
        {loading ? (
          <div className="flex h-96 items-center justify-center text-muted-foreground text-xs">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" /> Compiling Report...
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed font-sans">
            <pre className="font-mono text-xs p-4 rounded-xl bg-muted/40 border border-border whitespace-pre-wrap text-foreground overflow-x-auto">
              {reportData?.content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
